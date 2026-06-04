const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'soulscript-jwt-secret-key-987';

exports.register = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        
        let user = await User.findOne({ identifier });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ identifier, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ userId: user._id, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        
        const user = await User.findOne({ identifier });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Update lastSeen on login to mark online
        user.lastSeen = new Date();
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ userId: user._id, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};
