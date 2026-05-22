const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['NORMAL', 'ADMIN'])); // Admins might also want to view

router.get('/stores', userController.getStores);
router.post('/rate', userController.submitRating);

module.exports = router;
