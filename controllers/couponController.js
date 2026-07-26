const Coupon = require('../models/Coupon');

// ============================
// CREATE COUPON
// ============================

exports.createCoupon = async (req, res) => {

    try {

        const existing = await Coupon.findOne({
            code: req.body.code.toUpperCase()
        });

        if (existing) {

            return res.status(400).json({

                success: false,

                message: "Coupon Already Exists"

            });

        }

        const coupon = await Coupon.create({

            ...req.body,

            code: req.body.code.toUpperCase()

        });

        res.json({

            success: true,

            message: "Coupon Created",

            coupon

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


// ============================
// GET ALL COUPONS
// ============================

exports.getCoupons = async (req, res) => {

    try {

        const coupons = await Coupon.find()
            .sort({ createdAt: -1 });

        res.json(coupons);

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// ============================
// UPDATE COUPON
// ============================

exports.updateCoupon = async (req, res) => {

    try {

        const coupon = await Coupon.findByIdAndUpdate(

            req.params.id,

            req.body,

            { new: true }

        );

        res.json({

            success: true,

            message: "Coupon Updated",

            coupon

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// ============================
// DELETE COUPON
// ============================

exports.deleteCoupon = async (req, res) => {

    try {

        await Coupon.findByIdAndDelete(req.params.id);

        res.json({

            success: true,

            message: "Coupon Deleted"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// ============================
// VERIFY COUPON
// ============================

exports.verifyCoupon = async (req, res) => {

    try {

        const {

            code,

            amount

        } = req.body;

        const coupon = await Coupon.findOne({

            code: code.toUpperCase(),

            active: true

        });

        if (!coupon) {

            return res.json({

                success: false,

                message: "Invalid Coupon"

            });

        }

        if (coupon.expiryDate < new Date()) {

            return res.json({

                success: false,

                message: "Coupon Expired"

            });

        }

        if (coupon.usedCount >= coupon.usageLimit) {

            return res.json({

                success: false,

                message: "Coupon Limit Reached"

            });

        }

        if (amount < coupon.minimumOrder) {

            return res.json({

                success: false,

                message: `Minimum Order ₹${coupon.minimumOrder}`

            });

        }

        let discount = 0;

        if (coupon.discountType === "flat") {

            discount = coupon.discountValue;

        } else {

            discount = (amount * coupon.discountValue) / 100;

        }

        const finalPrice = Math.max(amount - discount, 0);

        res.json({

            success: true,

            discount,

            finalPrice,

            coupon

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