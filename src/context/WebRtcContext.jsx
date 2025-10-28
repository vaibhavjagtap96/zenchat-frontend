// WebRtcContextProvider.jsx
import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import socketio from "socket.io-client";
import { useAuth } from "./AuthContext";
import { ringtone } from "../assets";

const webRtcContext = createContext(null);

// connect to the signalling socket server
const connectToSigServer = (userId) => {
  return socketio(import.meta.env.VITE_SIGNALLING_SERVER_URL, {
    secure: true,
    rejectUnauthorized: false, // allow self-signed certs if any
    auth: { userId },
  });
};

// custom hook to access webRTC instance from context
const useConnectWebRtc = () => useContext(webRtcContext);

export default function WebRtcContextProvider({ children }) {
  // states
  const [socket, setSocket] = useState(null);
  const [targetUserId, setTargetUserId] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [callConnectionState, setCallConnectionState] = useState(null); // "initiated", "connecting", "connected"
  const [showVideoComp, setShowVideoComp] = useState(false);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [inputVideoDevices, setInputVideoDevices] = useState([]);
  const [inputAudioDevices, setInputAudioDevices] = useState([]);
  const [selectedInputVideoDevice, setSelectedInputVideoDevice] = useState();
  const [selectedInputAudioDevice, setSelectedInputAudioDevice] = useState();

  // refs
  const didIOffer = useRef(false); // boolean -> did current client create offer?
  const cameraFace = useRef("user");
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const peerConnectionRef = useRef(null);
  const audioRef = useRef();
  const remoteUserIdRef = useRef(null); // holds the other peer's userId (offerer/answerer)
  const { user } = useAuth();
  const userId = user?._id;

  // fetch user media
  const fetchUserMedia = async (facingMode = "user", videoDeviceId = null, audioDeviceId = null) => {
    try {
      const videoDeviceOptions = { facingMode };
      const audioDeviceOptions = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };

      if (videoDeviceId) videoDeviceOptions.deviceId = videoDeviceId;
      if (audioDeviceId) audioDeviceOptions.deviceId = audioDeviceId;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoDeviceOptions,
        audio: audioDeviceOptions,
      });

      // enumerate devices
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        const audioDevices = devices.filter((d) => d.kind === "audioinput");
        setInputVideoDevices(videoDevices);
        setInputAudioDevices(audioDevices);
      }

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      // set selected device ids if available
      const currentVideoDeviceId = stream.getVideoTracks()?.[0]?.getSettings()?.deviceId;
      const currentAudioDeviceId = stream.getAudioTracks()?.[0]?.getSettings()?.deviceId;
      if (currentVideoDeviceId) setSelectedInputVideoDevice(currentVideoDeviceId);
      if (currentAudioDeviceId) setSelectedInputAudioDevice(currentAudioDeviceId);
    } catch (error) {
      console.error("Error while fetching userMedia:", error);
    }
  };

  const replaceVideoAudioTracks = () => {
    if (!peerConnectionRef.current || !localStreamRef.current) return;

    // Replace video track
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === "video");
      if (sender) sender.replaceTrack(videoTrack).catch((e) => console.warn("replaceTrack video failed", e));
      else peerConnectionRef.current.addTrack(videoTrack, localStreamRef.current);
    }

    // Replace audio track
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === "audio");
      if (sender) sender.replaceTrack(audioTrack).catch((e) => console.warn("replaceTrack audio failed", e));
      else peerConnectionRef.current.addTrack(audioTrack, localStreamRef.current);
    }
  };

  // flip camera
  const flipCamera = async () => {
    cameraFace.current = cameraFace.current === "user" ? "environment" : "user";
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
    await fetchUserMedia(cameraFace.current);
    replaceVideoAudioTracks();
  };

  const changeVideoInputDevice = async (videoDeviceId) => {
    if (!videoDeviceId) return console.log("video input device id not provided");
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
    await fetchUserMedia(cameraFace.current, videoDeviceId);
    replaceVideoAudioTracks();
  };

  const changeAudioInputDevice = async (audioDeviceId) => {
    if (!audioDeviceId) return console.log("audio input device id not provided");
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
    await fetchUserMedia(cameraFace.current, null, audioDeviceId);
    replaceVideoAudioTracks();
  };

  // create RTC peer connection
  const createPeerConnection = async (offerObj = null) => {
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
        ],
      });

      // ensure remote video element receives the remote stream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }

      // ICE candidate handler
      peerConnectionRef.current.addEventListener("icecandidate", (event) => {
        if (!event.candidate || !socket) return;
        // server expects a payload with didIOffer and either sendToUserId or iceUserId (depending on server logic)
        const payload = {
          iceCandidate: event.candidate,
          didIOffer: !!didIOffer.current,
          // if we created the offer, sendToUserId should be the remote peer; if not, iceUserId should be remote peer (server logic)
          sendToUserId: didIOffer.current ? remoteUserIdRef.current : undefined,
          iceUserId: didIOffer.current ? userId : remoteUserIdRef.current,
        };
        socket.emit("sendIceCandidateToSignalingServer", payload);
      });

      peerConnectionRef.current.addEventListener("signalingstatechange", () => {
        console.log("Signaling state:", peerConnectionRef.current.signalingState);
      });

      peerConnectionRef.current.addEventListener("connectionstatechange", () => {
        console.log("Connection state:", peerConnectionRef.current.connectionState);
        setCallConnectionState(peerConnectionRef.current.connectionState);
      });

      // track event (add incoming tracks to remote stream)
      peerConnectionRef.current.addEventListener("track", (event) => {
        try {
          if (event.track) {
            // prefer event.track
            remoteStreamRef.current.addTrack(event.track);
          } else if (event.streams && event.streams[0]) {
            event.streams[0].getTracks().forEach((track) => {
              remoteStreamRef.current.addTrack(track);
            });
          }

          // ensure remote video gets the updated stream
          if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
          }
        } catch (e) {
          console.warn("Error handling remote track:", e);
        }
      });

      // add local tracks if available
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          try {
            peerConnectionRef.current.addTrack(track, localStreamRef.current);
          } catch (e) {
            console.warn("addTrack failed:", e);
          }
        });
      }

      // if offerObj provided (we are the answerer), set remote description
      if (offerObj?.offer) {
        await peerConnectionRef.current.setRemoteDescription(offerObj.offer);
      }
    } else if (offerObj?.offer) {
      // If connection exists and we were passed an offer, set remote description (answerer flow)
      await peerConnectionRef.current.setRemoteDescription(offerObj.offer);
    }
  };

  // handle call (offerer)
  const handleCall = async () => {
    if (!targetUserId) return console.log("other peer id not provided");
    remoteUserIdRef.current = targetUserId.trim();
    setCallConnectionState("initiated waiting to accept...");
    setShowVideoComp(true);
    await fetchUserMedia();
    await createPeerConnection();
    try {
      const newOffer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(newOffer);
      didIOffer.current = true;
      // emit the new offer to signalling server
      socket.emit("newOffer", { newOffer, sendToUserId: remoteUserIdRef.current });
    } catch (error) {
      console.error("error while calling", error);
    }
  };

  // hangup
  const handleHangup = () => {
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    // Clear remote stream
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = new MediaStream();
    }

    // Emit hangup to remote
    const otherId = didIOffer.current ? remoteUserIdRef.current : incomingOffer?.offererUserId || remoteUserIdRef.current;
    if (otherId && socket) {
      socket.emit("hangupCall", otherId);
    }

    setTargetUserId(null);
    didIOffer.current = false;
    remoteUserIdRef.current = null;
    setShowVideoComp(false);
    setIncomingOffer(null);
    if (audioRef.current) audioRef.current.pause();
    setInputVideoDevices([]);
  };

  // handle answer (answerer)
  const handleAnswerOffer = async (offerObj) => {
    try {
      // stop ringtone
      if (audioRef.current) audioRef.current.pause();

      // set remote user id from the incoming offer
      remoteUserIdRef.current = offerObj.offererUserId;

      await fetchUserMedia();
      await createPeerConnection(offerObj);
      setShowVideoComp(true);

      const answerOffer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answerOffer);

      // attach answer to offer object to send back
      offerObj.answer = answerOffer;

      // use standard socket.emit with callback ack to receive any ice candidates (server calls callback([]) in your server)
      socket.emit("newAnswer", offerObj, (ackCandidates = []) => {
        // ackCandidates (if any) -> add them
        if (Array.isArray(ackCandidates) && ackCandidates.length > 0) {
          ackCandidates.forEach((c) => {
            try {
              peerConnectionRef.current.addIceCandidate(c);
            } catch (e) {
              console.warn("failed to add ack ICE candidate", e);
            }
          });
        }
      });

      // mark that we did not create the original offer
      didIOffer.current = false;
    } catch (e) {
      console.error("handleAnswerOffer error:", e);
    }
  };

  const handleAddAnswer = async (offerObj) => {
    try {
      // Offerer receives the answer here
      await peerConnectionRef.current.setRemoteDescription(offerObj.answer);
      console.log("Offerer set remote description with answer");
    } catch (e) {
      console.error("handleAddAnswer error:", e);
    }
  };

  const handleAddIceCandidate = (iceCandidate) => {
    if (peerConnectionRef.current && iceCandidate) {
      try {
        peerConnectionRef.current.addIceCandidate(iceCandidate);
        console.log("addedIceCandidate");
      } catch (e) {
        console.warn("addIceCandidate failed:", e);
      }
    }
  };

  // incoming offer (signaling) handler
  const handleIncomingOffer = async (offer) => {
    // offer should be shape { offer: <RTCSessionDescriptionInit>, offererUserId }
    setIncomingOffer(offer);
    remoteUserIdRef.current = offer.offererUserId;
    if (audioRef.current) audioRef.current.play();
  };

  const HandleHangupCallReq = (confirmation) => {
    handleHangup();
  };

  // connect to signalling server
  useEffect(() => {
    if (!userId) return;
    const socketInstance = connectToSigServer(userId);
    setSocket(socketInstance);

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("newOfferAwaiting", handleIncomingOffer);
    socket.on("answerResponse", handleAddAnswer);
    socket.on("receivedIceCandidateFromServer", handleAddIceCandidate);
    socket.on("hangupCallReq", HandleHangupCallReq);

    return () => {
      socket.off("newOfferAwaiting", handleIncomingOffer);
      socket.off("answerResponse", handleAddAnswer);
      socket.off("receivedIceCandidateFromServer", handleAddIceCandidate);
      socket.off("hangupCallReq", HandleHangupCallReq);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // toggle mic
  const handleToggleMicrophone = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMicrophoneActive;
      });
      setIsMicrophoneActive((p) => !p);
    }
  };

  // toggle camera
  const handleToggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraActive;
      });
      setIsCameraActive((p) => !p);
    }
  };

  return (
    <webRtcContext.Provider
      value={{
        setTargetUserId,
        localVideoRef,
        targetUserId,
        remoteVideoRef,
        handleHangup,
        callConnectionState,
        handleCall,
        handleAnswerOffer,
        incomingOffer,
        showVideoComp,
        handleToggleMicrophone,
        handleToggleCamera,
        isMicrophoneActive,
        isCameraActive,
        audioRef,
        flipCamera,
        inputVideoDevices,
        inputAudioDevices,
        selectedInputVideoDevice,
        selectedInputAudioDevice,
        changeVideoInputDevice,
        changeAudioInputDevice,
      }}
    >
      <audio ref={audioRef} src={ringtone} loop />
      {children}
    </webRtcContext.Provider>
  );
}

export { useConnectWebRtc };
