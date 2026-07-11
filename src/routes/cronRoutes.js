const express = require('express');
const router = express.Router();
const Domain = require('../models/Domain');
const sendEmail = require('../utils/sendEmail');

// Route: GET /api/cron/send-emails
router.get('/send-emails', async (req, res) => {
    console.log('⏳ Vercel Cron Triggered: Checking for expiring domains...');
    
    try {
        const today = new Date();
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);

        const expiringDomains = await Domain.find({
            expiryDate: { $lte: next30Days, $gte: today }
        }).populate('user', 'email name');

        if (expiringDomains.length > 0) {
            console.log(`⚠️ Found ${expiringDomains.length} domains expiring soon! Grouping by user...`);
            
            const userDomains = {};

            expiringDomains.forEach(domain => {
                if (domain.user && domain.user.email) {
                    const userEmail = domain.user.email;
                    if (!userDomains[userEmail]) {
                        userDomains[userEmail] = { name: domain.user.name || 'Freelancer', domains: [] };
                    }
                    userDomains[userEmail].domains.push(domain);
                }
            });

            for (const email in userDomains) {
                const userData = userDomains[email];
                let emailText = `Hello ${userData.name},\n\nThe following domains managed by you are expiring within the next 30 days. Please take action:\n\n`;
                
                userData.domains.forEach(d => {
                    emailText += `🔴 Domain: ${d.domainUrl} | Client: ${d.clientName} | Expires on: ${new Date(d.expiryDate).toDateString()}\n`;
                });

                emailText += "\nThank You,\nMyDomainGuard System";

                await sendEmail(email, "⚠️ Urgent: Your Managed Domains are Expiring Soon", emailText);
                console.log(`✅ Automated email successfully sent to user: ${email}`);
            }
            
            // API එකෙන් සාර්ථකයි කියලා උත්තරයක් දෙනවා
            return res.status(200).json({ success: true, message: "Emails sent successfully." });
        } else {
            console.log('✅ No domains expiring within 30 days.');
            return res.status(200).json({ success: true, message: "No domains expiring." });
        }
    } catch (error) {
        console.error('🔴 Error in cron job:', error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});

module.exports = router;