const mongoose = require('mongoose')
const chillieCustomer = new mongoose.Schema({
    name: String,
    amount: Number,
    email: String,
    address: String,
    postalCode: Number,
    phoneNumber: String,
    suggestions: String,
    paymentId: String,
    orderId: String,
    signature: String,
    paymentStatus: String
})
module.exports = mongoose.model('customer', chillieCustomer);

