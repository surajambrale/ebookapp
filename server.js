require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const axios = require('axios');

const Testimonial = require('./models/Testimonial');
//dns code start

const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

//dns code end

const app = express();

// const books = require('./data/books');
const books = require('./data/books');

// multer code start

const multer = require('multer');
const fs = require('fs');

// multer code end

// gmail code start
const nodemailer = require('nodemailer');
//gmail code end

// 🔐 CORS (IMPORTANT 🔥)
// app.use(cors({
//   origin: [
//     'http://localhost:4200',
//     'https://ebookapp-gold.vercel.app' ,
//      'https://ebookapp.onrender.com'
//   ],
//   credentials: true
// }));

app.use(cors({
  origin: [
    process.env.LOCAL_HOST_URL,
    process.env.FRONTEND_URL,
    process.env.RENDER_URL
  ],
  credentials: true
}));

app.use(express.json());

const SECRET = process.env.JWT_SECRET;
// const ADMIN_PASSWORD = "admin123";
// const ADMIN_PASSWORD = "swami-sai-(],1403()/,";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// notification bot code start

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// notification bot code end

// gmail code start
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // tera email
    pass: process.env.EMAIL_PASS // 🔥 app password
  }
});
//gmail code end

//gmail send function start

async function sendEmail({ userName, paymentId, bookId }) {
  try {
    await transporter.sendMail({
      from: 'ssbuilds.ebooks@gmail.com',
      to: 'ssbuilds.ebooks@gmail.com', // tu khud ko bhej raha hai
      subject: '📚 New Book Purchase 🚀',
      html: `
        <h2>New Purchase Alert</h2>
        <p><b>User:</b> ${userName}</p>
        <p><b>Book ID:</b> ${bookId}</p>
        <p><b>Payment ID:</b> ${paymentId}</p>
      `
    });

    console.log("Email sent ✅");
  } catch (err) {
    console.log("Email error ❌", err);
  }
}

//gmail send function end

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

mongoose.connect(process.env.MONGO_URI)
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
  orderId: String,
  amount: Number

  },{

  timestamps: true
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

          amount: p.amount,

  createdAt: p.createdAt,

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
// const razorpay = new Razorpay({
//   key_id: "rzp_live_SWeBwjvwGx2bSP",
//   key_secret: "B1sb1uMvujMNwnGJ5aSlHx5Z"
// });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ,
  key_secret: process.env.RAZORPAY_SECRET
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
      bookId,
      amount
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;


    const expectedSignature = crypto
      // .createHmac("sha256", "B1sb1uMvujMNwnGJ5aSlHx5Z")  //testing key. "secret key".
      .createHmac("sha256", process.env.RAZORPAY_SECRET)  //live key. "secret key" add karna hai ider.
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment ❌' });
    }

    await Purchase.create({
      userId,
      bookId,
      amount,
      // bookId: Number(bookId),
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      createdAt: new Date()
    });

     //gmail send code start

    // user name nikal
let user = await User.findById(userId);

// 🔥 EMAIL SEND
await sendEmail({
  userName: user ? user.name : "Unknown",
  paymentId: razorpay_payment_id,
  bookId: bookId
});
    //gmail send code end

      //notification bot code start

  await sendTelegram(`
📚 New Book Purchase 🚀

👤 User: ${user ? user.name : "Unknown"}
📱 Phone: ${user ? user.phone : "N/A"}
📖 Book: ${bookId}
💳 Payment: ${razorpay_payment_id}
`);

  //notification bot code end

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

// 📚 BOOK LIST
// const books = [
//   { id: "1", name: "Complete Fat Loss Guide" },
//   { id: "2", name: "1500-Calories Diet Plan" },
//   { id: "3", name: "Habits That Change Your Life" },
//   { id: "4", name: "Beginner Guide" },
//   { id: "5", name: "Diabetes Control" },
//   { id: "6", name: "PCOD / PCOS Guide" }
// ];

// const books = [

//   {
//     id: "1",
//     name: "Complete Fat Loss Guide",
//     price: 49,
//     image: "assets/images/fatloss-book.jpeg"
//   },

//   {
//     id: "2",
//     name: "1500-Calories Diet Plan",
//     price: 49,
//     image: "assets/images/1500-cal-diet.jpg"
//   },

//   {
//     id: "3",
//     name: "Habits That Change Your Life",
//     price: 49,
//     image: "assets/images/habits.jpg"
//   },

//   {
//     id: "4",
//     name: "Beginner Guide",
//     price: 49,
//     image: "assets/images/beginner-guide.jpg"
//   },

//   {
//     id: "5",
//     name: "Diabetes Control",
//     price: 49,
//     image: "assets/images/diabetes-control.jpg"
//   },

//   {
//     id: "6",
//     name: "PCOD / PCOS Guide",
//     price: 49,
//     image: "assets/images/pcod.jpg"
//   },
//   {
//     id: "7",
//     name: "Admin Testing Book",
//     price: 1,
//     image: "assets/images/admin-testing-book.jpg"
//   }

// ];

// 📚 GET BOOKS
app.get('/admin/books', verifyAdmin, (req, res) => {
  res.json(books);
});

//grant access api for admin panel
app.post('/admin/grant-access', verifyAdmin, async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({ message: "Missing data" });
    }

    const exists = await Purchase.findOne({ userId, bookId });

    if (exists) {
      return res.status(400).json({ message: "Already has access" });
    }

    await Purchase.create({
      userId,
      bookId,
      paymentId: "admin_manual",
      orderId: "admin_manual"
    });

    res.json({ message: "Access granted ✅" });

  } catch {
    res.status(500).json({ message: "Error ❌" });
  }
});
//grant access api for admin panel end

// notification bot code start

async function sendTelegram(msg) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: msg
    });
  } catch (err) {
    console.log("Telegram error");
  }
}


// notification bot code end

// ================= MY BOOKS =================

app.get('/my-books/:userId', async (req, res) => {

  try {

    const purchases = await Purchase.find({
      userId: req.params.userId
    });

    console.log("Purchases:", purchases);

    // 🔥 STRING + NUMBER BOTH HANDLE
    const purchasedIds = purchases.map(
      p => p.bookId.toString()
    );

    console.log("Purchased IDs:", purchasedIds);

    const userBooks = books.filter(
      book => purchasedIds.includes(book.id.toString())
    );

    console.log("User Books:", userBooks);

    res.json(userBooks);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: 'Error loading books'
    });

  }

});

// payment verification data start

// ================= PAYMENTS =================

app.get('/payments/:userId', async (req, res) => {

  try {

    // 🔥 USER PURCHASES
    const purchases = await Purchase.find({
      userId: req.params.userId
    });

    // 🔥 BOOKS + PAYMENT MERGE
    const paymentData = purchases.map((p) => {

      const book = books.find(
        b => b.id.toString() === p.bookId.toString()
      );

      return {

        paymentId: p.paymentId,

        bookTitle: book
          ? book.name
          : 'Unknown Book',

        amount: 49

      };

    });

    res.json(paymentData);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: 'Error loading payments'
    });

  }

});

//payment verification data end 


// ================= PROFILE DATA =================

app.get('/profile-data/:userId', async (req, res) => {

  try {

    const user = await User.findById(req.params.userId);

    if (!user) {

      return res.status(404).json({
        message: 'User not found'
      });

    }

    const purchases = await Purchase.find({
      userId: req.params.userId
    });

    // total payment calculate
    const totalSpent = purchases.length * 49;

    res.json({

      user,

      purchases,

      totalSpent

    });

  } catch (err) {

    res.status(500).json({
      message: 'Error loading profile'
    });

  }

});

// admin stats code start

// ================= ADMIN STATS =================

app.get('/admin/stats', verifyAdmin, async (req, res) => {

  try {

    // 👥 TOTAL USERS
    const totalUsers =
      await User.countDocuments();

    // 💳 TOTAL PURCHASES
    const totalPurchases =
      await Purchase.countDocuments();

    // 📚 TOTAL BOOKS
    const totalBooks =
      books.length;

    // 💰 TOTAL REVENUE
    const totalRevenue =
      totalPurchases * 49;

    // 🔥 RECENT PURCHASES
    const recentPurchases =
      await Purchase.find()
      .sort({ _id: -1 })
      .limit(5);

    const recentData =
      await Promise.all(

        recentPurchases.map(async (p) => {

          const user =
            await User.findById(p.userId);

          const book =
            books.find(
              b =>
              b.id.toString()
              ===
              p.bookId.toString()
            );

          return {

            userName:
              user
              ? user.name
              : 'Unknown',

            phone:
              user
              ? user.phone
              : 'N/A',

            bookName:
              book
              ? book.name
              : 'Unknown Book',

            paymentId:
              p.paymentId

          };

        })

      );

    res.json({

      totalUsers,

      totalPurchases,

      totalBooks,

      totalRevenue,

      recentPurchases:
        recentData

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message:
        'Stats loading error'

    });

  }

});

//admin stats code end

// multer code start

// ==========================
// 🔥 MULTER STORAGE
// ==========================

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    if (file.fieldname === 'image') {

      cb(null, 'uploads/images');

    } else {

      cb(null, 'uploads/pdfs');

    }

  },

  filename: function (req, file, cb) {

    cb(
      null,
      Date.now() + '-' + file.originalname
    );

  }

});

const upload = multer({ storage });


// ==========================
// 🔥 BOOK MODEL
// ==========================

const BookSchema = new mongoose.Schema({

  name: String,
  price: Number,
  category: String,

  image: String,
  pdf: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Book = mongoose.model('Book', BookSchema);


// ==========================
// 🔥 UPLOAD BOOK
// ==========================

app.post(
  '/admin/upload-book',

  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]),

  async (req, res) => {

    try {

      const {
        name,
        price,
        category
      } = req.body;

      const image =
        req.files['image'][0].filename;

      const pdf =
        req.files['pdf'][0].filename;

      const book = new Book({

        name,
        price,
        category,

        image,
        pdf

      });

      await book.save();

      res.json({
        success: true,
        message: 'Book Uploaded ✅'
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: 'Upload Error'
      });

    }

  }
);


// ==========================
// 🔥 GET ALL BOOKS
// ==========================

app.get('/admin/books-full', async (req, res) => {

  const books = await Book.find();

  res.json(books);

});


// ==========================
// 🔥 DASHBOARD ANALYTICS
// ==========================

app.get('/admin/dashboard-stats', async (req, res) => {

  try {

    const purchases =
      await Purchase.find();

    const users =
      await User.find();

    const totalRevenue =
      purchases.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );

    // 🔥 TODAY

    const today = new Date();

    today.setHours(0,0,0,0);

    const todayRevenue =
      purchases
        .filter(p =>
          new Date(p.createdAt) >= today
        )
        .reduce(
          (sum, p) =>
            sum + Number(p.amount || 0),
          0
        );

    // 🔥 WEEK

    const week = new Date();

    week.setDate(
      week.getDate() - 7
    );

    const weeklyRevenue =
      purchases
        .filter(p =>
          new Date(p.createdAt) >= week
        )
        .reduce(
          (sum, p) =>
            sum + Number(p.amount || 0),
          0
        );

    // 🔥 MONTH

    const month = new Date();

    month.setMonth(
      month.getMonth() - 1
    );

    const monthlyRevenue =
      purchases
        .filter(p =>
          new Date(p.createdAt) >= month
        )
        .reduce(
          (sum, p) =>
            sum + Number(p.amount || 0),
          0
        );

    // 🔥 TOP SELLING

    const bookCounts = {};

    purchases.forEach(p => {

      if (!bookCounts[p.bookId]) {

        bookCounts[p.bookId] = 0;

      }

      bookCounts[p.bookId]++;

    });

    let topBook = '';

    let topSales = 0;

    for (let key in bookCounts) {

      if (bookCounts[key] > topSales) {

        topSales = bookCounts[key];

        topBook = key;

      }

    }

    // 🔥 BOOK-WISE REVENUE

    const revenueByBook = {};

    purchases.forEach(p => {

      if (!revenueByBook[p.bookTitle]) {

        revenueByBook[p.bookTitle] = 0;

      }

      revenueByBook[p.bookTitle] +=
        Number(p.amount || 0);

    });

    res.json({

      totalUsers: users.length,

      totalPurchases:
        purchases.length,

      totalRevenue,

      todayRevenue,

      weeklyRevenue,

      monthlyRevenue,

      topBook,

      topSales,

      revenueByBook

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: 'Stats Error'
    });

  }

});

// multer code end


// admin total revenue weekly revenue monthly revenue code start

// 🔥 ADMIN ANALYTICS API

app.get('/admin/dashboard-stats', async (req, res) => {

  try {

    const usersCount = await User.countDocuments();

    const purchases = await Purchase.find();

    let totalRevenue = 0;
    let todayRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;

    const now = new Date();

    purchases.forEach((p) => {

      const amount = Number(p.amount || 0);

      totalRevenue += amount;

      const created = new Date(p.createdAt || Date.now());

      // TODAY
      if (
        created.toDateString() === now.toDateString()
      ) {
        todayRevenue += amount;
      }

      // WEEK
      const diffDays =
        (now - created) / (1000 * 60 * 60 * 24);

      if (diffDays <= 7) {
        weeklyRevenue += amount;
      }

      // MONTH
      if (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      ) {
        monthlyRevenue += amount;
      }

    });

    // 🔥 TOP SELLING BOOK

    const salesMap = {};

    purchases.forEach((p) => {

      if (!salesMap[p.bookId]) {

        salesMap[p.bookId] = 0;

      }

      salesMap[p.bookId]++;

    });

    let topBookId = '';
    let topSellingCount = 0;

    for (const id in salesMap) {

      if (salesMap[id] > topSellingCount) {

        topSellingCount = salesMap[id];

        topBookId = id;

      }

    }

    res.json({

      usersCount,

      purchasesCount: purchases.length,

      totalRevenue,

      todayRevenue,

      weeklyRevenue,

      monthlyRevenue,

      topBookId,

      topSellingCount

    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: 'Server Error'
    });

  }

});

// admin total revenue weekly revenue monthly revenue code end

// testimonial code start

// 🔥 SAVE TESTIMONIAL
app.post('/add-testimonial', async (req, res) => {

  try {

    const testimonial = new Testimonial({

      name: req.body.name,

      rating: req.body.rating,

      message: req.body.message

    });

    await testimonial.save();

    res.json({
      success: true,
      message: 'Testimonial Added'
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// 🔥 GET TESTIMONIALS
app.get('/testimonials', async (req, res) => {

  try {

    const testimonials =
      await Testimonial.find()
      .sort({ createdAt: -1 });

    res.json(testimonials);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// 🔥 DELETE TESTIMONIAL
app.delete('/testimonial/:id', async (req, res) => {

  try {

    await Testimonial.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// 🔥 TESTIMONIAL SCHEMA
const testimonialSchema = new mongoose.Schema({

  name: String,

  message: String,

  rating: Number

}, {
  timestamps: true
});

// const Testimonial =
//   mongoose.model('Testimonial', testimonialSchema);


// 🔥 SAVE TESTIMONIAL
app.post('/testimonial', async (req, res) => {

  try {

    const testimonial = new Testimonial(req.body);

    await testimonial.save();

    res.json({
      success: true
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// 🔥 GET TESTIMONIALS
app.get('/testimonials', async (req, res) => {

  try {

    const data = await Testimonial
      .find()
      .sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// 🔥 ADMIN TESTIMONIALS
app.get('/admin/testimonials', verifyAdmin, async (req, res) => {

  try {

    const data = await Testimonial
      .find()
      .sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// 🔥 admin DELETE TESTIMONIAL
app.delete('/admin/testimonial/:id', verifyAdmin, async (req, res) => {

  try {

    await Testimonial.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// testimonial code end

// ================= START =================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running 🚀"));