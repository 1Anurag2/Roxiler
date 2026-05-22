const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.get('/stores', adminController.getStores);
router.post('/add-user', adminController.addUser);
router.post('/add-store', adminController.addStore);

module.exports = router;
