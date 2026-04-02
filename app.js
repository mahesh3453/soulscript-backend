const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const verseRoutes = require('./routes/verseRoutes');
const authRoutes = require('./routes/authRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const likeRoutes = require('./routes/likeRoutes');

dotenv.config();

const connectDB = require('./config/db');
// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ["https://soulscript-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.options("*", cors());
app.use(express.json());

// Routes
app.use('/api', verseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/likes', likeRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('API running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
