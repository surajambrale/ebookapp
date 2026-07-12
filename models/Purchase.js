const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({

    userId: String,

    bookId: String,

    paymentId: String,

    orderId: String,

    amount: Number

}, {

    timestamps: true

});

module.exports = mongoose.model('Purchase', PurchaseSchema);