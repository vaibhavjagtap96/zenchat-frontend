import React from "react";
import { LuUser, PiChats, RiUserSearchLine } from "../assets";
import ThemeSwitchButton from "../components/ThemeSwitchButton";
import { useAuth } from "../context/AuthContext";

export default function SideMenu({ activeLeftSidebar, setActiveLeftSidebar }) {
  const sideMenuOptions = [
    { Icon: LuUser, name: "profile" },
    { Icon: PiChats, name: "recentChats" },
    { Icon: RiUserSearchLine, name: "searchUser" },
  ];

  const { logout, user } = useAuth();

  return (
    <div className="side-menu h-full md:w-full md:h-[60px] md:px-4 w-[75px] flex flex-col items-center justify-between py-5 border-r-2 dark:border-none dark:bg-backgroundDark1 md:flex-row">
      {/* === USER PROFILE (Replaces Logo) === */}
      <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
        <img
          src={user?.avatarUrl || "https://via.placeholder.com/40"}
          alt="User Profile"
          className="size-10 rounded-full object-cover cursor-pointer border border-gray-300 dark:border-gray-600"
          loading="lazy"
        />
      </div>

      {/* === MENU ICONS === */}
      <ul className="flex flex-col gap-10 md:gap-8 md:flex-row items-center">
        {sideMenuOptions.map(({ Icon, name }, index) => (
          <li
            key={index}
            className={`text-3xl cursor-pointer hover:text-[#25D366] transition-all ${
              name === activeLeftSidebar
                ? "text-[#25D366]"
                : "text-slate-500 dark:text-slate-300"
            }`}
            onClick={() => setActiveLeftSidebar(name)}
          >
            <Icon />
          </li>
        ))}
      </ul>

      {/* === THEME + LOGOUT === */}
      <div className="flex flex-col gap-4 items-center md:flex-row md:gap-3">
        <ThemeSwitchButton />

        {/* Logout Button (always visible) */}
        <button
          onClick={logout}
          className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
