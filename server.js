const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "secret123";

// 🔗 MongoDB connect
mongoose.connect('mongodb+srv://surajambrale9003:surajebook@cluster.3a07dkd.mongodb.net/?appName=Cluster');

// 📦 SCHEMAS
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

// 🔐 AUTH (Register + Login)
app.post('/auth', async (req, res) => {
  const { name, phone } = req.body;

  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({ name, phone });
  }

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({ token, user });
});

// 💳 SAVE PURCHASE
app.post('/purchase', async (req, res) => {
  const { userId, bookId } = req.body;

  await Purchase.create({ userId, bookId });

  res.send('Purchase saved');
});

// 🔍 CHECK ACCESS
app.get('/check/:userId/:bookId', async (req, res) => {
  const purchase = await Purchase.findOne({
    userId: req.params.userId,
    bookId: req.params.bookId
  });

  if (purchase) {
    res.json({ access: true });
  } else {
    res.json({ access: false });
  }
});

app.listen(5000, () => console.log("Server running on 5000"));