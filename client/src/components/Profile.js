import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { UserCircle2, Home, List, Pencil } from "lucide-react";

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [error, setError] = useState("");

  axios.defaults.baseURL = "";

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const res = await axios.post(
          "/validateToken",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.status === "success") {
          setCurrentUserId(res.data.user._id);
        }
      } catch {}
    };
    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    if (!id) {
      setError("Invalid user ID.");
      return;
    }
    const fetchData = async () => {
      try {
        const u = await axios.get(`/users/${id}`);
        if (u.data.status === "success") setUser(u.data.user);
        else throw new Error("User not found");

        const p = await axios.get(`/users/${id}/posts`);
        if (p.data.status === "success") setPosts(p.data.posts);
        else throw new Error("Failed to load posts");
      } catch (err) {
        console.error(err);
        setError("⚠️ Unable to load profile.");
      }
    };
    fetchData();
  }, [id]);

  if (error)
    return (
      <div className="p-4 text-red-600 dark:text-red-400 text-center">
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  if (!user)
    return (
      <p className="p-4 text-gray-500 dark:text-gray-300 text-center italic">
        Loading profile...
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* 🔗 Conditional Navigation */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Profile
        </h1>
        {currentUserId === id && (
          <div className="flex gap-4">
            <Link
              to="/dashboard"
              className="text-blue-600 dark:text-blue-400 flex items-center gap-1 text-sm hover:underline"
            >
              <Home className="w-4 h-4" /> Dashboard
            </Link>
            <Link
              to="/create"
              className="text-purple-600 dark:text-purple-400 flex items-center gap-1 text-sm hover:underline"
            >
              <Pencil className="w-4 h-4" /> Start a Post
            </Link>
          </div>
        )}
        <Link
          to="/feed"
          className="text-green-600 dark:text-green-400 flex items-center gap-1 text-sm hover:underline"
        >
          <List className="w-4 h-4" /> All Posts
        </Link>
      </div>

      {/* 🧍 Profile Info */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 flex items-center gap-4">
        <UserCircle2 className="w-12 h-12 text-blue-500 dark:text-blue-400" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {user.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
          {user.bio && (
            <p className="mt-2 italic text-gray-700 dark:text-gray-300">
              "{user.bio}"
            </p>
          )}
        </div>
      </div>

      {/* 📝 Posts List */}
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300">
        Posts by {user.name}
      </h3>
      {posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic text-center">
          No posts yet.
        </p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-5 mb-4 hover:shadow-md transition"
          >
            <p className="text-gray-800 dark:text-gray-100">{post.content}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default Profile;
