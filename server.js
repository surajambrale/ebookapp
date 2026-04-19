const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');

const app = express();

// 🔐 CORS (IMPORTANT 🔥)
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://ebookapp-gold.vercel.app' ,
     'https://ebookapp.onrender.com'// 🔴 CHANGE THIS
  ],
  credentials: true
}));

app.use(express.json());

const SECRET = "secret123";
// const ADMIN_PASSWORD = "admin123";
const ADMIN_PASSWORD = "swami-sai-(],1403()/,";


// ================= ADMIN =================

// 🔐 LOGIN
app.post('/admin-login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, SECRET, { expiresIn: '1h' }); // 🔥 expiry add
    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid password" });
});

// 🔐 VERIFY TOKEN
const verifyAdmin = (req, res, next) => {

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// 🔐 VERIFY API
app.get('/admin-verify', verifyAdmin, (req, res) => {
  res.json({ success: true });
});


// ================= DB =================

mongoose.connect('mongodb+srv://surajambrale9003:surajebook@cluster.3a07dkd.mongodb.net/bookApp')
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));


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


// ================= ADMIN DATA =================

// 👤 USERS
app.get('/admin/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error loading users" });
  }
});

// 💳 PURCHASES (WITH USER NAME)
app.get('/admin/purchases', verifyAdmin, async (req, res) => {
  try {

    const purchases = await Purchase.find();

    const result = await Promise.all(
      purchases.map(async (p) => {

        let user = null;

        // 🔥 FIX: ObjectId conversion
        if (mongoose.Types.ObjectId.isValid(p.userId)) {
          user = await User.findById(p.userId);
        }

        return {
          _id: p._id,
          bookId: p.bookId,
          paymentId: p.paymentId,

          userName: user ? user.name : "Unknown",
          userPhone: user ? user.phone : "N/A"
        };
      })
    );

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: 'Error loading purchases' });
  }
});

// ❌ DELETE USER
app.delete('/admin/user/:id', verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Delete error" });
  }
});

// ❌ DELETE PURCHASE
app.delete('/admin/purchase/:id', verifyAdmin, async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: "Purchase deleted" });
  } catch {
    res.status(500).json({ message: "Delete error" });
  }
});


// ================= AUTH =================

// REGISTER
app.post('/register', async (req, res) => {
  try {
    const { name, phone } = req.body;

     // 🔴 VALIDATE PHONE
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Name required' });
    }

    const existing = await User.findOne({ phone });

    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    await User.create({ name, phone });

    res.json({ message: 'Registered successfully' });

  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone' });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign({ id: user._id }, SECRET);

    res.json({ token, user });

  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});


// ================= PAYMENT =================

//test key
// const razorpay = new Razorpay({
//   key_id: "rzp_test_STqAGoxV34Jsne",
//   key_secret: "bfoAQJK911f9COnmbCndvYk5"
// });
//test key

//live key
const razorpay = new Razorpay({
  key_id: "rzp_live_SWeBwjvwGx2bSP",
  key_secret: "B1sb1uMvujMNwnGJ5aSlHx5Z"
});
//live key

// CREATE ORDER
app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR"
    });

    res.json(order);

  } catch {
    res.status(500).json({ message: 'Order failed' });
  }
});

// VERIFY PAYMENT
app.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      bookId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      // .createHmac("sha256", "B1sb1uMvujMNwnGJ5aSlHx5Z")  //testing key. "secret key".
      .createHmac("sha256", "B1sb1uMvujMNwnGJ5aSlHx5Z")  //live key. "secret key" add karna hai ider.
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment ❌' });
    }

    await Purchase.create({
      userId,
      bookId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

    res.json({ success: true });

  } catch {
    res.status(500).json({ message: 'Verification failed' });
  }
});


// ================= BOOK =================

app.get('/check/:userId/:bookId', async (req, res) => {
  const purchase = await Purchase.findOne({
    userId: req.params.userId,
    bookId: req.params.bookId
  });

  res.json({ access: !!purchase });
});

//uptime robot

// 🔥 KEEP ALIVE API (for Uptime Robot)
app.get('/ping', (req, res) => {
  res.status(200).send("Server alive 🚀");
});

//uptime robot

app.get('/book/:userId/:bookId', async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      userId: req.params.userId,
      bookId: req.params.bookId
    });

    if (!purchase) return res.status(403).send("Access Denied ❌");

    const filePath = path.join(__dirname, 'books', `${req.params.bookId}.pdf`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');

    res.sendFile(filePath);

  } catch {
    res.status(500).send("Error loading book");
  }
});


// ================= START =================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running 🚀"));