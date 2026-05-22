const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['STORE_OWNER']));

router.get('/dashboard', ownerController.getDashboardStats);

module.exports = router;
