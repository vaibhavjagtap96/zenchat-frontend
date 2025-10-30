import React, { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
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

const MessageCont = ({ isOwnMessage, message }) => {
  const { deleteChatMessage } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const [isOpenView, setIsOpenView] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const { user } = useAuth();

  const handleImageClick = (url) => {
    setImageUrl(url);
    setIsOpenView(true);
  };

  return (
    <div
      className={`relative flex w-full my-3 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {/* Chat Bubble */}
      <div
        className={`relative group rounded-2xl px-4 py-3 max-w-[75%] text-sm shadow-sm leading-relaxed ${
          isOwnMessage
            ? "bg-[#DCF8C6] dark:bg-green-800 text-black dark:text-white rounded-br-none"
            : "bg-white dark:bg-slate-700 text-black dark:text-white rounded-bl-none"
        }`}
      >
        {/* Message Attachments */}
        {message.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((file) => {
              const ext = file.url.split(".").pop().toLowerCase();
              const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
              return (
                <div key={file.url} className="relative">
                  {isImage ? (
                    <img
                      src={file.url}
                      onClick={() => handleImageClick(file.url)}
                      className="w-52 h-52 rounded-lg object-cover cursor-pointer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-md p-3">
                      <FaFile className="text-xl mb-1" />
                      <p className="text-xs">
                        {limitChar(file.url.split("/").pop(), 12)}
                      </p>
                    </div>
                  )}
                  {isOpenView && (
                    <ViewImage
                      openView={isOpenView}
                      setOpenView={setIsOpenView}
                      imageUrl={imageUrl}
                    />
                  )}
                  <div className="absolute bottom-1 right-1 flex gap-2">
                    <ImEnlarge2
                      onClick={() => handleImageClick(file.url)}
                      className="text-gray-500 dark:text-gray-300 text-sm cursor-pointer"
                    />
                    <PiDownloadSimpleBold
                      onClick={() => saveAs(file.url)}
                      className="text-gray-500 dark:text-gray-300 text-sm cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Message Text */}
        {message.content && (
          <p className="break-words text-[15px]">{message.content}</p>
        )}

        {/* Timestamp */}
        <div className="flex justify-end text-[11px] text-gray-500 dark:text-gray-300 mt-1">
          {moment(message.createdAt).fromNow(true)} ago
        </div>

        {/* ⋮ Three Dots Menu (Inside Bubble Corner) */}
        <div
          className={`absolute top-1 ${
            isOwnMessage ? "-left-6" : "-right-6"
          } text-gray-500 dark:text-gray-300`}
        >
          <OutsideClickHandler onOutsideClick={() => setShowMenu(false)}>
            <BsThreeDotsVertical
              className="cursor-pointer hover:text-gray-700 dark:hover:text-white text-lg"
              onClick={() => setShowMenu((prev) => !prev)}
            />
            {showMenu && (
              <div
                className={`absolute ${
                  isOwnMessage ? "left-6" : "right-6"
                } top-0 bg-white dark:bg-[#2a3942] text-sm rounded-md shadow-lg border border-gray-200 dark:border-gray-600 p-2 z-50 animate-fadeIn`}
              >
                <p
                  className="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-green-500 mb-1"
                  onClick={() => {
                    navigator.clipboard.writeText(message.content);
                    setShowMenu(false);
                  }}
                >
                  Copy
                </p>
                {user._id === message?.sender?._id && (
                  <p
                    className="cursor-pointer text-red-500 hover:text-red-600"
                    onClick={() => {
                      deleteChatMessage(message._id);
                      setShowMenu(false);
                    }}
                  >
                    Delete
                  </p>
                )}
              </div>
            )}
          </OutsideClickHandler>
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
  const opponent = getOpponentParticipant(
    currentSelectedChat.current?.participants,
    user._id
  );
  const scrollRef = useRef();
  const { handleCall, setTargetUserId, targetUserId } = useConnectWebRtc();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (targetUserId) handleCall();
  }, [targetUserId]);

  return (
    <div className="flex flex-col h-screen bg-[#ECE5DD] dark:bg-[#121B22] transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F0F2F5] dark:bg-[#1F2C34] shadow-md">
        <div className="flex items-center gap-3">
          <MdArrowBackIos
            onClick={() => setIsChatSelected(false)}
            className="text-gray-600 dark:text-white cursor-pointer text-xl"
          />
          <img
            src={opponent?.avatarUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
          <h3 className="font-medium text-lg text-gray-800 dark:text-gray-100">
            {currentSelectedChat.current?.isGroupChat
              ? currentSelectedChat.current.name
              : opponent?.username}
          </h3>
        </div>
        <div className="flex gap-4 text-gray-600 dark:text-gray-300 text-xl">
          <BiSearch className="cursor-pointer" />
          {!currentSelectedChat.current?.isGroupChat && (
            <IoVideocamOutline
              className="cursor-pointer"
              onClick={() => setTargetUserId(opponent?._id)}
            />
          )}
          {currentSelectedChat.current?.admin.toString() === user._id && (
            <MdDeleteOutline
              onClick={() => deleteUserChat(currentSelectedChat.current?._id)}
              className="text-red-500 cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto px-6 py-3 scrollbar-none">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loading />
          </div>
        ) : messages?.length ? (
          <>
            {messages.map((msg) => (
              <MessageCont
                key={msg._id}
                isOwnMessage={msg.sender?._id === user?._id}
                message={msg}
              />
            ))}
            <div ref={scrollRef}></div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              No Messages Yet...
            </p>
          </div>
        )}
      </div>

      {/* Attachments Preview */}
      {!!attachments.length && (
        <div className="absolute bottom-24 left-0 w-full px-4 grid grid-cols-5 gap-2">
          {attachments.map((file, i) => (
            <div
              key={i}
              className="bg-black/50 p-2 rounded-md relative flex flex-col items-center"
            >
              <RxCross2
                className="absolute top-1 right-1 text-red-500 cursor-pointer"
                onClick={() => removeFileFromAttachments(i)}
              />
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-full rounded-md object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FaFile className="text-white text-2xl" />
                  <p className="text-xs text-white">{file.name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="bg-[#F0F2F5] dark:bg-[#1F2C34] px-4 py-3 flex items-center gap-3 border-t dark:border-gray-700">
        <label htmlFor="imageAttach" className="cursor-pointer">
          <FiImage className="text-green-600 dark:text-green-400 text-2xl" />
        </label>
        <input
          type="file"
          id="imageAttach"
          accept="image/*"
          hidden
          multiple
          onChange={(e) => setAttachments([...e.target.files])}
        />

        <label htmlFor="fileAttach" className="cursor-pointer">
          <IoMdAttach className="text-green-600 dark:text-green-400 text-2xl" />
        </label>
        <input
          type="file"
          id="fileAttach"
          hidden
          multiple
          onChange={(e) => setAttachments([...e.target.files])}
        />

        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-full bg-white dark:bg-slate-700 text-sm text-gray-800 dark:text-white outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
        />

        <button
          disabled={!message && !attachments.length}
          onClick={sendChatMessage}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 rounded-full p-3 text-white transition"
        >
          <IoMdSend className="text-xl" />
        </button>
      </div>
    </div>
  );
}

/* ✨ Optional small CSS animation */
<style jsx>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.15s ease-out;
  }
`}</style>
