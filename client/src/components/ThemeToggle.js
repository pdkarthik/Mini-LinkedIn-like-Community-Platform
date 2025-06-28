import React from "react";

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="absolute top-4 right-4 px-3 py-1 rounded border text-sm shadow bg-gray-200 dark:bg-gray-700 dark:text-white"
    >
      {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
};

export default ThemeToggle;
