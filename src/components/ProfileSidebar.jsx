import React, { useState } from "react";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "../assets";
import { useAuth } from "../context/AuthContext";

export default function ProfileSidebar() {
  const { user, logout } = useAuth();
  const [isColapsed, setIsColapsed] = useState(false);

  const colapseFieldValues = [
    { title: "Name", value: user.username },
    { title: "Email", value: user.email },
  ];

  return (
    <div className="w-[380px] md:w-screen h-full bg-[#f0f2f5] dark:bg-[#111b21] px-6 py-6 flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-300 dark:border-[#2a3942] pb-4">
        <h1 className="text-xl font-semibold text-[#111b21] dark:text-[#e9edef]">
          Profile
        </h1>
        <button
          onClick={logout}
          className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center text-center mt-8">
        <img
          className="w-32 h-32 rounded-full object-cover border-4 border-[#25D366] shadow-md"
          src={user?.avatarUrl || "https://via.placeholder.com/150"}
          alt={user?.username}
          loading="lazy"
        />
        <h2 className="text-2xl font-semibold text-[#111b21] dark:text-[#e9edef] mt-4">
          {user?.username || "User"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {user?.bio || "Hey there! I am using ZenChat"}
        </p>
      </div>

      {/* About Section */}
      <div className="mt-8 bg-white dark:bg-[#202c33] rounded-lg shadow-md overflow-hidden">
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
          onClick={() => setIsColapsed(!isColapsed)}
        >
          <span className="font-medium text-[#111b21] dark:text-[#e9edef]">
            About
          </span>
          <span className="text-2xl text-gray-500 dark:text-gray-400">
            {isColapsed ? <RiArrowDropUpLine /> : <RiArrowDropDownLine />}
          </span>
        </div>

        {isColapsed && (
          <div className="px-5 py-3 border-t border-gray-200 dark:border-[#2a3942]">
            {colapseFieldValues.map(({ title, value }, index) => (
              <div key={index} className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                  {title}
                </p>
                <h5 className="text-base text-[#111b21] dark:text-[#e9edef]">
                  {value || "Not Available"}
                </h5>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-auto text-center text-xs text-gray-400 dark:text-gray-500 pt-6">
        End-to-end encrypted 🔒
      </div>
    </div>
  );
}
