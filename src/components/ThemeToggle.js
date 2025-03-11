import React, { useState, useEffect } from "react";
import SunIcon from "./icons/SunIcon";
import MoonIcon from "./icons/MoonIcon";

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      onClick={toggleTheme}
      className={`fixed bottom-6 right-6 w-10 h-20 flex flex-col items-center rounded-full p-1 cursor-pointer transition-all duration-300
      ${
        isDarkMode
          ? "bg-[var(--button-bg-color)] shadow-lg"
          : "bg-gray-300 shadow-md"
      }`}
    >
      <div
        className={`w-8 h-8 bg-white rounded-full flex items-center justify-center transition-all duration-300
        ${isDarkMode ? "translate-y-10 shadow-md" : "translate-y-0 shadow-sm"}`}
      >
        {isDarkMode ? (
          <MoonIcon color="var(--moon-icon-color)" />
        ) : (
          <SunIcon color="var(--sun-icon-color)" />
        )}
      </div>
    </div>
  );
};

export default ThemeToggle;
