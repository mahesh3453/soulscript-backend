const Message = require('../models/Message');
const User = require('../models/User');
const Contact = require('../models/Contact');

// In-memory typing status map: "senderId-receiverId" -> timestamp
const typingState = new Map();

// Helper: check if a user is currently typing to a recipient
const isUserTyping = (otherUserId, currentUserId) => {
    const key = `${otherUserId}-${currentUserId}`;
    if (!typingState.has(key)) return false;
    const timestamp = typingState.get(key);
    // Expire typing indicator after 6 seconds of inactivity
    if (Date.now() - timestamp > 6000) {
        typingState.delete(key);
        return false;
    }
    return true;
};

// Send message (JWT authenticated sender)
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId, message, attachmentUrl, attachmentType } = req.body;

        if (!receiverId) {
            return res.status(400).json({ error: 'Receiver ID is required' });
        }
        
        const hasMessage = message && message.trim() !== '';
        if (!hasMessage && !attachmentUrl) {
            return res.status(400).json({ error: 'Message content or attachment is required' });
        }

        // Determine if receiver is online to set initial status
        const receiver = await User.findById(receiverId).select('lastSeen');
        const isOnline = receiver && receiver.lastSeen && (Date.now() - new Date(receiver.lastSeen) < 60000);
        const initialStatus = isOnline ? 'delivered' : 'sent';

        const newMessage = new Message({
            senderId,
            receiverId,
            message: hasMessage ? message.trim() : '',
            attachmentUrl: attachmentUrl || null,
            attachmentType: attachmentType || null,
            status: initialStatus
        });

        await newMessage.save();

        // Automatically create Contact entries for both if they don't exist yet,
        // so that new conversations are automatically shown in user sidebar threads.
        // Users can explicitly add each other, but sending a message will also link them.
        await Contact.updateOne(
            { userId: senderId, contactId: receiverId },
            { $setOnInsert: { userId: senderId, contactId: receiverId } },
            { upsert: true }
        );
        await Contact.updateOne(
            { userId: receiverId, contactId: senderId },
            { $setOnInsert: { userId: receiverId, contactId: senderId } },
            { upsert: true }
        );

        // Update sender's lastSeen timestamp
        req.user.lastSeen = new Date();
        await req.user.save();

        // Clear typing status when message is sent
        const typingKey = `${senderId}-${receiverId}`;
        typingState.delete(typingKey);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Server error while sending message' });
    }
};

// Fetch chat history between current user and another user (with pagination)
exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otherUserId } = req.params;
        const { limit = 50, before } = req.query;

        if (!otherUserId) {
            return res.status(400).json({ error: 'Other User ID is required' });
        }

        // Mark all incoming messages from the other user as read
        await Message.updateMany(
            { senderId: otherUserId, receiverId: userId, status: { $ne: 'read' } },
            { status: 'read', isRead: true }
        );

        const query = {
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        };

        // cursor-based pagination using before (ISO string or timestamp)
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit, 10))
            .lean();

        // Reverse to return them in chronological order
        res.json(messages.reverse());
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ error: 'Server error while fetching chat history' });
    }
};

// Fetch user list (excluding caller) with unread counts and online status
exports.getUsersList = async (req, res) => {
    try {
        const userId = req.user._id;

        // Mark all 'sent' messages to the caller as 'delivered' because the client is fetching updates
        await Message.updateMany(
            { receiverId: userId, status: 'sent' },
            { status: 'delivered' }
        );

        // Fetch explicitly added contacts of the active user
        const contacts = await Contact.find({ userId })
            .populate('contactId', 'identifier lastSeen')
            .lean();

        // Map populated contacts to user structures
        const users = contacts
            .map(c => c.contactId)
            .filter(user => user !== null && user !== undefined);

        // Add unread message counts and typing status for each user
        const usersWithUnread = await Promise.all(
            users.map(async (user) => {
                const unreadCount = await Message.countDocuments({
                    senderId: user._id,
                    receiverId: userId,
                    isRead: false
                });

                const isTyping = isUserTyping(user._id.toString(), userId.toString());

                return {
                    _id: user._id,
                    identifier: user.identifier,
                    lastSeen: user.lastSeen,
                    unreadCount,
                    isTyping
                };
            })
        );

        // Update active caller's heartbeat lastSeen
        req.user.lastSeen = new Date();
        await req.user.save();

        res.json(usersWithUnread);
    } catch (error) {
        console.error('Get users list error:', error);
        res.status(500).json({ error: 'Server error while fetching user list' });
    }
};

// Add contact explicitly by registered mobile number or email
exports.addContact = async (req, res) => {
    try {
        const userId = req.user._id;
        const { identifier } = req.body;

        if (!identifier || identifier.trim() === '') {
            return res.status(400).json({ error: 'Mobile number or Email is required' });
        }

        const cleanIdentifier = identifier.trim();

        // 1. Cannot add self
        if (cleanIdentifier === req.user.identifier) {
            return res.status(400).json({ error: 'You cannot add yourself as a contact' });
        }

        // 2. Validate user exists in system
        const targetUser = await User.findOne({ identifier: cleanIdentifier });
        if (!targetUser) {
            return res.status(404).json({ error: 'No user registered with this mobile number or email' });
        }

        // 3. Prevent duplicate contacts
        const existing = await Contact.findOne({ userId, contactId: targetUser._id });
        if (existing) {
            return res.status(400).json({ error: 'This contact is already in your chat list' });
        }

        // Create contact relation (one-way addition)
        const newContact = new Contact({
            userId,
            contactId: targetUser._id
        });
        await newContact.save();

        res.status(201).json({
            success: true,
            message: 'Contact added successfully',
            contact: {
                _id: targetUser._id,
                identifier: targetUser.identifier,
                lastSeen: targetUser.lastSeen,
                unreadCount: 0,
                isTyping: false
            }
        });
    } catch (error) {
        console.error('Add contact error:', error);
        res.status(500).json({ error: 'Server error while adding contact' });
    }
};

// Update typing status (temporary in-memory state)
exports.setTypingStatus = async (req, res) => {
    try {
        const senderId = req.user._id.toString();
        const { receiverId, isTyping } = req.body;

        if (!receiverId) {
            return res.status(400).json({ error: 'Receiver ID is required' });
        }

        const key = `${senderId}-${receiverId}`;
        if (isTyping) {
            typingState.set(key, Date.now());
        } else {
            typingState.delete(key);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Set typing status error:', error);
        res.status(500).json({ error: 'Server error setting typing status' });
    }
};

// Handle file uploads (Multer middleware handles storage)
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        const type = req.file.mimetype.startsWith('image/') ? 'image' : 'file';

        res.json({
            attachmentUrl: fileUrl,
            attachmentType: type
        });
    } catch (error) {
        console.error('Upload file error:', error);
        res.status(500).json({ error: 'Server error during file upload' });
    }
};

// Simple heartbeat update
exports.heartbeat = async (req, res) => {
    try {
        req.user.lastSeen = new Date();
        await req.user.save();
        res.json({ success: true, lastSeen: req.user.lastSeen });
    } catch (error) {
        console.error('Heartbeat error:', error);
        res.status(500).json({ error: 'Server error during heartbeat update' });
    }
};
