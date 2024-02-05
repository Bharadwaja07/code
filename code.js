const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const validator = require('validator');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define URL schema
const urlSchema = new mongoose.Schema({
  longURL: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 },
});

const Url = mongoose.model('Url', urlSchema);

// Define User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access denied');

  jwt.verify(token, 'secret', (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
};

// URL Shortening
app.post('/shorten', authenticateToken, async (req, res) => {
  const { longURL } = req.body;
  if (!validator.isURL(longURL)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const shortCode = shortid.generate();
  const url = new Url({ longURL, shortCode });
  await url.save();

  res.json({ shortURL: http://localhost:${PORT}/${shortCode} });
});

// Redirecting
app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  const url = await Url.findOne({ shortCode });

  if (!url) {
    return res.status(404).json({ error: 'URL not found' });
  }

  url.clicks++;
  await url.save();

  res.redirect(url.longURL);
});

// User Authentication
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ username: user.username }, 'secret');
  res.json({ token });
});

// User Dashboard
app.get('/dashboard', authenticateToken, async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  const urls = await Url.find({ longURL: user.longURL });

  res.json({ urls });
});

app.listen(PORT, () => console.log(Server running on http://localhost:${PORT}));