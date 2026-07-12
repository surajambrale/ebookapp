const Razorpay = require('razorpay');

const razorpay = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,

    key_secret: process.env.RAZORPAY_SECRET

});


// =======================================
// CREATE ORDER
// =======================================

exports.createOrder = async (amount) => {

    try {

        const options = {

            amount: amount * 100,

            currency: "INR"

        };

        const order = await razorpay.orders.create(options);

        return order;

    }

    catch (err) {

        throw err;

    }

};



// =======================================
// GET INSTANCE
// =======================================

exports.instance = razorpay;