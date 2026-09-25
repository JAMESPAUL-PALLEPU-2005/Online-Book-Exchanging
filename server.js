const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true, trim: true },
}, { timestamps: true });

// MongoDB Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  imageLink: { type: String, default: 'https://assets.ccbp.in/frontend/react-js/book-store-img.png' },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String },
  mobile: { type: String, required: true },
}, { timestamps: true });

// MongoDB Request Schema
const requestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageLink: { type: String, default: 'https://assets.ccbp.in/frontend/react-js/book-store-img.png' },
  ownerUsername: { type: String },
  ownerEmail: { type: String },
  ownerMobile: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);
const Request = mongoose.model('Request', requestSchema);

// Helper to escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper to sanitize and normalize phone numbers
const normalizeMobile = (mobileStr) => {
  if (!mobileStr) return '';
  let cleaned = mobileStr.toString().replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
};

// DB Connection helper with auto-reconnect & state check
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing');
  }
  if (mongoose.connection.readyState === 2) {
    let count = 0;
    while (mongoose.connection.readyState === 2 && count < 20) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      count++;
    }
    if (mongoose.connection.readyState === 1) return;
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxIdleTimeMS: 30000,
  });
  console.log('Connected to MongoDB Atlas successfully.');
};

app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB Atlas connection error:', err);
    res.status(500).json({
      error: 'Database connection failed. Please ensure MongoDB Atlas is reachable.',
      details: err.message,
    });
  }
});

// Router for API endpoints
const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, email, password, mobile } = req.body;
  if (!username || !email || !password || !mobile) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }

  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const cleanedMobile = normalizeMobile(mobile);

  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (cleanedMobile.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
  }

  if (cleanPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long' });
  }

  try {
    // Check if username already exists (case-insensitive)
    const existingUsername = await User.findOne({
      username: { $regex: new RegExp(`^${escapeRegex(cleanUsername)}$`, 'i') },
    });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Check if email already registered
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const newUser = new User({
      username: cleanUsername,
      email: cleanEmail,
      password: cleanPassword,
      mobile: cleanedMobile,
    });
    await newUser.save();
    console.log(`User created successfully in MongoDB Atlas: ${newUser.username} (${newUser.email})`);

    return res.status(201).json({
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      mobile: newUser.mobile,
      message: 'Account created successfully in MongoDB Atlas',
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error during signup', details: err.message });
  }
});

// Login Route (Supports username OR email, case-insensitive)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please provide both username/email and password' });
  }

  const identifier = username.trim();
  const cleanPassword = password.trim();

  try {
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${escapeRegex(identifier)}$`, 'i') } },
        { email: identifier.toLowerCase() },
      ],
    });

    if (!user || user.password !== cleanPassword) {
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }

    return res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      message: 'Logged in successfully via MongoDB Atlas',
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login', details: err.message });
  }
});

// Get Books Route
router.get('/books', async (req, res) => {
  const { search } = req.query;
  try {
    let query = {};
    if (search && search.trim() !== '') {
      const reg = new RegExp(escapeRegex(search.trim()), 'i');
      query = {
        $or: [
          { title: { $regex: reg } },
          { author: { $regex: reg } },
        ],
      };
    }
    const books = await Book.find(query).sort({ createdAt: -1 });
    const formattedBooks = books.map((b) => ({
      id: b._id.toString(),
      title: b.title,
      author: b.author,
      imageLink: b.imageLink,
      userId: b.userId,
      username: b.username,
      email: b.email || '',
      mobileNumber: b.mobile,
    }));
    return res.json(formattedBooks);
  } catch (err) {
    console.error('Get books error:', err);
    return res.status(500).json({ error: 'Server error fetching books' });
  }
});

// Add Book Route
router.post('/books', async (req, res) => {
  const { title, author, imageLink, userId } = req.body;
  if (!title || !author || !userId) {
    return res.status(400).json({ error: 'Missing required book fields' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const newBook = new Book({
      title: title.trim(),
      author: author.trim(),
      imageLink: imageLink || 'https://assets.ccbp.in/frontend/react-js/book-store-img.png',
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      mobile: user.mobile,
    });
    await newBook.save();
    return res.status(201).json({
      id: newBook._id.toString(),
      title: newBook.title,
      author: newBook.author,
      imageLink: newBook.imageLink,
      userId: newBook.userId,
      username: newBook.username,
      email: newBook.email,
      mobileNumber: newBook.mobile,
    });
  } catch (err) {
    console.error('Add book error:', err);
    return res.status(500).json({ error: 'Server error adding book' });
  }
});

// Delete Book Route
router.delete('/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    await Request.deleteMany({ bookId: req.params.id });
    return res.json({ message: 'Book removed successfully' });
  } catch (err) {
    console.error('Delete book error:', err);
    return res.status(500).json({ error: 'Server error deleting book' });
  }
});

// Request Book Route
router.post('/requests', async (req, res) => {
  const { userId, bookId, title, author, imageLink, ownerUsername, ownerEmail, ownerMobile } = req.body;
  try {
    const newRequest = new Request({
      userId,
      bookId,
      title,
      author,
      imageLink: imageLink || 'https://assets.ccbp.in/frontend/react-js/book-store-img.png',
      ownerUsername,
      ownerEmail,
      ownerMobile,
    });
    await newRequest.save();
    return res.status(201).json({
      id: newRequest._id.toString(),
      userId: newRequest.userId,
      bookId: newRequest.bookId,
      title: newRequest.title,
      author: newRequest.author,
      imageLink: newRequest.imageLink,
      username: newRequest.ownerUsername,
      email: newRequest.ownerEmail,
      mobileNumber: newRequest.ownerMobile,
    });
  } catch (err) {
    console.error('Add request error:', err);
    return res.status(500).json({ error: 'Server error adding borrow request' });
  }
});

// Get User Books / Requests Route
router.get('/user-data/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const yourBooks = await Book.find({ userId }).sort({ createdAt: -1 });
    const requestedBooks = await Request.find({ userId }).sort({ createdAt: -1 });

    return res.json({
      yourBooks: yourBooks.map((b) => ({
        id: b._id.toString(),
        title: b.title,
        author: b.author,
        imageLink: b.imageLink,
        userId: b.userId,
        username: b.username,
        email: b.email || '',
        mobileNumber: b.mobile,
      })),
      requestedBooks: requestedBooks.map((r) => ({
        id: r._id.toString(),
        title: r.title,
        author: r.author,
        imageLink: r.imageLink,
        username: r.ownerUsername,
        email: r.ownerEmail || '',
        mobileNumber: r.ownerMobile,
      })),
    });
  } catch (err) {
    console.error('Get user data error:', err);
    return res.status(500).json({ error: 'Server error fetching user data' });
  }
});

// Delete Request Route
router.delete('/requests/:id', async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Request removed successfully' });
  } catch (err) {
    console.error('Delete request error:', err);
    return res.status(500).json({ error: 'Server error deleting request' });
  }
});

// Mount router on both '/api' and '/' to ensure full compatibility with Vercel and local dev
app.use('/api', router);
app.use('/', router);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
