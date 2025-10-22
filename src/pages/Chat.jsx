import React, { useState } from "react";
import SideMenu from "../components/SideMenu";
import ChatLeftSidebar from "../components/ChatLeftSidebar";
import ChatsSection from "../components/ChatsSection";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { AddChat } from "../components/AddChat";
import { useChat } from "../context/ChatContext";
import VideoChat from "../components/VideoChat";
import { useConnectWebRtc } from "../context/WebRtcContext";
import IncomingCall from "../components/IncomingCall";

export default function Chat() {
  const {
    currentSelectedChat,
    activeLeftSidebar,
    setActiveLeftSidebar,
    isChatSelected,
  } = useChat();
  const { showVideoComp, incomingOffer } = useConnectWebRtc();

  return (
    <>
      <div className="h-full w-full ">
        <AddChat open={true} />
        {!!incomingOffer && (
          <IncomingCall
            incomingOffer={incomingOffer}
            active={!!incomingOffer}
          />
        )}

        <VideoChat show={showVideoComp} />
        <div className="w-full h-screen md:h-[calc(100vh-120px)] flex dark:bg-backgroundDark3 relative">
          <div className="h-full md:h-fit md:absolute md:bottom-0 md:w-full md:hidden">
            <SideMenu
              setActiveLeftSidebar={setActiveLeftSidebar}
              activeLeftSidebar={activeLeftSidebar}
            />
          </div>
          <div>
            <ChatLeftSidebar activeLeftSidebar={activeLeftSidebar} />
          </div>
          <div
            className={`w-full md:${isChatSelected && activeLeftSidebar === "recentChats"
                ? ""
                : "hidden"
              }`}
          >
            {currentSelectedChat.current?._id ? (
              <ChatsSection />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center bg-[#0b141a] text-white">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp Logo"
                  className="w-28 mb-6 opacity-80"
                />
                <h1 className="text-3xl font-semibold text-gray-200 mb-2">
                  WhatsApp Web
                </h1>
                <p className="text-gray-400 text-sm max-w-lg px-4 leading-relaxed">
                  Send and receive messages without keeping your phone online.
                  Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
                </p>
                <hr className="w-1/3 border-[#2a3942] mt-8" />
                <p className="text-gray-500 text-sm mt-4">No Chat Selected</p>
              </div>
            )}

          </div>
        </div>
      </div>
      <div className="hidden md:block ">
        <SideMenu
          setActiveLeftSidebar={setActiveLeftSidebar}
          activeLeftSidebar={activeLeftSidebar}
        />
      </div>
    </>
  );
}
