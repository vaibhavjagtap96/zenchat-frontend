import React, { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import {
  BiSearch,
  BsThreeDotsVertical,
  FaFile,
  FiImage,
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
      className={`relative flex w-full my-2 ${isOwnMessage ? "justify-end" : "justify-start"
        }`}
    >
      <div
        className={`relative group rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-sm leading-relaxed break-words ${isOwnMessage
          ? "bg-[#DCF8C6] dark:bg-green-800 text-black dark:text-white rounded-br-none"
          : "bg-white dark:bg-slate-800/60 text-black dark:text-white rounded-bl-none"
          }`}
      >
        {/* 
      <div
        className={`relative group rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-sm leading-relaxed break-words ${
          isOwnMessage
            ? "bg-[#DCF8C6] dark:bg-green-800 text-black dark:text-white rounded-br-none"
            : "bg-white/10 dark:bg-slate-800/60 text-black dark:text-white rounded-bl-none"
        }`}
      > */}
        {/* Attachments */}
        {message.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-2">
            {message.attachments.map((file) => {
              const ext = file.url.split(".").pop().toLowerCase();
              const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(
                ext
              );
              return (
                <div
                  key={file.url}
                  className="relative rounded-xl overflow-hidden group"
                  style={{ width: "150px" }}
                >
                  {isImage ? (
                    <img
                      src={file.url}
                      onClick={() => handleImageClick(file.url)}
                      className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform duration-200 rounded-xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center border border-gray-300/20 dark:border-gray-700/40 rounded-xl h-32 text-gray-600 dark:text-gray-200 cursor-pointer hover:scale-105 transition-transform duration-200">
                      <FaFile className="text-3xl mb-2" />
                      <p className="text-xs truncate w-[90%] text-center">
                        {limitChar(file.url.split("/").pop(), 12)}
                      </p>
                    </div>
                  )}

                  {/* Download Button */}
                  <div className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full p-2 cursor-pointer transition">
                    <PiDownloadSimpleBold
                      onClick={() => saveAs(file.url)}
                      className="text-white text-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Message Text */}
        {message.content && <p className="text-[15px]">{message.content}</p>}

        {/* Timestamp */}
        <div className="flex justify-end text-[11px] text-gray-500 dark:text-gray-300 mt-1">
          {moment(message.createdAt).fromNow(true)} ago
        </div>

        {/* Menu */}
        <div
          className={`absolute top-1 ${isOwnMessage ? "-left-6" : "-right-6"
            } text-gray-500 dark:text-gray-300`}
        >
          <OutsideClickHandler onOutsideClick={() => setShowMenu(false)}>
            <BsThreeDotsVertical
              className="cursor-pointer hover:text-gray-700 dark:hover:text-white text-lg"
              onClick={() => setShowMenu((prev) => !prev)}
            />
            {showMenu && (
              <div
                className={`absolute ${isOwnMessage ? "left-6" : "right-6"
                  } top-0 bg-white dark:bg-[#2a3942] text-sm rounded-md shadow-lg border border-gray-300 dark:border-gray-600 p-2 z-50 animate-fadeIn`}
              >
                <p
                  className="cursor-pointer text-gray-800 dark:text-gray-200 hover:text-green-500 mb-1"
                  onClick={() => {
                    navigator.clipboard.writeText(message.content);
                    setShowMenu(false);
                  }}
                >
                  Copy
                </p>
                <p
                  className="cursor-pointer text-red-400 hover:text-red-500"
                  onClick={() => {
                    deleteChatMessage(message._id);
                    setShowMenu(false);
                  }}
                >
                  Delete
                </p>

                {/* {user._id === message?.sender?._id && (
                  <p
                    className="cursor-pointer text-red-400 hover:text-red-500"
                    onClick={() => {
                      deleteChatMessage(message._id);
                      setShowMenu(false);
                    }}
                  >
                    Delete
                  </p>
                )} */}
              </div>
            )}
          </OutsideClickHandler>
        </div>

        {/* Image Viewer */}
        {isOpenView && (
          <ViewImage
            openView={isOpenView}
            setOpenView={setIsOpenView}
            imageUrl={imageUrl}
          />
        )}
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
    <div className="flex flex-col h-screen w-full bg-[#ECE5DD] dark:bg-[#121B22] transition-colors duration-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F0F2F5] dark:bg-[#1F2C34] shadow-md z-10">
        <div className="flex items-center gap-3">
          {/* ✅ Fixed Back Arrow Visibility */}
          <MdArrowBackIos
            onClick={() => setIsChatSelected(false)}
            className="text-gray-600 dark:text-white cursor-pointer text-2xl  hidden md:block transition-opacity duration-200"
          />
          <img
            src={opponent?.avatarUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
          <h3 className="font-medium text-lg text-gray-800 dark:text-gray-100 truncate">
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
          {currentSelectedChat.current?.admin?.toString() === user._id && (
            <MdDeleteOutline
              onClick={() => deleteUserChat(currentSelectedChat.current?._id)}
              className="text-red-500 cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-3 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
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
        <div className="px-4 py-2 flex flex-wrap gap-4 justify-start border-t border-gray-200/10 dark:border-gray-700">
          {attachments.map((file, i) => (
            <div key={i} className="relative rounded-xl w-[120px]">
              <RxCross2
                className="absolute top-1 right-1 text-red-500 cursor-pointer text-sm z-10"
                onClick={() => removeFileFromAttachments(i)}
              />
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-full h-24 rounded-xl object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center border border-gray-400/20 dark:border-gray-600/30 rounded-xl h-24 text-gray-600 dark:text-gray-100">
                  <FaFile className="text-2xl mb-1" />
                  <p className="text-xs truncate w-full text-center">
                    {file.name}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
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
          className="flex-1 px-4 py-2.5 rounded-full bg-white/10 dark:bg-slate-700/50 text-sm text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-green-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
        />

        <button
          disabled={!message && !attachments.length}
          onClick={sendChatMessage}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 rounded-full p-3 text-white transition active:scale-95"
        >
          <IoMdSend className="text-xl" />
        </button>
      </div>
    </div>
  );
}

/* Animation */
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
    animation: fadeIn 0.2s ease-out;
  }
`}</style>;
