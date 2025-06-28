import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";

const Register = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);

  axios.defaults.baseURL = "";

  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(
        /^[A-Za-z\s]{2,50}$/,
        "Name must be 2-50 characters and contain only letters and spaces"
      )
      .required("Required"),
    email: Yup.string()
      .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format")
      .required("Required"),
    password: Yup.string()
      .matches(
        /^(?=.*[A-Z])(?=.*\d).{6,}$/,
        "Must contain 1 uppercase, 1 number, min 6 chars"
      )
      .required("Required"),
    tasks: Yup.array().of(Yup.string().required("Note cannot be empty")),
    profilePic: Yup.mixed()
      .required("Profile picture is required")
      .test(
        "fileSize",
        "File is too large",
        (value) => value && value.size <= 5 * 1024 * 1024
      )
      .test(
        "fileType",
        "Unsupported file type",
        (value) => value && /image\/.*/.test(value.type)
      ),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("profilePic", values.profilePic);
      values.tasks.forEach((task, i) => {
        formData.append(`tasks[${i}]`, task);
      });

      const res = await axios.post("/register", formData);
      if (res.data.status === "success") {
        alert(res.data.msg);
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
    setSubmitting(false);
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <h2 className="text-2xl mb-4">Register</h2>
      <Formik
        initialValues={{
          name: "",
          email: "",
          password: "",
          tasks: [],
          profilePic: null,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="flex flex-col w-full max-w-md gap-4">
            <div className="flex flex-col text-left w-full">
              <label htmlFor="name" className="font-medium dark:text-white">
                Name
              </label>
              <Field
                id="name"
                name="name"
                placeholder="Name"
                className="p-2 border rounded w-full dark:bg-gray-800 dark:text-white"
              />
              <ErrorMessage
                name="name"
                className="text-red-500"
                component="div"
              />
            </div>

            <div className="flex flex-col text-left w-full">
              <label htmlFor="email" className="font-medium dark:text-white">
                Email
              </label>
              <Field
                id="email"
                name="email"
                placeholder="Email"
                className="p-2 border rounded w-full dark:bg-gray-800 dark:text-white"
              />
              <ErrorMessage
                name="email"
                className="text-red-500"
                component="div"
              />
            </div>

            <div className="flex flex-col text-left w-full">
              <label htmlFor="password" className="font-medium dark:text-white">
                Password
              </label>
              <Field
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                className="p-2 border rounded w-full dark:bg-gray-800 dark:text-white"
              />
              <ErrorMessage
                name="password"
                className="text-red-500"
                component="div"
              />
            </div>

            <div className="flex flex-col text-left w-full">
              <label
                htmlFor="fileInput"
                className="font-medium dark:text-white"
              >
                Profile Picture
              </label>
              <label
                htmlFor="fileInput"
                className="cursor-pointer bg-gray-100 border p-2 rounded w-fit dark:bg-gray-700  dark:text-white"
              >
                Choose file
              </label>
              <input
                id="fileInput"
                name="profilePic"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setFieldValue("profilePic", file);
                  if (file) setPreview(URL.createObjectURL(file));
                }}
                className="hidden"
              />
              <ErrorMessage
                name="profilePic"
                component="div"
                className="text-red-500"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-full border shadow"
                />
              )}
            </div>

            <FieldArray name="tasks">
              {({ push, remove }) => (
                <div className="flex flex-col text-left gap-2 w-full">
                  <label className="font-medium dark:text-white">Notes</label>
                  {values.tasks.map((task, idx) => (
                    <div key={idx} className="flex gap-2 items-start w-full">
                      <Field
                        name={`tasks[${idx}]`}
                        as={TextareaAutosize}
                        minRows={3}
                        placeholder="Enter note"
                        className="p-2 border rounded w-full resize-y dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="bg-red-400 text-white px-2 rounded h-fit mt-1"
                      >
                        -
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => push("")}
                    className="bg-blue-500 text-white px-3 py-1 rounded w-fit"
                  >
                    + Add Note
                  </button>
                </div>
              )}
            </FieldArray>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 text-white p-2 rounded"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </Form>
        )}
      </Formik>
      <p className="mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Register;
