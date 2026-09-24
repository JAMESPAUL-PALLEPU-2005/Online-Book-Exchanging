const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// MongoDB User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
}, { timestamps: true });

// MongoDB Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageLink: { type: String, default: 'https://assets.ccbp.in/frontend/react-js/book-store-img.png' },
  userId: { type: String, required: true },
  username: { type: String, required: true },
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
  ownerMobile: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);
const Request = mongoose.model('Request', requestSchema);

// DB Connection helper
let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not defined.');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { username, password, mobile } = req.body;
  if (!username || !password || !mobile) {
    return res.status(400).json({ error: 'Please fill in all details' });
  }
  if (mobile.length !== 10) {
    return res.status(400).json({ error: 'Mobile number must be 10 digits' });
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const newUser = new User({ username, password, mobile });
    await newUser.save();
    return res.status(201).json({ id: newUser._id, username: newUser.username, mobile: newUser.mobile });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please fill in all details' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    return res.json({ id: user._id, username: user.username, mobile: user.mobile });
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
      title,
      author,
      imageLink: imageLink || 'https://assets.ccbp.in/frontend/react-js/book-store-img.png',
      userId: user._id.toString(),
      username: user.username,
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
  const { userId, bookId, title, author, imageLink, ownerUsername, ownerMobile } = req.body;
  try {
    const newRequest = new Request({
      userId,
      bookId,
      title,
      author,
      imageLink: imageLink || 'https://assets.ccbp.in/frontend/react-js/book-store-img.png',
      ownerUsername,
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
        mobileNumber: b.mobile
      })),
      requestedBooks: requestedBooks.map(r => ({
        id: r._id.toString(),
        title: r.title,
        author: r.author,
        imageLink: r.imageLink,
        username: r.ownerUsername,
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
