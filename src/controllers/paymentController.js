const User = require('../models/User');

// Paddle එකෙන් එවන Webhook එක අල්ලගන්න ෆන්ක්ෂන් එක
exports.paddleWebhook = async (req, res) => {
    try {
        const webhookData = req.body;

        // 1. මේක මොන වගේ Alert එකක්ද කියලා බලනවා (අලුත් ගෙවීමක්ද කියලා)
        // Paddle බිලිං වල සාමාන්‍යයෙන් එන්නේ 'subscription_created' හෝ 'subscription_updated' විදිහටයි
        if (webhookData.alert_name === 'subscription_created' || webhookData.alert_name === 'subscription_updated') {
            
            // 2. ගෙවීම කරපු යූසර්ගේ ID එක ගන්නවා 
            // (Front-end එකෙන් සල්ලි ගෙවද්දී අපි මේ ID එක passthrough/custom_data විදිහට යවනවා)
            const userId = webhookData.passthrough; 
            
            // 3. මිලදී ගත්ත පැකේජ් එක මොකක්ද කියලා හොයාගන්නවා
            // මෙතන තියෙන 'PRO_PLAN_ID' අගයන් ඔයා Paddle එකේ ගිණුම හැදුවාම ලැබෙන අංක වලට පස්සේ මාරු කරන්න ඕනේ
            let newPlan = 'free';
            if (webhookData.subscription_plan_id === 'PRO_PLAN_ID_HERE') {
                newPlan = 'pro';
            } else if (webhookData.subscription_plan_id === 'UNLIMITED_PLAN_ID_HERE') {
                newPlan = 'unlimited';
            }

            // 4. යූසර්ව Database එකේ අප්ඩේට් කරනවා
            if (userId) {
                await User.findByIdAndUpdate(userId, {
                    plan: newPlan,
                    subscriptionId: webhookData.subscription_id,
                    paddleCustomerId: webhookData.user_id,
                    subscriptionStatus: webhookData.status || 'active'
                });
                console.log(`User ${userId} upgraded to ${newPlan} plan!`);
            }
        }

        // Paddle එකට "මැසේජ් එක ලැබුණා" කියලා 200 OK යවනවා (නැත්නම් එයාලා දිගටම මැසේජ් එක එවනවා)
        res.status(200).send('Webhook received successfully');

    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).send('Webhook Server Error');
    }
};