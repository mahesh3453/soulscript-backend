const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');

router.post('/', bookmarkController.addBookmark);
router.get('/:userId', bookmarkController.getBookmarks);
router.delete('/:id', bookmarkController.removeBookmark);

module.exports = router;
