const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Get chat users list (with unread count)
router.get('/users', authMiddleware, chatController.getUsersList);

// Get chat history with a specific user (with pagination support)
router.get('/history/:otherUserId', authMiddleware, chatController.getChatHistory);

// Send message
router.post('/send', authMiddleware, chatController.sendMessage);

// Periodic online status heartbeat
router.post('/heartbeat', authMiddleware, chatController.heartbeat);

// Update typing status
router.post('/typing', authMiddleware, chatController.setTypingStatus);

// Upload file attachment
router.post('/upload', authMiddleware, upload.single('attachment'), chatController.uploadFile);

// Add contact
router.post('/contacts', authMiddleware, chatController.addContact);

module.exports = router;
