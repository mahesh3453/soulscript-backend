const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: String, required: true },
    chapter: { type: Number, required: true },
    verse: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate likes for same user and verse
LikeSchema.index({ userId: 1, book: 1, chapter: 1, verse: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);
