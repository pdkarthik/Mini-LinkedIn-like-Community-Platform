import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { UserCircle2, LayoutDashboard } from "lucide-react";

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const bottomRef = useRef(null);
  const firstLoad = useRef(true);
  const previousPosts = useRef([]);
  const [scrollOnNextUpdate, setScrollOnNextUpdate] = useState(false);

  axios.defaults.baseURL = "";

  // Fetch user + posts on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const res = await axios.post(
            "/validateToken",
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data?.status === "success") {
            setCurrentUserId(res.data.user._id);
          }
        } catch (err) {
          console.error("Token validation failed", err);
        }
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await axios.get("/posts");
        if (res.data.status === "success") {
          const sorted = res.data.posts.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );

          const prevLength = previousPosts.current.length;
          const newLength = sorted.length;

          setPosts(sorted);
          previousPosts.current = sorted;

          if (!firstLoad.current && newLength > prevLength) {
            setScrollOnNextUpdate(true);
          }

          firstLoad.current = false;
        }
      } catch (err) {
        console.error("Error fetching posts", err);
      }
    };

    fetchCurrentUser();
    fetchPosts();

    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new post added
  useEffect(() => {
    if (scrollOnNextUpdate) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setScrollOnNextUpdate(false);
      }, 150);
    }
  }, [posts, scrollOnNextUpdate]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-pink-600 dark:text-pink-400 drop-shadow-sm">
          💖 Posts
        </h2>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 font-medium text-lg"
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 italic">
            No posts yet... Be the first to share something! ✨
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-center text-sm mb-3 flex-wrap gap-2">
                {post.author?._id ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <UserCircle2 className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {post.author.name || "Unnamed"}
                    </span>
                    <Link to={`/profile/${post.author._id}`}>
                      <button className="px-3 py-1 bg-pink-500 hover:bg-pink-600 dark:bg-pink-400 dark:hover:bg-pink-500 text-white text-sm font-medium rounded-lg shadow-sm transition">
                        View Posts
                      </button>
                    </Link>
                  </div>
                ) : (
                  <span className="text-red-500 font-medium">
                    Unknown author
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-base whitespace-pre-line">
                {post.content}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default PostFeed;
