const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
    console.log('Testing Gmail SMTP connection...');
    
    // Email configuration using Gmail App Password
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Test email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECIPIENT_EMAIL,
        subject: 'Test Email from Vanguard Scraper',
        html: `
<h2>Email Test Successful! 🎉</h2>
<p>This is a test email to verify that Gmail SMTP is working correctly.</p>
<ul>
    <li><strong>From:</strong> ${process.env.EMAIL_USER}</li>
    <li><strong>To:</strong> ${process.env.RECIPIENT_EMAIL}</li>
    <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
</ul>
<p>Your Vanguard scraper is ready to send emails!</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Check your inbox at:', process.env.RECIPIENT_EMAIL);
    } catch (error) {
        console.error('❌ Failed to send test email:', error.message);
    }
}

testEmail();
