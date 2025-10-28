import React, { useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { getAvailableUsers } from "../api";
import { useChat } from "../context/ChatContext";

const SearchedUsersResultCard = ({ user }) => {
  const { setOpenAddChat, setNewChatUser } = useChat();

  const handleCreateChatClick = () => {
    setNewChatUser(user);
    setOpenAddChat(true);
  };

  return (
    <div
      className="flex justify-between items-center p-3 rounded-lg cursor-pointer
      bg-[#ffffff] hover:bg-[#f5f6f6] dark:bg-[#202c33] dark:hover:bg-[#2a3942] 
      border-b border-gray-200 dark:border-[#2a3942] transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <img
          src={user.avatarUrl}
          alt={user.username}
          loading="lazy"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h3 className="font-medium text-[15px] text-gray-900 dark:text-gray-100">
            {user.username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.bio || "Hey there! I'm using ZenChat."}
          </p>
        </div>
      </div>
      <button
        onClick={handleCreateChatClick}
        className="bg-[#008069] hover:bg-[#017561] text-white text-xs px-3 py-1.5 rounded-full shadow-sm transition-all"
      >
        + Chat
      </button>
    </div>
  );
};

export default function SearchUserSidebar() {
  const searchInputRef = useRef();
  const { searchedUsers, setSearchedUsers } = useChat();

  const searchUsers = async () => {
    const { data } = await getAvailableUsers(searchInputRef.current.value);
    setSearchedUsers(data.data?.users || []);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchUsers();
    if (!searchInputRef.current.value.trim()) setSearchedUsers(null);
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-[#f0f2f5] dark:bg-[#111b21]
      transition-all duration-300"
    >
      {/* 🔝 Header */}
      <div className="p-4 border-b border-gray-300 dark:border-[#2a3942] bg-[#f0f2f5]/90 dark:bg-[#202c33]/90 backdrop-blur-md">
        <h1 className="text-lg font-semibold text-[#008069] dark:text-[#25D366] select-none">
          Search Users
        </h1>

        {/* 🔍 Search Bar */}
        <div className="flex items-center mt-3 bg-white dark:bg-[#2a3942] rounded-full px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#25D366] transition-all">
          <BiSearch className="text-gray-500 dark:text-gray-300 text-xl" />
          <input
            type="text"
            ref={searchInputRef}
            onKeyDown={handleKeyDown}
            placeholder="Search by username or email"
            className="bg-transparent outline-none px-3 text-sm w-full text-gray-800 dark:text-gray-200 placeholder-gray-500"
          />
        </div>
      </div>

      {/* 🔎 Search Results */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#374045] p-3">
        {!searchedUsers ? (
          <p className="text-center mt-10 text-gray-500 dark:text-gray-400">
            Start typing to find your friends!
          </p>
        ) : searchedUsers.length === 0 ? (
          <p className="text-center mt-10 text-gray-500 dark:text-gray-400">
            No users found 😕
          </p>
        ) : (
          searchedUsers.map((user) => (
            <SearchedUsersResultCard key={user._id} user={user} />
          ))
        )}
      </div>
    </div>
  );
}
