import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const webRtcContext = createContext();

export const useConnectWebRtc = () => useContext(webRtcContext);

export const WebRtcContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [callConnectionState, setCallConnectionState] = useState("disconnected");

  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(true);
  const [inputVideoDevices, setInputVideoDevices] = useState([]);
  const [inputAudioDevices, setInputAudioDevices] = useState([]);
  const [selectedInputVideoDevice, setSelectedInputVideoDevice] = useState("");
  const [selectedInputAudioDevice, setSelectedInputAudioDevice] = useState("");
  const [isFrontCamera, setIsFrontCamera] = useState(true); // 👈 track front/back camera

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();
  const localStreamRef = useRef();
  const cameraFace = useRef("user");

  // Initialize socket
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SIGNALING_SERVER_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // ✅ Fetch all input devices
  const fetchMediaDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setInputVideoDevices(devices.filter((d) => d.kind === "videoinput"));
    setInputAudioDevices(devices.filter((d) => d.kind === "audioinput"));
  };

  // ✅ Fetch camera & mic stream
  const fetchUserMedia = useCallback(
    async (facingMode = "user", videoDeviceId = null, audioDeviceId = null) => {
      try {
        const videoDeviceOptions = {};
        if (videoDeviceId) {
          videoDeviceOptions.deviceId = videoDeviceId;
        } else {
          videoDeviceOptions.facingMode =
            facingMode === "environment"
              ? { exact: "environment" }
              : "user";
        }

        const audioDeviceOptions = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        };
        if (audioDeviceId) audioDeviceOptions.deviceId = audioDeviceId;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoDeviceOptions,
          audio: audioDeviceOptions,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        localStreamRef.current = stream;
        fetchMediaDevices();
        return stream;
      } catch (err) {
        console.error("Error fetching user media:", err);
      }
    },
    []
  );

  // ✅ Replace media tracks without full reconnection
  const replaceVideoAudioTracks = useCallback(() => {
    if (!peerRef.current || !localStreamRef.current) return;

    const senders = peerRef.current._pc
      ? peerRef.current._pc.getSenders()
      : [];

    const videoTrack = localStreamRef.current
      .getVideoTracks()
      .find((track) => track.kind === "video");
    const audioTrack = localStreamRef.current
      .getAudioTracks()
      .find((track) => track.kind === "audio");

    if (videoTrack) {
      const videoSender = senders.find(
        (sender) => sender.track && sender.track.kind === "video"
      );
      videoSender?.replaceTrack(videoTrack);
    }

    if (audioTrack) {
      const audioSender = senders.find(
        (sender) => sender.track && sender.track.kind === "audio"
      );
      audioSender?.replaceTrack(audioTrack);
    }
  }, []);

  // ✅ Flip camera between front/back
  const flipCamera = async () => {
    cameraFace.current = cameraFace.current === "user" ? "environment" : "user";
    setIsFrontCamera(cameraFace.current === "user");
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    await fetchUserMedia(cameraFace.current);
    replaceVideoAudioTracks();
  };

  // ✅ Toggle camera on/off
  const handleToggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraActive(!isCameraActive);
    }
  };

  // ✅ Toggle mic on/off
  const handleToggleMicrophone = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicrophoneActive(!isMicrophoneActive);
    }
  };

  // ✅ Change video device
  const changeVideoInputDevice = async (deviceId) => {
    setSelectedInputVideoDevice(deviceId);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    await fetchUserMedia(cameraFace.current, deviceId, selectedInputAudioDevice);
    replaceVideoAudioTracks();
  };

  // ✅ Change audio device
  const changeAudioInputDevice = async (deviceId) => {
    setSelectedInputAudioDevice(deviceId);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    await fetchUserMedia(cameraFace.current, selectedInputVideoDevice, deviceId);
    replaceVideoAudioTracks();
  };

  // ✅ Hang up call
  const handleHangup = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setCallConnectionState("disconnected");
  };

  // ✅ Init on mount
  useEffect(() => {
    fetchUserMedia();
  }, [fetchUserMedia]);

  return (
    <webRtcContext.Provider
      value={{
        socket,
        callConnectionState,
        localVideoRef,
        remoteVideoRef,
        handleHangup,
        handleToggleCamera,
        handleToggleMicrophone,
        isCameraActive,
        isMicrophoneActive,
        flipCamera,
        inputVideoDevices,
        inputAudioDevices,
        selectedInputVideoDevice,
        selectedInputAudioDevice,
        changeVideoInputDevice,
        changeAudioInputDevice,
        isFrontCamera, // 👈 expose for VideoChat
      }}
    >
      {children}
    </webRtcContext.Provider>
  );
};
