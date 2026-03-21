const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "secret123";

// MongoDB
mongoose.connect('mongodb+srv://surajambrale9003:surajebook@cluster.3a07dkd.mongodb.net/bookApp');

// SCHEMA
const userSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true }
});

const purchaseSchema = new mongoose.Schema({
  userId: String,
  bookId: String
});

const User = mongoose.model('User', userSchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);

// ✅ REGISTER
app.post('/register', async (req, res) => {
  const { name, phone } = req.body;

  const existing = await User.findOne({ phone });

  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ name, phone });

  res.json({ message: 'Registered successfully' });
});

// ✅ LOGIN
app.post('/login', async (req, res) => {
  const { phone } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({ token, user });
});

// ✅ SAVE PURCHASE
app.post('/purchase', async (req, res) => {
  const { userId, bookId } = req.body;

  await Purchase.create({ userId, bookId });

  res.json({ message: 'Purchase saved' });
});

// ✅ CHECK ACCESS
app.get('/check/:userId/:bookId', async (req, res) => {
  const purchase = await Purchase.findOne({
    userId: req.params.userId,
    bookId: req.params.bookId
  });

  res.json({ access: !!purchase });
});

app.listen(5000, () => console.log("Server running 🔥"));