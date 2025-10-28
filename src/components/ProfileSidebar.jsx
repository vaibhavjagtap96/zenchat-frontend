import React, { useState } from "react";
import {
  RiArrowDropDownLine,
  RiArrowDropUpLine,
  RiLogoutCircleLine,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";

export default function ProfileSidebar() {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const details = [
    { title: "Name", value: user.username },
    { title: "Email", value: user.email },
  ];

  return (
    <div className="w-[380px] md:w-screen h-full bg-[#eae6df] dark:bg-[#0b141a] px-6 py-8 flex flex-col relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#008069] dark:text-[#25D366]">
          My Profile
        </h1>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
        >
          <RiLogoutCircleLine className="text-lg" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-white/70 dark:bg-[#202c33]/80 backdrop-blur-xl shadow-md rounded-2xl p-6 flex flex-col items-center">
        <img
          src={user.avatarUrl}
          alt={user.username}
          className="size-32 rounded-full object-cover border-4 border-[#25D366] shadow-md mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          {user.username}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-2">
          {user.bio || "Hey there! I’m using WhatsApp clone 💬"}
        </p>

        <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700 my-3"></div>

        <div className="w-full flex flex-col gap-1">
          <div
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex justify-between items-center cursor-pointer py-2 px-3 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#2a3942] transition-all"
          >
            <h3 className="text-gray-700 dark:text-gray-200 font-medium text-base">
              About
            </h3>
            {isCollapsed ? (
              <RiArrowDropUpLine className="text-[#008069] text-2xl" />
            ) : (
              <RiArrowDropDownLine className="text-[#008069] text-2xl" />
            )}
          </div>

          {/* Collapsible content */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              isCollapsed
                ? "max-h-48 opacity-100 mt-2"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="px-3">
              {details.map(({ title, value }, index) => (
                <div
                  key={index}
                  className="mb-3 p-3 bg-[#f7f8fa] dark:bg-[#2a3942] rounded-lg"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1 tracking-wider">
                    {title}
                  </p>
                  <h5 className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                    {value}
                  </h5>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer watermark */}
      <div className="absolute bottom-3 left-0 w-full text-center text-xs text-gray-500 dark:text-gray-600">
        WhatsApp Clone © 2025
      </div>
    </div>
  );
}
