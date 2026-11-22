const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    attachmentUrl: {
        type: String,
        default: null
    },
    attachmentType: {
        type: String,
        default: null
    },
    // Delete for Everyone: message content wiped, placeholder shown to both parties
    deletedForEveryone: {
        type: Boolean,
        default: false
    },
    // Delete for Me: per-user IDs who have hidden this message from their view
    deletedFor: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    }
}, { timestamps: true });

// Add indexes for fast querying of message history between two users
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ receiverId: 1 });
MessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
