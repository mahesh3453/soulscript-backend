const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: String, required: true },
    chapter: { type: Number, required: true },
    verse: { type: Number, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate bookmarks for same user and verse
BookmarkSchema.index({ userId: 1, book: 1, chapter: 1, verse: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
