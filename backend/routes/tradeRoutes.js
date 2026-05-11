const express = require('express');
const router = express.Router();
const { placeOrder } = require('../controllers/tradeController');
const { protect } = require('../middlewares/auth');

// This route is now protected! You MUST send a JWT to hit it.
router.post('/order', protect, placeOrder);

module.exports = router;