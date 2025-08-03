import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Register from "./components/Register";
import Login from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import React, { useEffect, useState } from "react";
import ThemeToggle from "./components/ThemeToggle";
import PostFeed from "./components/PostFeed";
import PostForm from "./components/PostForm";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute"; // 👈 NEW

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white relative">
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<Register isDarkMode={isDarkMode} />} />
          <Route path="/login" element={<Login isDarkMode={isDarkMode} />} />

          {/* ✅ Protected Routes Below */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard isDarkMode={isDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <>
                  <PostForm onPostCreated={() => window.location.reload()} />
                  <PostFeed />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
