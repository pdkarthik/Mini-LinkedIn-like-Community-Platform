import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

export const Dashboard = () => {
  const loginDetails = useSelector((state) => state.loginDetails);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!loginDetails || !loginDetails.email) {
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    navigate("/login");
    localStorage.removeItem("authToken");
    dispatch({ type: "login", data: {} });
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">
        Welcome, {loginDetails.name}
      </h2>

      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        {loginDetails.profilePic && (
          <img
            src={loginDetails.profilePic}
            alt="Profile"
            className="w-32 h-32 rounded-full border"
          />
        )}

        <div className="w-full text-left">
          <p className="dark:text-white">
            <strong>Email:</strong> {loginDetails.email}
          </p>
        </div>

        {Array.isArray(loginDetails.tasks) && loginDetails.tasks.length > 0 && (
          <div className="w-full mt-4 text-left">
            <h3 className="font-semibold mb-2 dark:text-white">Notes</h3>
            <ul className="list-disc list-inside dark:text-white">
              {loginDetails.tasks.map((task, i) => (
                <li key={i}>{task}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
      >
        Log out
      </button>
    </div>
  );
};
