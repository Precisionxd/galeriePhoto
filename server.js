const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
const mongoUri = 'mongodb://localhost:27017/photo_gallery';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

// User Schema and Model
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', UserSchema);

// Photo Schema and Model
const PhotoSchema = new mongoose.Schema({
  userId: String,
  filename: String,
  originalName: String,
  uploadDate: Date
});

const Photo = mongoose.model('Photo', PhotoSchema);

// JWT Secret
const jwtSecret = 'your_jwt_secret';

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
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

// User Registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).send('User registered');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// Update User Password
app.post('/api/updatePassword', verifyToken, async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    res.status(200).send('Password updated successfully');
  } catch (error) {
    res.status(500).send('Error updating password');
  }
});

// Get User Information
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (error) {
    res.status(500).send('Error fetching user information');
  }
});

// Get All Users
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
});

// Photo Upload
app.post('/api/upload', verifyToken, upload.single('photo'), async (req, res) => {
  const newPhoto = new Photo({
    userId: req.user.id,
    filename: req.file.filename,
    originalName: req.file.originalname,
    uploadDate: new Date()
  });
  try {
    await newPhoto.save();
    res.status(200).send('Photo uploaded successfully!');
  } catch (error) {
    res.status(500).send('Error uploading photo');
  }
});

// Get User's Photos
app.get('/api/photos', verifyToken, async (req, res) => {
  try {
    const photos = await Photo.find({ userId: req.user.id });
    res.json(photos);
  } catch (error) {
    res.status(500).send('Error fetching photos');
  }
});

// Update User Profile
app.post('/api/updateProfile', verifyToken, async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    user.username = username;
    await user.save();
    res.status(200).send('Profile updated successfully');
  } catch (error) {
    res.status(500).send('Error updating profile');
  }
});

// Delete Photo
app.delete('/api/photos/:id', verifyToken, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).send('Photo not found');
    }
    if (photo.userId !== req.user.id) {
      return res.status(403).send('Unauthorized');
    }
    await photo.remove();
    res.status(200).send('Photo deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting photo');
  }
});


// Serve frontend files
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start Server
app.listen(3000, () => console.log('Server started on port 3000'));
