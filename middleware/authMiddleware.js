const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'soulscript-jwt-secret-key-987';

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.header('Authorization');
        
        if (!token) {
            return res.status(401).json({ error: 'No authentication token, authorization denied' });
        }

        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }

        const verified = jwt.verify(token, JWT_SECRET);
        if (!verified) {
            return res.status(401).json({ error: 'Token verification failed, authorization denied' });
        }

        const user = await User.findById(verified.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found, authorization denied' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(401).json({ error: 'Token is invalid or expired' });
    }
};

module.exports = authMiddleware;
