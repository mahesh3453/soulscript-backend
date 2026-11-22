const mongoose = require('mongoose');

const audioBibleSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true,
        index: true
    },
    bookId: {
        type: Number,
        required: true,
        index: true
    },
    book: {
        type: String,
        required: true
    },
    chapter: {
        type: Number,
        required: true
    },
    audioUrl: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for fast lookup and duplicate prevention
audioBibleSchema.index({ language: 1, bookId: 1, chapter: 1 }, { unique: true });

// Additional index for book name + chapter lookup
audioBibleSchema.index({ language: 1, book: 1, chapter: 1 });

module.exports = mongoose.model('AudioBible', audioBibleSchema);
