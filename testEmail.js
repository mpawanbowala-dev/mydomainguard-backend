require('dotenv').config();
const sendEmail = require('./src/utils/sendEmail'); // ෆෝල්ඩර් එක තියෙන තැන අනුව මේක වෙනස් වෙන්න පුළුවන්

const testMyEmail = async () => {
    console.log("⏳ ඊමේල් එක යවමින් පවතී...");
    
    // මෙතනට ඔයාගේ පෞද්ගලික (Personal) ඊමේල් එක දෙන්න, මේක එනවද කියලා බලන්න
    const receiverEmail = "mpawanbowala@gmail.com"; 

    const success = await sendEmail(
        receiverEmail,
        "🎉 MyDomainGuard Test Alert!",
        "සුබ පැතුම් මලිඳු! ඔයාගේ Node.js Email සිස්ටම් එක 100% ක් සාර්ථකව වැඩ කරනවා. 🚀"
    );

    if (success) {
        console.log("✅ වැඩේ ගොඩ! ඔයාගේ Inbox එක චෙක් කරලා බලන්න.");
    } else {
        console.log("🔴 මොකක් හරි අවුලක් තියෙනවා, .env එකේ විස්තර හරිද බලන්න.");
    }
};

testMyEmail();