import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER || '"SpotIt App" <no-reply@spotit.com>',
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        return null;
    }
};

export const sendWelcomeEmail = async (user) => {
    const subject = "Welcome to SpotIt! 🌍";
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome, ${user.name}!</h2>
            <p>Thank you for joining <strong>SpotIt</strong>. We are excited to have you on board.</p>
            <p>Start spotting civic issues and help us make the city better!</p>
            <br>
            <p>Best regards,</p>
            <p>The SpotIt Team</p>
        </div>
    `;
    return sendEmail(user.email, subject, html);
};
