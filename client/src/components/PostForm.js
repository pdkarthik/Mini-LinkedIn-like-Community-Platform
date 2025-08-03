import React, { useState } from "react";
import axios from "axios";
import { SendHorizonal } from "lucide-react";

const PostForm = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  axios.defaults.baseURL = "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      setMessage("❌ You must be logged in to post.");
      return;
    }

    try {
      const res = await axios.post(
        "/posts",
        { content },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.status === "success") {
        setMessage("✅ Your post is live!");
        setContent("");
        onPostCreated?.();
      } else {
        setMessage("⚠️ Couldn’t post: " + (res.data.msg || ""));
      }
    } catch (err) {
      setMessage("❌ Something went wrong while posting.");
      console.error("Post error:", err.response?.data || err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-white via-blue-50 to-white border border-gray-200 p-6 rounded-2xl shadow-md max-w-2xl mx-auto mb-6 transition hover:shadow-xl"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-3">✨ Start a Post</h3>

      <textarea
        className="w-full border border-gray-300 p-4 text-base rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-400 transition"
        rows="4"
        placeholder="What's on your mind today? 💭"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      ></textarea>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:scale-95"
        >
          <SendHorizonal className="w-4 h-4" />
          <span>Post</span>
        </button>

        {message && (
          <p
            className={`text-sm px-3 py-1 rounded-xl ${
              message.startsWith("✅")
                ? "bg-green-50 text-green-700"
                : message.startsWith("⚠️")
                ? "bg-yellow-50 text-yellow-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
};

export default PostForm;
