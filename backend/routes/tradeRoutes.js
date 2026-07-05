const express = require('express');
const router = express.Router();
const { placeOrder, resyncReality } = require('../controllers/tradeController');
const { protect } = require('../middlewares/auth');

// This route is now protected! You MUST send a JWT to hit it.
router.post('/order', protect, placeOrder);

router.post('/resync', resyncReality);

module.exports = router;