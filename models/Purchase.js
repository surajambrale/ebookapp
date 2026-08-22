const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({

    userId: String,

    bookId: String,

    paymentId: String,

    orderId: String,

    amount: Number,

    accessType: {
        type: String,
        default: 'purchase'
    },

    startDate: {
        type: Date,
        default: Date.now
    },

    expiryDate: {
        type: Date,
        default: () => {
            const expiry = new Date();
            expiry.setMonth(expiry.getMonth() + 1);
            return expiry;
        }
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, {

    timestamps: true

});

module.exports = mongoose.model('Purchase', PurchaseSchema);