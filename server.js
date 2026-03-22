const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "secret123";

// 🔗 MongoDB
mongoose.connect('mongodb+srv://surajambrale9003:surajebook@cluster.3a07dkd.mongodb.net/bookApp')
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

// 🔐 Razorpay config
const razorpay = new Razorpay({
  key_id: "rzp_test_STqAGoxV34Jsne",       // 🔴 CHANGE THIS
  key_secret: "bfoAQJK911f9COnmbCndvYk5"       // 🔴 CHANGE THIS
});

// 📦 SCHEMA
const userSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true }
});

const purchaseSchema = new mongoose.Schema({
  userId: String,
  bookId: String,
  paymentId: String,
  orderId: String
});

const User = mongoose.model('User', userSchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);



// ================= AUTH =================

// ✅ REGISTER
app.post('/register', async (req, res) => {
  try {
    const { name, phone } = req.body;

    const existing = await User.findOne({ phone });

    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, phone });

    res.json({ message: 'Registered successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ LOGIN
app.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign({ id: user._id }, SECRET);

    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



// ================= RAZORPAY =================

// 🧾 CREATE ORDER
app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR"
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: 'Order creation failed' });
  }
});


// ✅ VERIFY PAYMENT (REAL SECURITY)
app.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      bookId
    } = req.body;

    // 🔐 SIGNATURE VERIFY
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", "bfoAQJK911f9COnmbCndvYk5") // 🔴 SAME SECRET
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment ❌' });
    }

    // ✅ SAVE PURCHASE
    await Purchase.create({
      userId,
      bookId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: 'Verification failed' });
  }
});



// ================= ACCESS =================

// 🔍 CHECK ACCESS
app.get('/check/:userId/:bookId', async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      userId: req.params.userId,
      bookId: req.params.bookId
    });

    res.json({ access: !!purchase });

  } catch (err) {
    res.status(500).json({ message: 'Error checking access' });
  }
});

const path = require('path');

// 🔐 SECURE BOOK ACCESS API
app.get('/book/:userId/:bookId', async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    // 🔍 CHECK PURCHASE
    const purchase = await Purchase.findOne({ userId, bookId });

    if (!purchase) {
      return res.status(403).send("Access Denied ❌");
    }

    // 📂 PDF PATH
    const filePath = path.join(__dirname, 'books', `${bookId}.pdf`);


    //new added - 11am sunday
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="book.pdf"');
    //new added - 11am sunday
    
    res.sendFile(filePath);

  } catch (err) {
    res.status(500).send("Error loading book");
  }
});



// ================= START SERVER =================

// app.listen(5000, () => console.log("🚀 Server running on 5000"));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Server running 🚀"));