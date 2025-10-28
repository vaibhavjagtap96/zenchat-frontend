import React, { useEffect, useState } from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { LocalStorage } from "../utils";
import { useChat } from "../context/ChatContext";
import RecentUserChatCard from "./RecentUserChatCard";
import Loading from "./Loading";
import { useAuth } from "../context/AuthContext";

export default function RecentChatsSidebar() {
  const {
    currentUserChats,
    loadingChats,
    getCurrentUserChats,
    setMessages,
    getMessages,
    currentSelectedChat,
    isChatSelected,
    setIsChatSelected,
  } = useChat();
  const { user } = useAuth();

  const [filteredRecentUserChats, setFilteredRecentUserChats] = useState(null);

  // 🔍 Search filter handler
  const getFilteredRecentChats = (e) => {
    const { value } = e.target;
    const regex = new RegExp(value, "i");

    if (!value.trim()) {
      setFilteredRecentUserChats(currentUserChats);
      return;
    }

    const filtered = currentUserChats.filter((chat) => {
      if (chat.isGroupChat) return regex.test(chat.name);
      return chat.participants.some(
        (p) => p._id !== user._id && regex.test(p.username)
      );
    });

    setFilteredRecentUserChats(filtered);
  };

  useEffect(() => {
    getCurrentUserChats();
  }, []);

  useEffect(() => {
    setFilteredRecentUserChats(currentUserChats);
  }, [currentUserChats]);

  return (
    <div
      className={`w-full h-full md:${isChatSelected ? "hidden" : "block"} 
      bg-[#f0f2f5] dark:bg-[#111b21] flex flex-col transition-all duration-300`}
    >
      {/* 🟢 Header */}
      <div className="flex flex-col p-4 border-b border-gray-300 dark:border-[#2a3942] bg-[#f0f2f5]/90 dark:bg-[#202c33]/90 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold text-[#008069] dark:text-[#25D366] select-none">
            Chats
          </h1>
        </div>

        {/* 🔍 Search Bar */}
        <div className="flex items-center mt-3 bg-white dark:bg-[#2a3942] rounded-full px-3 py-2 shadow-sm 
        focus-within:ring-1 focus-within:ring-[#25D366] transition-all">
          <BiSearchAlt2 className="text-gray-500 dark:text-gray-300 text-xl" />
          <input
            type="text"
            onChange={getFilteredRecentChats}
            placeholder="Search or start new chat"
            className="bg-transparent outline-none px-3 text-sm w-full text-gray-800 dark:text-gray-200 placeholder-gray-500"
          />
        </div>
      </div>

      {/* 💬 Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#374045]">
        {loadingChats ? (
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <Loading />
          </div>
        ) : filteredRecentUserChats?.length === 0 ? (
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <h1 className="text-lg text-gray-500 dark:text-gray-400">
              No recent chats
            </h1>
          </div>
        ) : (
          filteredRecentUserChats?.map((chat) => (
            <div
              key={chat._id}
              className={`mx-2 mt-1 rounded-md hover:bg-[#e9edef] dark:hover:bg-[#2a3942] cursor-pointer ${
                currentSelectedChat.current?._id === chat._id
                  ? "bg-[#d9fdd3] dark:bg-[#005c4b]"
                  : ""
              }`}
              onClick={() => {
                if (currentSelectedChat.current?._id === chat._id) return;
                LocalStorage.set("currentSelectedChat", chat);
                currentSelectedChat.current = chat;
                setIsChatSelected(true);
                setMessages([]);
                getMessages(currentSelectedChat.current?._id);
              }}
            >
              <RecentUserChatCard
                chat={chat}
                isActive={currentSelectedChat.current?._id === chat._id}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
