const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');

router.post('/', likeController.addLike);
router.get('/:userId', likeController.getLikes);
router.delete('/:id', likeController.removeLike);

module.exports = router;
