import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    }
});

export const sendOTPEmail = async (email, otp, firstName) => {
    await transporter.sendMail({
        from: `"Hotspot" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Verify your Hotspot account",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; border: 1px solid #ebebeb; border-radius: 12px;">
                <h2 style="color: #222; margin-bottom: 0.5rem;">Welcome to Hotspot, ${firstName}!</h2>
                <p style="color: #555; margin-bottom: 1.5rem;">Use the OTP below to verify your email. It expires in <strong>10 minutes</strong>.</p>
                <div style="background-color: #fff5f5; border: 1px solid #ffd5d5; border-radius: 8px; padding: 1.5rem; text-align: center; margin-bottom: 1.5rem;">
                    <p style="font-size: 2rem; font-weight: 700; color: #fe424d; letter-spacing: 0.5rem; margin: 0;">${otp}</p>
                </div>
                <p style="color: #888; font-size: 0.85rem;">If you did not create an account, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #ebebeb; margin: 1.5rem 0;">
                <p style="color: #888; font-size: 0.8rem; margin: 0;">© Hotspot Private Limited</p>
            </div>
        `
    });
};