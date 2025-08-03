const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve static files
app.use("/profilePics", express.static("profilePics"));
app.use(express.static(path.join(__dirname, "./client/build")));

// Ensure profilePics directory exists
const uploadPath = path.join(__dirname, "profilePics");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("📁 profilePics folder created");
} else {
  console.log("📁 profilePics folder already exists ✅");
}

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "profilePics");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// Cloudinary Config
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    match: [/^[A-Za-z\s]{2,50}$/, "Name must be 2-50 letters and spaces only"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format"],
  },
  password: {
    type: String,
    required: true,
    match: [
      /^(?=.*[A-Z])(?=.*\d).{6,}$/,
      "Must have 1 uppercase, 1 number, min 6 characters",
    ],
  },
  profilePic: { type: String, required: true },
  tasks: {
    type: [String],
    validate: {
      validator: (tasks) =>
        tasks.every((task) => typeof task === "string" && task.trim() !== ""),
      message: "All tasks must be non-empty strings",
    },
    default: [],
  },
  bio: {
    type: String,
    maxlength: 300,
    default: "",
  },
});

const User = mongoose.model("members", userSchema);

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "members" },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Post = mongoose.model("posts", postSchema);

// MongoDB Connection
const connectToMDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};
connectToMDB();


// Auth Routes
app.post("/register", upload.single("profilePic"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

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

app.post("/login", upload.none(), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.json({ status: "failure", msg: "User does not exist" });

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return res.json({ status: "failure", msg: "Invalid Password" });

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
    const userDetails = {
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      tasks: user.tasks || [],
      authToken: token,
    };

    res.json({ status: "success", data: userDetails });
  } catch (err) {
    res
      .status(500)
      .json({ status: "failure", msg: "Login failed", error: err.message });
  }
});

app.post("/validateToken", upload.none(), async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.authToken, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user)
      return res.json({ status: "failure", msg: "User does not exist" });

    const userDetails = {
      _id: user._id,
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

// ✅ Fixed: Create Post - reads JWT from Authorization header
app.post("/posts", upload.none(), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "failure",
        msg: "Missing or invalid Authorization header",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user)
      return res.status(401).json({ status: "failure", msg: "Unauthorized" });

    const newPost = await Post.create({
      author: user._id,
      content: req.body.content,
    });

    res.status(201).json({ status: "success", post: newPost });
  } catch (err) {
    res.status(500).json({
      status: "failure",
      msg: "Error creating post",
      error: err.message,
    });
  }
});

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "name");
    res.json({ status: "success", posts });
  } catch (err) {
    res.status(500).json({
      status: "failure",
      msg: "Error fetching posts",
      error: err.message,
    });
  }
});

// Get posts by user
app.get("/users/:id/posts", async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id }).sort({
      createdAt: -1,
    });
    res.json({ status: "success", posts });
  } catch (err) {
    res.status(500).json({
      status: "failure",
      msg: "Error fetching user's posts",
      error: err.message,
    });
  }
});

// Get user profile
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: "failure", msg: "Invalid user ID" });
  }

  try {
    const user = await User.findById(id).select("name email bio profilePic");
    if (!user) {
      return res.status(404).json({ status: "failure", msg: "User not found" });
    }

    res.json({ status: "success", user });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      msg: "Error fetching user",
      error: error.message,
    });
  }
});

app.get("/:any*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// Start server
const PORT = process.env.PORT || 4567;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
