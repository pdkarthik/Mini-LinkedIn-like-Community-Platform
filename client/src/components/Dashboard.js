import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, ArrowRight, List, Pencil } from "lucide-react";

export const Dashboard = () => {
  const loginDetails = useSelector((state) => state.loginDetails);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!loginDetails || !loginDetails.email) {
      navigate("/login");
    }
  }, [loginDetails, navigate]); // Added dependencies to trigger re-check on state change

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch({ type: "login", data: {} });
    navigate("/login");
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          👤 Dashboard
        </h2>
        <div className="flex gap-4">
          <Link
            to={`/profile/${loginDetails._id}`}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 text-sm"
          >
            Your Posts <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/feed"
            className="text-green-600 dark:text-green-400 hover:underline font-semibold flex items-center gap-1 text-sm"
          >
            All Posts <List className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-md p-6 flex flex-col items-center gap-4 transition hover:shadow-xl">
        {loginDetails.profilePic && (
          <img
            src={loginDetails.profilePic}
            alt="Profile"
            className="w-28 h-28 rounded-full border object-cover shadow-md"
          />
        )}

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
          Welcome,{" "}
          <span className="text-blue-600 dark:text-blue-400">
            {loginDetails.name || "User"}
          </span>
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
          <strong>Email:</strong> {loginDetails.email}
        </p>

        {/* Bio / Tasks */}
        {Array.isArray(loginDetails.tasks) && loginDetails.tasks.length > 0 && (
          <div className="w-full mt-4 text-left">
            <h4 className="text-gray-700 dark:text-gray-200 font-semibold mb-2">
              📝 Bio
            </h4>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm space-y-1">
              {loginDetails.tasks.map((task, i) => (
                <li key={i}>{task}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          {/* Start a Post */}
          <Link
            to="/feed"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition active:scale-95 shadow"
          >
            <Pencil className="w-4 h-4" />
            Start a Post
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition active:scale-95 shadow"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};
