const express = require('express');
const router = express.Router();
const { addDomain, getDomains, updateDomain, deleteDomain } = require('../controllers/domainController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addDomain);
router.get('/', protect, getDomains);
router.put('/:id', protect, updateDomain);    // Update Route
router.delete('/:id', protect, deleteDomain); // Delete Route

module.exports = router;