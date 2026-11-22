const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const verseRoutes = require('./routes/verseRoutes');
const authRoutes = require('./routes/authRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const likeRoutes = require('./routes/likeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const audioBibleRoutes = require('./routes/audioBibleRoutes');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        const allowedOrigins = [
            "https://soulscript-frontend.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:4173",
            "http://localhost:8080",
            "capacitor://localhost",
            "ionic://localhost",
            "http://localhost"
        ];
        if (allowedOrigins.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
            return callback(null, true);
        }
        return callback(null, true); // Allow all in development; restrict in production via env
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', verseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/audio-bible', audioBibleRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('API running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
