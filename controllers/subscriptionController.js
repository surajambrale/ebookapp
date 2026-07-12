const Subscription = require('../models/Subscription');
const razorpayService = require('../services/razorpayService');
const crypto = require('crypto');



// ======================================
// CREATE SUBSCRIPTION ORDER
// ======================================

exports.createSubscriptionOrder = async (req, res) => {

    try {

        const { userId } = req.body;

        // User required
        if (!userId) {

            return res.status(400).json({

                success: false,

                message: "User Id Required"

            });

        }

        // Already Active Subscription?

        const activeSubscription = await Subscription.findOne({

            userId,

            status: "active",

            expiryDate: {

                $gt: new Date()

            }

        });

        if (activeSubscription) {

            return res.json({

                success: false,

                alreadySubscribed: true,

                message: "Subscription Already Active"

            });

        }

        // Create Razorpay Order

        const order = await razorpayService.createOrder(1);

        res.json({

            success: true,

            order

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ======================================
// CHECK SUBSCRIPTION STATUS
// ======================================

exports.checkSubscription = async (req, res) => {

    try {

        const { userId } = req.params;

        const subscription = await Subscription.findOne({
            userId,
            status: "active"
        });

        if (!subscription) {

            return res.json({
                success: true,
                subscribed: false,
                message: "No Active Subscription"
            });

        }

        const today = new Date();

        if (subscription.expiryDate < today) {

            subscription.status = "expired";

            await subscription.save();

            return res.json({

                success: true,

                subscribed: false,

                message: "Subscription Expired"

            });

        }

        res.json({

            success: true,

            subscribed: true,

            plan: subscription.planName,

            startDate: subscription.startDate,

            expiryDate: subscription.expiryDate

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ======================================
// VERIFY SUBSCRIPTION PAYMENT
// ======================================

exports.verifySubscriptionPayment = async (req, res) => {

    try {

        const {

            razorpay_order_id,

            razorpay_payment_id,

            razorpay_signature,

            userId

        } = req.body;


        // Signature Verify

        const body =
            razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto

            .createHmac(
                "sha256",
                process.env.RAZORPAY_SECRET
            )

            .update(body.toString())

            .digest("hex");


        if (expectedSignature !== razorpay_signature) {

            return res.status(400).json({

                success: false,

                message: "Invalid Payment"

            });

        }


        // Today's Date

        const startDate = new Date();


        // Expiry After 30 Days

        const expiryDate = new Date();

        expiryDate.setDate(expiryDate.getDate() + 30);


        // Old Subscription Delete

        await Subscription.deleteMany({

            userId

        });


        // Save New Subscription

        await Subscription.create({

            userId,

            paymentId: razorpay_payment_id,

            orderId: razorpay_order_id,

            amount: 1,

            planName: "Monthly Premium",

            startDate,

            expiryDate,

            status: "active"

        });


        res.json({

            success: true,

            message: "Subscription Activated",

            expiryDate

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};



// ======================================
// GET ALL SUBSCRIPTIONS (ADMIN)
// ======================================

// exports.getAllSubscriptions = async (req, res) => {

//     try {

//         const subscriptions = await Subscription.find()
//             .sort({ createdAt: -1 });

//         res.json(subscriptions);

//     }

//     catch (err) {

//         res.status(500).json({

//             success: false,

//             message: err.message

//         });

//     }

// };

const User = require('../models/User');

exports.getAllSubscriptions = async (req, res) => {

    try {

        const subscriptions = await Subscription.find()
            .sort({ createdAt: -1 });

        const data = [];

        for (const sub of subscriptions) {

            const user = await User.findById(sub.userId);

            data.push({

                _id: sub._id,

                userId: sub.userId,

                userName: user ? user.name : "Deleted User",

                phone: user ? user.phone : "-",

                planName: sub.planName,

                amount: sub.amount,

                paymentId: sub.paymentId,

                orderId: sub.orderId,

                status: sub.status,

                startDate: sub.startDate,

                expiryDate: sub.expiryDate

            });

        }

        res.json(data);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};




// ======================================
// GET USER SUBSCRIPTION
// ======================================

exports.getUserSubscription = async (req, res) => {

    try {

        const subscription = await Subscription.findOne({

            userId: req.params.userId

        });

        res.json(subscription);

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

// ======================================
// DELETE SUBSCRIPTION
// ======================================

exports.deleteSubscription = async (req, res) => {

    try {

        await Subscription.findByIdAndDelete(req.params.id);

        res.json({

            success: true,

            message: "Subscription Deleted"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};