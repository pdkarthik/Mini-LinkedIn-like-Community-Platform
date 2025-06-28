import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const Login = () => {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      onValidateToken();
    }
  }, []);

  axios.defaults.baseURL = "";

  const onValidateToken = async () => {
    let dataToSend = new FormData();
    dataToSend.append("authToken", localStorage.getItem("authToken"));

    let response = await axios.post("/validateToken", dataToSend);

    if (response.data.status === "success") {
      dispatch({ type: "login", data: response.data.data });
      navigate("/dashboard");
    } else {
      alert(response.data.msg);
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const passwordRegex = /^.{6,}$/;

    if (!emailInputRef.current.value.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(emailInputRef.current.value)) {
      newErrors.email = "Invalid email format";
    }

    if (!passwordInputRef.current.value.trim()) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(passwordInputRef.current.value)) {
      newErrors.password = "Minimum 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onLogin = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    let dataToSend = new FormData();
    dataToSend.append("email", emailInputRef.current.value);
    dataToSend.append("password", passwordInputRef.current.value);

    let response = await axios.post("/login", dataToSend);

    if (response.data.status === "success") {
      localStorage.setItem("authToken", response.data.data.authToken);
      dispatch({ type: "login", data: response.data.data });
      navigate("/dashboard");
    } else alert(response.data.msg);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h2 className="text-2xl mb-4">Login</h2>
      <form className="flex flex-col w-80 text-left" onSubmit={onLogin}>
        <div className="flex flex-col text-left mb-4">
          <label className="dark:text-white">Email</label>
          <input
            type="text"
            placeholder="Email"
            ref={emailInputRef}
            className="p-2 border rounded w-full bg-white dark:bg-gray-800 dark:text-white"
          />
          {errors.email && (
            <p className="text-red-500 text-left text-sm">{errors.email}</p>
          )}
        </div>

        <div className="flex flex-col text-left mb-4">
          <label className="dark:text-white">Password</label>
          <input
            type="password"
            placeholder="Password"
            ref={passwordInputRef}
            className="p-2 border rounded w-full  bg-white dark:bg-gray-800 dark:text-white"
          />
          {errors.password && (
            <p className="text-red-500 text-left text-sm">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded mt-2"
        >
          Log in
        </button>
      </form>

      <p className="mt-4">
        Not a member yet?{" "}
        <Link to="/" className="text-blue-600 underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
