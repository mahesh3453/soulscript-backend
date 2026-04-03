const express = require('express');
const router = express.Router();
const verseController = require('../controllers/verseController');

// Existing routes
router.get('/random', verseController.getRandomVerse);
router.get('/mood/:mood', verseController.getVerseByMood);
router.get('/verse/:book/:chapter/:verse', verseController.getSpecificVerse);

// Full Bible routes
router.get('/books', verseController.getBooks);
router.get('/chapters/:book', verseController.getChaptersCount);
router.get('/chapter/:book/:chapter', verseController.getChapter);
router.get('/mood-filter/:mood', verseController.getVersesListByMood);

module.exports = router;
