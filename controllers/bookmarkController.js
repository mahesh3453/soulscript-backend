const Bookmark = require('../models/Bookmark');

exports.addBookmark = async (req, res) => {
    try {
        const { userId, book, chapter, verse, text } = req.body;
        
        const newBookmark = new Bookmark({ userId, book, chapter, verse, text });
        await newBookmark.save();
        
        res.status(201).json(newBookmark);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Bookmark already exists' });
        }
        res.status(500).json({ error: 'Failed to add bookmark' });
    }
};

exports.getBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(bookmarks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
};

exports.removeBookmark = async (req, res) => {
    try {
        await Bookmark.findByIdAndDelete(req.params.id);
        res.json({ message: 'Bookmark removed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove bookmark' });
    }
};
