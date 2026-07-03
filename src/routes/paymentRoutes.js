const express = require('express');
const router = express.Router();
const { paddleWebhook } = require('../controllers/paymentController');

// Paddle එකෙන් එන POST Request එක මෙතනට එන්නේ
router.post('/webhook', paddleWebhook);

module.exports = router;