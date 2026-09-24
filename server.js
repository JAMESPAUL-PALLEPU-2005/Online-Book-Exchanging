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

// DB Connection helper
let cachedDb = null;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing');
  }
  if (!cachedDb) {
    cachedDb = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB successfully.');
  }
  return cachedDb;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { username, email, password, mobile } = req.body;
  if (!username || !email || !password || !mobile) {
    return res.status(400).json({ error: 'Please fill in all details' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (mobile.trim().length !== 10) {
    return res.status(400).json({ error: 'Mobile number must be 10 digits' });
  }
  try {
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered' });
    }
    const newUser = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      mobile: mobile.trim()
    });
    await newUser.save();
    console.log(`User created successfully in MongoDB Atlas: ${newUser.username} (${newUser.email})`);
    return res.status(201).json({
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      mobile: newUser.mobile
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error during signup', details: err.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please fill in all details' });
  }
  try {
    const user = await User.findOne({ username: username.trim() });
    if (!user || user.password !== password.trim()) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    return res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      mobile: user.mobile
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// Get Books Route
app.get('/api/books', async (req, res) => {
  const { search } = req.query;
  try {
    let query = {};
    if (search && search.trim() !== '') {
      query = { title: { $regex: search, $options: 'i' } };
    }
    const books = await Book.find(query);
    const formattedBooks = books.map(b => ({
      id: b._id.toString(),
      title: b.title,
      author: b.author,
      imageLink: b.imageLink,
      userId: b.userId,
      username: b.username,
      email: b.email || '',
      mobileNumber: b.mobile
    }));
    return res.json(formattedBooks);
  } catch (err) {
    console.error('Get books error:', err);
    return res.status(500).json({ error: 'Server error fetching books' });
  }
});

// Add Book Route
app.post('/api/books', async (req, res) => {
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
      mobile: user.mobile
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
      mobileNumber: newBook.mobile
    });
  } catch (err) {
    console.error('Add book error:', err);
    return res.status(500).json({ error: 'Server error adding book' });
  }
});

// Delete Book Route
app.delete('/api/books/:id', async (req, res) => {
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
app.post('/api/requests', async (req, res) => {
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
      ownerMobile
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
      mobileNumber: newRequest.ownerMobile
    });
  } catch (err) {
    console.error('Add request error:', err);
    return res.status(500).json({ error: 'Server error adding borrow request' });
  }
});

// Get User Books / Requests Route
app.get('/api/user-data/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const yourBooks = await Book.find({ userId });
    const requestedBooks = await Request.find({ userId });
    
    return res.json({
      yourBooks: yourBooks.map(b => ({
        id: b._id.toString(),
        title: b.title,
        author: b.author,
        imageLink: b.imageLink,
        userId: b.userId,
        username: b.username,
        email: b.email || '',
        mobileNumber: b.mobile
      })),
      requestedBooks: requestedBooks.map(r => ({
        id: r._id.toString(),
        title: r.title,
        author: r.author,
        imageLink: r.imageLink,
        username: r.ownerUsername,
        email: r.ownerEmail || '',
        mobileNumber: r.ownerMobile
      }))
    });
  } catch (err) {
    console.error('Get user data error:', err);
    return res.status(500).json({ error: 'Server error fetching user data' });
  }
});

// Delete Request Route
app.delete('/api/requests/:id', async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Request removed successfully' });
  } catch (err) {
    console.error('Delete request error:', err);
    return res.status(500).json({ error: 'Server error deleting request' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
