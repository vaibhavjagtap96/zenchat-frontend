import React, { useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { getAvailableUsers } from "../api";
import { useChat } from "../context/ChatContext";

export default function SearchUserSidebar() {
  const searchInputRef = useRef();
  const { searchedUsers, setSearchedUsers, setOpenAddChat, setNewChatUser } = useChat();

  const searchUsers = async () => {
    const { data } = await getAvailableUsers(searchInputRef.current.value);
    setSearchedUsers(data.data?.users || []);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchUsers();
    if (!searchInputRef.current.value.trim()) setSearchedUsers(null);
  };

  const handleCreateChatClick = (user) => {
    setNewChatUser(user);
    setOpenAddChat(true);
  };

  return (
    <div className="w-full h-full bg-[#ffffff] dark:bg-[#111b21] flex flex-col transition-all duration-300">
      {/* 🔝 Header */}
      <div className="flex flex-col p-4 border-b border-gray-300 dark:border-[#2a3942]">
        <h1 className="text-lg font-semibold text-[#111b21] dark:text-[#e9edef]">
          Search Users
        </h1>

        {/* 🔍 Search Bar */}
        <div className="flex items-center bg-[#f0f2f5] dark:bg-[#202c33] mt-3 rounded-full px-3 py-2 shadow-sm">
          <BiSearch className="text-gray-500 dark:text-gray-300 text-xl" />
          <input
            type="text"
            ref={searchInputRef}
            onKeyDown={handleKeyDown}
            placeholder="Search by email or username"
            className="bg-transparent outline-none px-3 text-sm w-full text-gray-800 dark:text-gray-200"
          />
        </div>
      </div>

      {/* 💬 Search Results */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#374045]">
        {!searchedUsers ? (
          <div className="flex justify-center items-center h-[calc(100vh-200px)] px-4 text-center">
            <h2 className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Start a new conversation by searching for friends using their email or username.
            </h2>
          </div>
        ) : !searchedUsers.length ? (
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <h2 className="text-base text-gray-500 dark:text-gray-400">No users found</h2>
          </div>
        ) : (
          searchedUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => handleCreateChatClick(user)}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                hover:bg-[#f0f2f5] dark:hover:bg-[#202c33]"
            >
              {/* 🧑 Avatar + Info */}
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                />
                <div>
                  <h4 className="font-medium text-[#111b21] dark:text-[#e9edef] text-[15px] truncate">
                    {user.username}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate w-[180px]">
                    {user.email || "No email provided"}
                  </p>
                </div>
              </div>

              {/* ➕ Chat Button */}
              <button
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold rounded-lg px-3 py-1 transition-all duration-200"
              >
                + Chat
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
