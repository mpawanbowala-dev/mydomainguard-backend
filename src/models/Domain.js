const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // මේකෙන් කරන්නේ මේ ඩොමේන් එක අයිති අදාළ ෆ්‍රීලාන්සර්ට (User ට) කියලා සම්බන්ධ කරන එකයි
    },
    clientName: {
        type: String,
        required: true
    },
    domainUrl: {
        type: String,
        required: true
    },
    hostingProvider: {
        type: String,
        default: 'Not Specified'
    },
    expiryDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Domain', domainSchema);