import React from "react";
import SideMenu from "../components/SideMenu";
import ChatLeftSidebar from "../components/ChatLeftSidebar";
import ChatsSection from "../components/ChatsSection";
import { AddChat } from "../components/AddChat";
import { useChat } from "../context/ChatContext";
import { useConnectWebRtc } from "../context/WebRtcContext";
import IncomingCall from "../components/IncomingCall";
import VideoChat from "../components/VideoChat";

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
      <div className="h-full w-full">
        <AddChat open={true} />
        {!!incomingOffer && (
          <IncomingCall
            incomingOffer={incomingOffer}
            active={!!incomingOffer}
          />
        )}
        <VideoChat show={showVideoComp} />

        <div className="w-full h-screen md:h-[calc(100vh-120px)] flex bg-[#f0f2f5] dark:bg-[#111b21] relative transition-colors duration-500">
          {/* 📱 Mobile Bottom SideMenu */}
          <div className="h-full md:h-fit md:absolute md:bottom-0 md:w-full md:hidden">
            <SideMenu
              setActiveLeftSidebar={setActiveLeftSidebar}
              activeLeftSidebar={activeLeftSidebar}
            />
          </div>

          {/* 💬 Left Sidebar */}
          <div>
            <ChatLeftSidebar activeLeftSidebar={activeLeftSidebar} />
          </div>

          {/* 💭 Chat Section */}
          <div
            className={`w-full md:${
              isChatSelected && activeLeftSidebar === "recentChats"
                ? ""
                : "hidden"
            }`}
          >
            {currentSelectedChat.current?._id ? (
              <ChatsSection />
            ) : (
              // 🌟 Modern Animated Empty Screen
              <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#e9edef] to-[#ffffff] dark:from-[#0b141a] dark:to-[#111b21] text-[#667781] dark:text-[#8696a0] relative overflow-hidden transition-colors duration-500">
                {/* Animated Background Circles */}
                <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-green-400/10 dark:bg-green-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>

                {/* Glassmorphic Card */}
                <div className="relative z-10 bg-white/70 dark:bg-[#1c1f24]/60 backdrop-blur-lg shadow-2xl rounded-3xl p-10 flex flex-col items-center justify-center max-w-md text-center border border-white/20 dark:border-[#2a3942]">
                  
                  {/* Animated Chat Bubble Icon */}
                  <div className="relative mb-8">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce"></div>
                    </div>
                    <div className="absolute inset-0 -z-10 blur-xl bg-green-500/30 rounded-full animate-pulse"></div>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl font-light mb-3 text-[#111b21] dark:text-white tracking-wide">
                    Welcome to ZenChat
                  </h1>

                  {/* Subtitle */}
                  <p className="text-[#667781] dark:text-[#aebac1] text-base leading-relaxed">
                    Start a conversation and stay connected with your friends.
                    <br />
                    Your messages are{" "}
                    <span className="font-semibold text-green-500">
                      end-to-end encrypted.
                    </span>
                  </p>

                  {/* Divider */}
                  <div className="w-2/3 border-t border-[#d1d7db] dark:border-[#2a3942] my-8"></div>

                  {/* CTA Button */}
                  <button className="px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium transition-all shadow-md hover:shadow-lg">
                    Start a New Chat
                  </button>
                </div>

                {/* Subtle Footer */}
                <p className="absolute bottom-6 text-sm text-[#8696a0] dark:text-[#667781] italic">
                  ZenChat © {new Date().getFullYear()} • Inspired by WhatsApp
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🖥️ Desktop SideMenu */}
      <div className="hidden md:block">
        <SideMenu
          setActiveLeftSidebar={setActiveLeftSidebar}
          activeLeftSidebar={activeLeftSidebar}
        />
      </div>
    </>
  );
}
