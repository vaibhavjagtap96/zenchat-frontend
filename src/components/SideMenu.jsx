import React, { useEffect, useState } from "react";
import { LuUser } from "react-icons/lu";
import { PiChats } from "react-icons/pi";
import { RiUserSearchLine, RiLogoutBoxLine } from "react-icons/ri";
import ThemeSwitchButton from "../components/ThemeSwitchButton";
import { useAuth } from "../context/AuthContext";

export default function SideMenu({ activeLeftSidebar, setActiveLeftSidebar }) {
  const { logout, user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const sideMenuOptions = [
    { Icon: PiChats, name: "recentChats", label: "Chats" },
    { Icon: RiUserSearchLine, name: "searchUser", label: "Search" },
    { Icon: LuUser, name: "profile", label: "Profile" },
  ];

  // Apply dark/light theme globally
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div
      className={`h-full w-[85px] flex flex-col justify-between items-center py-6 
        border-r shadow-[2px_0_10px_rgba(0,0,0,0.05)] transition-all duration-300
        ${
          isDarkMode
            ? "bg-gradient-to-b from-[#111b21] to-[#1f2c33] border-[#2a3942]"
            : "bg-gradient-to-b from-[#f9fafb] to-[#eef1f5] border-gray-200"
        }`}
    >
      {/* --- Top: Avatar --- */}
      <div className="flex flex-col items-center gap-4">
        <img
          src={
            user?.avatarUrl ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
          }
          alt="User Avatar"
          title={user?.username}
          className="w-12 h-12 rounded-full border border-[#00A884]/40 object-cover 
                     shadow-md hover:shadow-lg hover:scale-105 cursor-pointer 
                     transition-transform duration-300"
        />
      </div>

      {/* --- Middle: Menu --- */}
      <ul className="flex flex-col items-center gap-8 mt-8">
        {sideMenuOptions.map(({ Icon, name, label }, index) => (
          <li
            key={index}
            onClick={() => setActiveLeftSidebar(name)}
            className={`group relative flex flex-col items-center text-center 
                        cursor-pointer transition-all duration-300 ${
              name === activeLeftSidebar
                ? "text-[#00A884]"
                : isDarkMode
                ? "text-gray-400 hover:text-[#00A884]"
                : "text-gray-500 hover:text-[#00A884]"
            }`}
          >
            <div
              className={`text-3xl p-2 rounded-xl transition-all duration-300 ${
                name === activeLeftSidebar
                  ? "bg-[#E6F8F3] scale-110 shadow-md"
                  : isDarkMode
                  ? "hover:bg-[#2a3942]"
                  : "hover:bg-[#f1f5f9]"
              }`}
            >
              <Icon />
            </div>
            <span className="text-[11px] font-medium mt-1 opacity-80 group-hover:opacity-100">
              {label}
            </span>
            {name === activeLeftSidebar && (
              <span className="absolute left-[-10px] top-1/2 -translate-y-1/2 
                               w-[4px] h-[26px] bg-[#00A884] rounded-r-full shadow-sm"></span>
            )}
          </li>
        ))}
      </ul>

      {/* --- Bottom: Theme & Logout --- */}
      <div className="flex flex-col items-center gap-6 mt-auto">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Switch Theme"
          className={`p-3 rounded-xl cursor-pointer transition-all duration-300 
            hover:scale-110 active:scale-95
            ${
              isDarkMode
                ? "text-gray-300 hover:text-[#00A884] hover:bg-[#2a3942]"
                : "text-gray-600 hover:text-[#00A884] hover:bg-[#f1f5f9]"
            }`}
        >
          <ThemeSwitchButton size={55} />
        </button>

        <button
          onClick={logout}
          title="Logout"
          className={`p-2 rounded-xl text-gray-500 cursor-pointer transition-all duration-200 
            ${
              isDarkMode
                ? "hover:text-red-400 hover:bg-[#2a3942]"
                : "hover:text-red-500 hover:bg-[#fdecea]"
            }`}
        >
          <RiLogoutBoxLine size={28} />
        </button>
      </div>
    </div>
  );
}
