import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Nammakasa - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF6B00 0%, #003D82 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0;">🗑️ Nammakasa</h1>
            <p style="color: #e0e0e0; margin: 5px 0;">Admin Panel</p>
          </div>
          
          <div style="padding: 30px; background: #f5f5f5; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #003D82; margin-bottom: 20px;">Email Verification Code</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Your OTP (One-Time Password) for email verification is:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #FF6B00;">
              <h1 style="color: #FF6B00; letter-spacing: 5px; margin: 0; font-size: 32px; font-weight: bold;">
                ${otp}
              </h1>
            </div>
            
            <p style="color: #999; font-size: 12px; margin: 20px 0;">
              This OTP will expire in 10 minutes. Do not share this code with anyone.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 Nammakasa Waste Management System</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

export default transporter;
