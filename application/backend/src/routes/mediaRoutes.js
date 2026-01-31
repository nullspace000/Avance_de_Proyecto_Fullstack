const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const auth = require('../middleware/auth');

// Protected routes (authentication required)
router.get('/', auth, mediaController.getAll);
router.get('/:id', auth, mediaController.getById);
router.post('/', auth, mediaController.create);
router.put('/:id', auth, mediaController.update);
router.delete('/:id', auth, mediaController.delete);

module.exports = router;
