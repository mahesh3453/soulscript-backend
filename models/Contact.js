const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Prevent duplicate contacts per user
ContactSchema.index({ userId: 1, contactId: 1 }, { unique: true });

module.exports = mongoose.model('Contact', ContactSchema);
