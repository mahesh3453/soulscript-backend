const Like = require('../models/Like');

exports.addLike = async (req, res) => {
    try {
        const { userId, book, chapter, verse } = req.body;
        
        const newLike = new Like({ userId, book, chapter, verse });
        await newLike.save();
        
        res.status(201).json(newLike);
    } catch (error) {
        console.error('Add like error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Like already exists' });
        }
        res.status(500).json({ error: 'Failed to add like' });
    }
};

exports.getLikes = async (req, res) => {
    try {
        const likes = await Like.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(likes);
    } catch (error) {
        console.error('Get likes error:', error);
        res.status(500).json({ error: 'Failed to fetch likes' });
    }
};

exports.removeLike = async (req, res) => {
    try {
        await Like.findByIdAndDelete(req.params.id);
        res.json({ message: 'Like removed' });
    } catch (error) {
        console.error('Remove like error:', error);
        res.status(500).json({ error: 'Failed to remove like' });
    }
};
