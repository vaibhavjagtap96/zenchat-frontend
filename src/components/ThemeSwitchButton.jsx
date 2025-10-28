import React, { useContext } from "react";
import { PiSunLight } from "react-icons/pi";
import { IoIosMoon } from "react-icons/io";
import ThemeContext from "../context/ThemeContext";

export default function ThemeSwitchButton() {
  const { currentTheme, changeCurrentTheme } = useContext(ThemeContext);

  const handleButtonClick = () => {
    changeCurrentTheme(currentTheme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={handleButtonClick}
      className="cursor-pointer p-2 rounded-full transition-all duration-300 
                 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-yellow-400"
      aria-label="Toggle theme"
    >
      {currentTheme === "light" ? (
        <IoIosMoon size={22} />
      ) : (
        <PiSunLight size={22} />
      )}
    </button>
  );
}
