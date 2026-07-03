const cron = require('node-cron');
const Domain = require('../models/Domain');
const sendEmail = require('../utils/sendEmail');

const startEmailCron = () => {
    // හැමදාම උදේ 8.00 ට රන් වෙන්න දාලා තියෙන්නේ
    cron.schedule('0 8 * * *', async () => {
        console.log('⏳ Checking for expiring domains...');
        
        try {
            const today = new Date();
            const next30Days = new Date();
            next30Days.setDate(today.getDate() + 30);

            // දවස් 30ක් ඇතුළත Expire වෙන Domains හොයනවා.
            // .populate('user', 'email name') මගින් අදාළ අයිතිකරුගේ නම සහ ඊමේල් එකත් එකටම ගන්නවා.
            const expiringDomains = await Domain.find({
                expiryDate: { $lte: next30Days, $gte: today }
            }).populate('user', 'email name');

            if (expiringDomains.length > 0) {
                console.log(`⚠️ Found ${expiringDomains.length} domains expiring soon! Grouping by user...`);
                
                // යූසර්ලා අනුව ඩොමේන් වෙන් කරගන්න (Group by User)
                const userDomains = {};

                expiringDomains.forEach(domain => {
                    // User කෙනෙක් Database එකේ හරියට ඉන්නවා නම් විතරක්
                    if (domain.user && domain.user.email) {
                        const userEmail = domain.user.email;
                        
                        if (!userDomains[userEmail]) {
                            userDomains[userEmail] = {
                                name: domain.user.name || 'Freelancer',
                                domains: []
                            };
                        }
                        userDomains[userEmail].domains.push(domain);
                    }
                });

                // වෙන් කරගත්ත යූසර්ස්ලාට වෙන වෙනම ඊමේල් යැවීම
                for (const email in userDomains) {
                    const userData = userDomains[email];
                    
                    let emailText = `Hello ${userData.name},\n\nThe following domains managed by you are expiring within the next 30 days. Please take action:\n\n`;
                    
                    userData.domains.forEach(d => {
                        emailText += `🔴 Domain: ${d.domainUrl} | Client: ${d.clientName} | Expires on: ${new Date(d.expiryDate).toDateString()}\n`;
                    });

                    emailText += "\nThank You,\nMyDomainGuard System";

                    // අදාළ User ගේ ඊමේල් එකට කෙළින්ම යවනවා
                    await sendEmail(email, "⚠️ Urgent: Your Managed Domains are Expiring Soon", emailText);
                    console.log(`✅ Automated email successfully sent to user: ${email}`);
                }
                
            } else {
                console.log('✅ No domains expiring within 30 days.');
            }
        } catch (error) {
            console.error('🔴 Error in cron job:', error);
        }
    });
};

module.exports = startEmailCron;