const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

app.use(cors());
app.use((req, res, next) => {
  console.log("➡️ Incoming request:", req.method, req.path);
  next();
});

// app.use(express.json());
app.use("/profilePics", express.static("profilePics"));
app.use(express.static(path.join(__dirname, "./client/build")));

// const uploadPath = path.join(__dirname, "profilePics");
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
//   console.log("profilePics folder created");
// } else {
//   console.log("profilePics folder already exists ✅");
// }

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "profilePics");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// Cloudinary Config
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Mongoose Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    match: [
      /^[A-Za-z\s]{2,50}$/,
      "Name must be 2-50 characters and contain only letters and spaces",
    ],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    match: [
      /^(?=.*[A-Z])(?=.*\d).{6,}$/,
      "Must have 1 uppercase, 1 number, min 6 characters",
    ],
  },
  profilePic: {
    type: String,
    required: [true, "Profile picture URL is required"],
  },
  tasks: {
    type: [String],
    validate: {
      validator: (tasks) =>
        tasks.every((task) => typeof task === "string" && task.trim() !== ""),
      message: "All tasks must be non-empty strings",
    },
    default: [],
  },
});

const User = mongoose.model("members", userSchema);

// DB Connect
const connectToMDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.log("❌ MongoDB connection error:", err);
  }
};

connectToMDB();

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// Register
app.post("/register", upload.single("profilePic"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Normalize tasks (array or single string)
    let tasksArray = [];
    if (Array.isArray(req.body.tasks)) {
      tasksArray = req.body.tasks;
    } else if (typeof req.body.tasks === "string") {
      tasksArray = [req.body.tasks];
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "failure", msg: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePicURL = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profilePics",
      });
      profilePicURL = result.secure_url;
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePic: profilePicURL,
      tasks: tasksArray,
    });

    await newUser.save();
    res.status(201).json({ status: "success", msg: "Registration successful" });
  } catch (err) {
    res.status(500).json({
      status: "failure",
      msg: "Internal Server Error",
      error: err.message,
    });
  }
});

// Login
app.post("/login", upload.none(), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.json({ status: "failure", msg: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (isPasswordCorrect) {
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
      const userDetails = {
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        tasks: user.tasks || [],
        authToken: token,
      };
      res.json({ status: "success", data: userDetails });
    } else {
      res.json({ status: "failure", msg: "Invalid Password" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ status: "failure", msg: "Login failed", error: err.message });
  }
});

// Validate Token
app.post("/validateToken", upload.none(), async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.authToken, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.json({ status: "failure", msg: "User does not exist" });
    }

    const userDetails = {
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      tasks: user.tasks || [],
    };

    res.json({ status: "success", data: userDetails });
  } catch (err) {
    res
      .status(401)
      .json({ status: "failure", msg: "Invalid token", error: err.message });
  }
});

app.listen(4567, () => console.log(`\nServer running on port 4567...\n`));
