const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Define register and login routes
router.post('/register', registerUser);
router.post('/login', loginUser);

const { protect } = require('../middleware/authMiddleware');

router.get('/test-route', protect, (req, res) => {
    res.json({
        message: "නියමයි! ඔයා සාර්ථකව ආරක්ෂිත කලාපයට ඇතුළු වුණා.",
        user: req.user
    });
});

module.exports = router;
