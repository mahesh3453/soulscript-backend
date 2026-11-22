const express = require('express');
const router = express.Router();
const audioBibleController = require('../controllers/audioBibleController');

// GET /api/audio-bible/:lang/books - List all books with audio for a language
router.get('/:lang/books', audioBibleController.getAudioBooks);

// GET /api/audio-bible/:lang/:book/:chapter - Get audio URL for a specific chapter
router.get('/:lang/:book/:chapter', audioBibleController.getAudioChapter);

module.exports = router;
