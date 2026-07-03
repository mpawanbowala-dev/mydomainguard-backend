const Domain = require('../models/Domain');
const User = require('../models/User'); // User මොඩල් එක අලුතින් Import කළා

// Add a new domain (POST)
const addDomain = async (req, res) => {
    try {
        const { clientName, domainUrl, hostingProvider, expiryDate } = req.body;

        if (!clientName || !domainUrl || !expiryDate) {
            return res.status(400).json({ status: 'error', message: 'Please provide clientName, domainUrl, and expiryDate.' });
        }

        const userId = req.user.id;

        // --- Subscription Limit Logic Start ---
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found.' });
        }

        const userPlan = user.plan || 'free';
        const currentDomainCount = await Domain.countDocuments({ user: userId });

        if (userPlan === 'free' && currentDomainCount >= 3) {
            return res.status(403).json({ 
                status: 'error', 
                message: "Free plan limit reached. You can only add up to 3 domains. Please upgrade to the Pro plan to add more." 
            });
        }

        if (userPlan === 'pro' && currentDomainCount >= 100) {
            return res.status(403).json({ 
                status: 'error', 
                message: "Pro plan limit reached. You can only add up to 100 domains. Please upgrade to the Unlimited plan to add more." 
            });
        }
        // --- Subscription Limit Logic End ---

        const domain = await Domain.create({
            user: userId, 
            clientName,
            domainUrl,
            hostingProvider,
            expiryDate
        });

        res.status(201).json({ status: 'success', data: domain });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error while adding the domain.' });
    }
};

// Get all domains for logged-in user (GET)
const getDomains = async (req, res) => {
    try {
        const domains = await Domain.find({ user: req.user.id });
        res.status(200).json({ status: 'success', count: domains.length, data: domains });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error while fetching domains.' });
    }
};

// Update a domain (PUT)
const updateDomain = async (req, res) => {
    try {
        let domain = await Domain.findById(req.params.id);

        if (!domain) {
            return res.status(404).json({ status: 'error', message: 'Domain not found.' });
        }

        // Check if the logged-in user owns this domain
        if (domain.user.toString() !== req.user.id) {
            return res.status(401).json({ status: 'error', message: 'User not authorized to update this domain.' });
        }

        domain = await Domain.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ status: 'success', data: domain });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error while updating.' });
    }
};

// Delete a domain (DELETE)
const deleteDomain = async (req, res) => {
    try {
        const domain = await Domain.findById(req.params.id);

        if (!domain) {
            return res.status(404).json({ status: 'error', message: 'Domain not found.' });
        }

        // Check if the logged-in user owns this domain
        if (domain.user.toString() !== req.user.id) {
            return res.status(401).json({ status: 'error', message: 'User not authorized to delete this domain.' });
        }

        await domain.deleteOne();
        res.status(200).json({ status: 'success', message: 'Domain removed successfully.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error while deleting.' });
    }
};

module.exports = { addDomain, getDomains, updateDomain, deleteDomain };