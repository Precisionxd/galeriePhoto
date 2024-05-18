const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
const mongoUri = "mongodb://localhost:27017/photo_gallery";
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// User Schema and Model
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  profilePicture: String, // Added profilePicture field
});

const User = mongoose.model("User", UserSchema);

// Photo Schema and Model
const PhotoSchema = new mongoose.Schema({
  userId: String,
  filename: String,
  originalName: String,
  uploadDate: Date,
  description: String,
});

const Photo = mongoose.model("Photo", PhotoSchema);

// JWT Secret
const jwtSecret = "your_jwt_secret";

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    jwt.verify(bearerToken, jwtSecret, (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        req.user = authData;
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// User Registration
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).send("User registered");
  } catch (error) {
    res.status(500).send("Error registering user");
  }
});

// User Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });
      res.json({ token });
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    res.status(500).send("Error logging in");
  }
});

// Update User Password
app.post("/api/updatePassword", verifyToken, async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    res.status(200).send("Password updated successfully");
  } catch (error) {
    res.status(500).send("Error updating password");
  }
});

// Get User Information
app.get("/api/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    res.status(500).send("Error fetching user information");
  }
});

// Get All Users
app.get("/api/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).send("Error fetching users");
  }
});

// Modify the upload endpoint to accept descriptions
app.post(
  "/api/upload",
  verifyToken,
  upload.single("photo"),
  async (req, res) => {
    const { description } = req.body;
    const newPhoto = new Photo({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploadDate: new Date(),
      description: description || "",
    });
    try {
      await newPhoto.save();
      res.status(200).send("Photo uploaded successfully!");
    } catch (error) {
      res.status(500).send("Error uploading photo");
    }
  }
);

// Get User's Photos with Pagination
app.get("/api/photos", verifyToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const photos = await Photo.find({ userId: req.user.id })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Photo.countDocuments({ userId: req.user.id });
    res.json({
      photos,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send("Error fetching photos");
  }
});

// Update User Profile
app.post("/api/updateProfile", verifyToken, async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.username = username;
    await user.save();
    res.status(200).send("Profile updated successfully");
  } catch (error) {
    res.status(500).send("Error updating profile");
  }
});

// Delete Photo
app.delete("/api/photos/:id", verifyToken, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).send("Photo not found");
    }
    if (photo.userId !== req.user.id) {
      return res.status(403).send("Unauthorized");
    }
    await photo.remove();
    res.status(200).send("Photo deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting photo");
  }
});

// Search Photos by Description
app.get("/api/search", verifyToken, async (req, res) => {
  const { query } = req.query;
  try {
    const photos = await Photo.find({
      userId: req.user.id,
      description: { $regex: query, $options: "i" },
    });
    res.json(photos);
  } catch (error) {
    res.status(500).send("Error searching photos");
  }
});

// Comment Schema and Model
const CommentSchema = new mongoose.Schema({
  photoId: String,
  userId: String,
  comment: String,
  date: Date,
});

const Comment = mongoose.model("Comment", CommentSchema);

// Add Comment to Photo
app.post("/api/photos/:id/comments", verifyToken, async (req, res) => {
  const { comment } = req.body;
  const newComment = new Comment({
    photoId: req.params.id,
    userId: req.user.id,
    comment: comment,
    date: new Date(),
  });
  try {
    await newComment.save();
    res.status(200).send("Comment added successfully");
  } catch (error) {
    res.status(500).send("Error adding comment");
  }
});

// Get Comments for Photo
app.get("/api/photos/:id/comments", verifyToken, async (req, res) => {
  try {
    const comments = await Comment.find({ photoId: req.params.id });
    res.json(comments);
  } catch (error) {
    res.status(500).send("Error fetching comments");
  }
});

// Like Schema and Model
const LikeSchema = new mongoose.Schema({
  photoId: String,
  userId: String,
});

const Like = mongoose.model("Like", LikeSchema);

// Like Photo
app.post("/api/photos/:id/like", verifyToken, async (req, res) => {
  const newLike = new Like({
    photoId: req.params.id,
    userId: req.user.id,
  });
  try {
    await newLike.save();
    res.status(200).send("Photo liked successfully");
  } catch (error) {
    res.status(500).send("Error liking photo");
  }
});

// Get Likes for Photo
app.get("/api/photos/:id/likes", verifyToken, async (req, res) => {
  try {
    const likes = await Like.find({ photoId: req.params.id });
    res.json(likes.length);
  } catch (error) {
    res.status(500).send("Error fetching likes");
  }
});

// Add Profile Picture to User
app.post(
  "/api/user/profilePicture",
  verifyToken,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      user.profilePicture = req.file.filename;
      await user.save();
      res.status(200).send("Profile picture updated successfully");
    } catch (error) {
      res.status(500).send("Error updating profile picture");
    }
  }
);

// Get Profile Picture
app.get("/api/user/profilePicture", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.sendFile(path.join(__dirname, "uploads", user.profilePicture));
  } catch (error) {
    res.status(500).send("Error fetching profile picture");
  }
});

// Serve frontend files
app.use(express.static(path.join(__dirname, "frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start Server
app.listen(3000, () => console.log("Server started on port 3000"));
