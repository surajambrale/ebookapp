const Subscription = require('../models/Subscription');
const SubscriptionSetting = require('../models/SubscriptionSetting');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const mongoose = require('mongoose');
const Folder = require('../models/Folder');
const FolderAccess = require('../models/FolderAccess');
const razorpayService = require('../services/razorpayService');
const crypto = require('crypto');

const getActiveSubscription = async (userId) => {
    return Subscription.findOne({
        userId: String(userId),
        status: 'active',
        expiryDate: { $gt: new Date() }
    });
};

const calculateCoupon = async (code, amount) => {
    if (!code) {
        return { coupon: null, discount: 0, finalPrice: amount };
    }

    const coupon = await Coupon.findOne({
        code: String(code).trim().toUpperCase(),
        active: true
    });

    if (!coupon) throw new Error('Invalid Coupon');
    if (coupon.expiryDate && coupon.expiryDate <= new Date()) {
        throw new Error('Coupon Expired');
    }
    if (coupon.usedCount >= coupon.usageLimit) {
        throw new Error('Coupon Limit Reached');
    }
    if (amount < Number(coupon.minimumOrder || 0)) {
        throw new Error(`Minimum Order ₹${coupon.minimumOrder}`);
    }

    let discount = coupon.discountType === 'flat'
        ? Number(coupon.discountValue || 0)
        : (amount * Number(coupon.discountValue || 0)) / 100;

    discount = Math.min(Math.max(discount, 0), amount);

    return {
        coupon,
        discount,
        finalPrice: Math.max(amount - discount, 0)
    };
};

// ======================================
// CREATE SUBSCRIPTION ORDER
// ======================================
exports.createSubscriptionOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        const couponCode = req.body?.couponCode || '';

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const activeSubscription = await getActiveSubscription(userId);
        if (activeSubscription) {
            return res.json({
                success: false,
                alreadySubscribed: true,
                message: 'Subscription Already Active'
            });
        }

        const setting = await SubscriptionSetting.findOne().sort({ createdAt: -1 });
        if (!setting || !setting.active) {
            return res.status(400).json({ success: false, message: 'Subscription is currently closed' });
        }

        const basePrice = Number(setting.offerPrice) > 0 && Number(setting.offerPrice) < Number(setting.price)
            ? Number(setting.offerPrice)
            : Number(setting.price);

        if (!Number.isFinite(basePrice) || basePrice <= 0) {
            return res.status(400).json({ success: false, message: 'Subscription price is not available' });
        }

        const { coupon, discount, finalPrice } = await calculateCoupon(couponCode, basePrice);

        if (finalPrice <= 0) {
            const startDate = new Date();
            const expiryDate = new Date(startDate);
            const durationDays = Number(setting.duration) > 0 ? Number(setting.duration) : 30;
            expiryDate.setDate(expiryDate.getDate() + durationDays);

            await Subscription.updateMany(
                { userId: String(userId), status: 'active' },
                { $set: { status: 'expired' } }
            );

            const subscription = await Subscription.create({
                userId: String(userId),
                paymentId: 'coupon_free',
                orderId: 'coupon_free',
                amount: 0,
                planName: setting.planName || 'Monthly Premium',
                startDate,
                expiryDate,
                status: 'active'
            });

            // =====================================
            // 🔐 GRANT ALL FOLDER ACCESS
            // FOR ACTIVE SUBSCRIPTION
            // =====================================

            const subscriptionUserId =
                new mongoose.Types.ObjectId(userId);

            const allFolders =
                await Folder.find({});

            for (const folder of allFolders) {

                await FolderAccess.findOneAndUpdate(

                    {
                        user: subscriptionUserId,
                        folder: folder._id
                    },

                    {
                        $set: {

                            accessType: 'subscription',

                            amount: 0,

                            paymentId: 'coupon_free',

                            orderId: 'coupon_free',

                            startDate: startDate,

                            expiryDate: expiryDate,

                            isActive: true

                        }
                    },

                    {
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true
                    }

                );

            }

            console.log(
                '✅ Subscription folder access granted:',
                allFolders.length
            );

            if (coupon) {
                await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
            }

            return res.json({
                success: true,
                free: true,
                finalPrice: 0,
                basePrice,
                discount,
                couponCode: coupon ? coupon.code : '',
                expiryDate,
                subscription
            });
        }

        const order = await razorpayService.createOrder(finalPrice);

        res.json({
            success: true,
            order,
            basePrice,
            discount,
            finalPrice,
            couponCode: coupon ? coupon.code : ''
        });
    } catch (err) {
        console.error('CREATE SUBSCRIPTION ORDER ERROR:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// ======================================
// CHECK CURRENT USER SUBSCRIPTION
// ======================================
exports.checkSubscription = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, subscribed: false, message: 'Authentication required' });
        }

        const subscription = await getActiveSubscription(userId);

        if (!subscription) {
            await Subscription.updateMany(
                { userId: String(userId), status: 'active', expiryDate: { $lte: new Date() } },
                { $set: { status: 'expired' } }
            );

            return res.json({
                success: true,
                subscribed: false,
                message: 'No Active Subscription'
            });
        }

        return res.json({
            success: true,
            subscribed: true,
            plan: subscription.planName,
            startDate: subscription.startDate,
            expiryDate: subscription.expiryDate
        });
    } catch (err) {
        console.error('CHECK SUBSCRIPTION ERROR:', err);
        res.status(500).json({ success: false, subscribed: false, message: err.message });
    }
};

exports.getMySubscriptionHistory = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({
            userId: String(req.user.id)
        }).sort({ createdAt: -1 });

        return res.json({ success: true, subscriptions });
    } catch (err) {
        console.error('GET SUBSCRIPTION HISTORY ERROR:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to load subscription history'
        });
    }
};

// ======================================
// GET USER SUBSCRIPTION - ADMIN ONLY
// ======================================
exports.getUserSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            userId: String(req.params.userId)
        }).sort({ createdAt: -1 });

        res.json(subscription);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ======================================
// VERIFY SUBSCRIPTION PAYMENT
// ======================================
exports.verifySubscriptionPayment = async (req, res) => {
    try {
        const userId = req.user?.id;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            couponCode = ''
        } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment data missing' });
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid Payment' });
        }

        const order = await razorpayService.instance.orders.fetch(razorpay_order_id);
        const setting = await SubscriptionSetting.findOne().sort({ createdAt: -1 });

        if (!setting) {
            return res.status(400).json({ success: false, message: 'Subscription settings not found' });
        }

        const basePrice = Number(setting.offerPrice) > 0 && Number(setting.offerPrice) < Number(setting.price)
            ? Number(setting.offerPrice)
            : Number(setting.price);

        const { coupon, discount, finalPrice } = await calculateCoupon(couponCode, basePrice);
        const expectedPaise = Math.round(finalPrice * 100);

        if (Number(order.amount) !== expectedPaise) {
            return res.status(400).json({
                success: false,
                message: 'Subscription payment amount mismatch'
            });
        }

        const startDate = new Date();
        const expiryDate = new Date(startDate);
        const durationDays = Number(setting.duration) > 0 ? Number(setting.duration) : 30;
        expiryDate.setDate(expiryDate.getDate() + durationDays);

        await Subscription.updateMany(
            { userId: String(userId), status: 'active' },
            { $set: { status: 'expired' } }
        );

        const subscription = await Subscription.create({
            userId: String(userId),
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            amount: finalPrice,
            planName: setting.planName || 'Monthly Premium',
            startDate,
            expiryDate,
            status: 'active'
        });

        if (coupon) {
            await Coupon.findByIdAndUpdate(coupon._id, {
                $inc: { usedCount: 1 }
            });
        }

        res.json({
            success: true,
            message: 'Subscription Activated',
            expiryDate,
            discount,
            subscription
        });
    } catch (err) {
        console.error('VERIFY SUBSCRIPTION PAYMENT ERROR:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// ======================================
// GET ALL SUBSCRIPTIONS - ADMIN
// ======================================
exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find().sort({ createdAt: -1 });
        const data = [];

        for (const sub of subscriptions) {
            const user = await User.findById(sub.userId);
            data.push({
                _id: sub._id,
                userId: sub.userId,
                userName: user ? user.name : 'Deleted User',
                phone: user ? user.phone : '-',
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteSubscription = async (req, res) => {
    try {
        await Subscription.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Subscription Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
