import React, { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import mime from "mime-types";
import {
  BiSearch,
  BsThreeDotsVertical,
  FaFile,
  FiImage,
  ImEnlarge2,
  IoMdAttach,
  IoMdSend,
  IoVideocamOutline,
  MdArrowBackIos,
  MdDeleteOutline,
  PiDownloadSimpleBold,
  RxCross2,
} from "../assets";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import moment from "moment";
import Loading from "./Loading";
import { getOpponentParticipant, limitChar } from "../utils";
import OutsideClickHandler from "react-outside-click-handler";
import { useConnectWebRtc } from "../context/WebRtcContext";
import ViewImage from "./ViewImage";

const MessageCont = ({ isOwnMessage, isGroupChat, message }) => {
  const { deleteChatMessage } = useChat();
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [isOpenView, setIsOpenView] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const { user } = useAuth();

  const handleEnlargeClick = (url) => {
    setCurrentImageUrl(url);
    setIsOpenView(true);
  };

  return (
    <div className="w-auto flex my-2">
      <div
        className={`flex ${
          isOwnMessage ? "max-w-[50%] md:max-w-[85%] ml-auto" : "mr-auto"
        }`}
      >
        <div
          className={`flex flex-col justify-center relative min-w-[120px] max-w-full p-2 md:p-1 rounded-xl mb-5 ${
            isOwnMessage
              ? "bg-[#DCF8C6] dark:bg-[#005C4B] rounded-br-none"
              : "bg-white dark:bg-[#202C33] rounded-bl-none"
          } ${isOwnMessage ? "order-2" : "order-1"}`}
        >
          {message.attachments?.length ? (
            <div className="flex gap-1 flex-wrap">
              {message.attachments?.map((file) => (
                <div className="flex flex-col">
                  <div>
                    {(() => {
                      const fileExtension = file.url
                        .split("/")
                        .pop()
                        .toLowerCase()
                        .split(".")
                        .pop();
                      const isImage = [
                        "jpg",
                        "jpeg",
                        "png",
                        "webp",
                        "gif",
                        "svg",
                      ].includes(fileExtension);

                      if (isImage) {
                        return (
                          <img
                            src={file.url}
                            loading="lazy"
                            className={`${
                              message.attachments?.length > 1
                                ? "size-44"
                                : "size-72 md:size-60"
                            } object-cover rounded-md`}
                          />
                        );
                      } else {
                        return (
                          <div className="flex flex-col items-center justify-center">
                            <FaFile className="text-3xl text-slate-400" />
                            <p>
                              {limitChar(file.url.split("/").pop(), 10)}.
                              {fileExtension}
                            </p>
                          </div>
                        );
                      }
                    })()}
                    {isOpenView && (
                      <ViewImage
                        openView={isOpenView}
                        setOpenView={setIsOpenView}
                        imageUrl={currentImageUrl}
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-3 rounded-sm">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleEnlargeClick(file.url)}
                    >
                      <ImEnlarge2 className="dark:text-white text-gray-600" />
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        saveAs(file.url, file.url.split("/").slice(-1));
                      }}
                    >
                      <PiDownloadSimpleBold className="text-xl dark:text-white text-gray-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}
          <p className="p-2 md:p-2 text-base md:text-md text-slate-900 dark:text-slate-100">
            {message.content}
          </p>

          <div className="flex items-center gap-1 text-xs text-slate-400 absolute bottom-0 right-1">
            <span className="text-[10px]">
              {moment(message.createdAt)
                .add("TIME_ZONE", "hours")
                .fromNow(true)}{" "}
              ago
            </span>
          </div>
        </div>
        <div
          className={`mx-3 md:mx-0 ${isOwnMessage ? "order-1" : "order-2"}`}
        >
          <div className="relative cursor-pointer text-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
            <OutsideClickHandler
              onOutsideClick={() => setShowMessageMenu(false)}
            >
              <BsThreeDotsVertical
                onClick={() => setShowMessageMenu(!showMessageMenu)}
              />
              {showMessageMenu ? (
                <div className="text-slate-100 bg-[#2A3942] p-2 text-sm rounded-md absolute top-0 -left-14">
                  <p
                    onClick={() => {
                      navigator.clipboard.writeText(message.content);
                      setShowMessageMenu(false);
                    }}
                    className="mb-1 hover:text-slate-300"
                  >
                    Copy
                  </p>
                  <p
                    onClick={() => deleteChatMessage(message._id)}
                    className={`text-red-400 hover:text-red-500 ${
                      user._id !== message?.sender._id && "hidden"
                    }`}
                  >
                    Delete
                  </p>
                </div>
              ) : (
                ""
              )}
            </OutsideClickHandler>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChatsSection() {
  const {
    messages,
    currentSelectedChat,
    loadingMessages,
    message,
    setMessage,
    sendChatMessage,
    attachments,
    setAttachments,
    removeFileFromAttachments,
    deleteUserChat,
    setIsChatSelected,
  } = useChat();
  const { user } = useAuth();

  const opponentParticipant = getOpponentParticipant(
    currentSelectedChat.current?.participants,
    user._id
  );

  const opponentUsername = opponentParticipant?.username;
  const opponentProfilePictureUrl = opponentParticipant?.avatarUrl;

  const scrollToBottomRef = useRef();

  const scrollToBottom = () => {
    scrollToBottomRef.current?.scrollIntoView();
  };

  const { handleCall, setTargetUserId, targetUserId } = useConnectWebRtc();

  const handleCallButtonClick = async () => {
    if (opponentParticipant?._id) {
      setTargetUserId(opponentParticipant?._id);
    }
  };

  useEffect(() => {
    if (targetUserId) {
      handleCall();
    }
  }, [targetUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="overflow-y-hidden bg-[#ECE5DD] dark:bg-[#0B141A] transition-colors duration-300">
      {/* Header Section */}
      <div className="flex w-full items-center justify-between p-5 md:p-4 bg-[#F0F2F5] dark:bg-[#202C33] shadow-md transition-colors duration-300">
        <div className="flex gap-3 items-center">
          <div onClick={() => setIsChatSelected(false)}>
            <MdArrowBackIos className="hidden md:block text-gray-700 dark:text-white text-2xl" />
          </div>
          {currentSelectedChat.current.isGroupChat ? (
            <div className="w-10 relative h-10 flex-shrink-0 flex justify-start items-center flex-nowrap mr-3">
              {currentSelectedChat.current.participants
                .slice(0, 3)
                .map((participant, i) => (
                  <img
                    key={participant._id}
                    src={participant.avatarUrl}
                    className={`w-10 h-10 border-white rounded-full absolute outline outline-3 outline-black ${
                      i === 0
                        ? "left-0 z-30"
                        : i === 1
                        ? "left-2 z-20"
                        : "left-4 z-10"
                    }`}
                  />
                ))}
            </div>
          ) : (
            <img
              className="size-10 rounded-full object-cover"
              src={opponentProfilePictureUrl}
              alt=""
              loading="lazy"
            />
          )}
          <h3 className="font-medium text-xl md:text-md text-gray-900 dark:text-white">
            {currentSelectedChat.current?.isGroupChat
              ? currentSelectedChat.current.name
              : opponentUsername}
          </h3>
        </div>

        <div className="text-xl flex gap-5">
          <div className="cursor-pointer text-gray-700 dark:text-white hover:opacity-80">
            <BiSearch />
          </div>
          <div className="cursor-pointer text-gray-700 dark:text-white hover:opacity-80">
            {!currentSelectedChat.current?.isGroupChat && (
              <IoVideocamOutline onClick={handleCallButtonClick} />
            )}
          </div>
          <div className="cursor-pointer text-red-500 dark:text-red-400">
            {currentSelectedChat.current?.admin.toString() === user._id ? (
              <MdDeleteOutline
                onClick={() => deleteUserChat(currentSelectedChat.current?._id)}
              />
            ) : (
              ""
            )}
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="chat-msg-cont relative overflow-auto px-4 md:px-2 w-full h-[calc(100vh-180px)] md:h-[calc(100vh-260px)]">
        {loadingMessages ? (
          <div className="h-full w-full flex items-center justify-center">
            <Loading />
          </div>
        ) : !messages?.length ? (
          <div className="h-full w-full flex items-center justify-center">
            <h1 className="text-2xl text-slate-400 dark:text-slate-500">
              No Messages Yet...
            </h1>
          </div>
        ) : (
          <>
            {messages?.map((msg) => (
              <MessageCont
                key={msg._id}
                isOwnMessage={msg.sender?._id === user?._id}
                isGroupChatMessage={currentSelectedChat.current?.isGroupChat}
                message={msg}
              />
            ))}
            <div ref={scrollToBottomRef} />
          </>
        )}
      </div>

      {/* Attachment Preview */}
      {!!attachments.length && (
        <div className="showAttachmentFiles absolute bottom-24 grid grid-cols-5 gap-2">
          {attachments?.map((file, index) => (
            <div
              key={index}
              className="px-2 bg-[#075E54] bg-opacity-70 rounded-md flex flex-col items-center"
            >
              <div className="text-red-500 w-full">
                <RxCross2
                  className="float-right text-2xl cursor-pointer"
                  onClick={() => removeFileFromAttachments(index)}
                />
              </div>
              {file.type.startsWith("image/") ? (
                <img
                  className="w-full h-auto object-cover"
                  src={URL.createObjectURL(file)}
                  alt=""
                />
              ) : (
                <div className="flex flex-col gap-2 my-5 items-center">
                  <FaFile className="text-3xl text-white" />
                  <p className="text-xs text-slate-200">{file.name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div className="h-[90px] md:h-auto border-t border-[#ccc] dark:border-[#2A3942] bg-[#F0F2F5] dark:bg-[#202C33] w-full flex items-center justify-between p-4 md:p-2 transition-colors duration-300">
        <div className="flex-1 mr-4 md:mr-2">
          <input
            type="text"
            placeholder="Type a message"
            className="w-full h-full px-4 py-2 md:p-2 md:text-sm rounded-lg bg-white dark:bg-[#2A3942] focus:outline-none dark:text-white text-black"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendChatMessage();
            }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-4 md:space-x-2">
          <div>
            <label htmlFor="imageAttach" className="cursor-pointer">
              <FiImage className="text-[#128C7E] text-2xl md:text-md hover:opacity-80" />
            </label>
            <input
              type="file"
              accept="image/*"
              id="imageAttach"
              hidden
              multiple
              onChange={(e) => setAttachments([...e.target.files])}
            />
          </div>

          <div>
            <label htmlFor="fileAttach" className="cursor-pointer">
              <IoMdAttach className="text-[#128C7E] text-xl hover:opacity-80" />
            </label>
            <input
              type="file"
              id="fileAttach"
              hidden
              multiple
              onChange={(e) => setAttachments([...e.target.files])}
            />
          </div>

          <button
            disabled={!message && !attachments.length}
            onClick={sendChatMessage}
            className="bg-[#128C7E] hover:bg-[#25D366] transition-colors px-4 py-2 md:px-3 md:py-1 rounded-lg text-white"
          >
            <IoMdSend className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
