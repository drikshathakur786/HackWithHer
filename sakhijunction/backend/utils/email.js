import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to Sakhi Junction! 🌸',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Sakhi Junction!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your safe space for wellness and community</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.firstName}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We're thrilled to have you join our supportive community of women! Sakhi Junction is your digital sanctuary where you can:
          </p>
          
          <ul style="color: #666; line-height: 1.8; margin-bottom: 25px;">
            <li>💬 Connect with other women in anonymous, safe discussions</li>
            <li>🤖 Get personalized health guidance from our AI assistant</li>
            <li>📊 Track your menstrual cycle and wellness goals</li>
            <li>📚 Access curated articles and resources</li>
            <li>💝 Set up personalized self-care reminders</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;">
              Verify Your Email ✨
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
            This verification link will expire in 24 hours.
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #666; margin: 0;">With love and support,</p>
            <p style="color: #764ba2; font-weight: bold; margin: 5px 0 0 0;">The Sakhi Junction Team 💜</p>
          </div>
        </div>
      </div>
    `
  },
  
  'password-reset': {
    subject: 'Reset Your Sakhi Junction Password 🔒',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.firstName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Sakhi Junction account. If you didn't make this request, you can safely ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            To reset your password, click the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;">
              Reset Password 🔑
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
            This reset link will expire in 10 minutes for your security.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-top: 20px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Tip:</strong> Never share your password with anyone. Sakhi Junction will never ask for your password via email.
            </p>
          </div>
        </div>
      </div>
    `
  },
  
  'email-verification': {
    subject: 'Verify Your Email - Sakhi Junction ✉️',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Email Verification</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${data.firstName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Please verify your email address to complete your account setup and access all features of Sakhi Junction.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;">
              Verify Email Address ✨
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
            This verification link will expire in 24 hours.
          </p>
        </div>
      </div>
    `
  }
};

// Send email function
export const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const transporter = createTransporter();
    
    // Get template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }
    
    const mailOptions = {
      from: `"Sakhi Junction" <${process.env.EMAIL_USER}>`,
      to,
      subject: subject || emailTemplate.subject,
      html: emailTemplate.html(data)
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmail = async (emails) => {
  try {
    const transporter = createTransporter();
    const results = [];
    
    for (const emailData of emails) {
      try {
        const result = await sendEmail(emailData);
        results.push({ success: true, messageId: result.messageId, email: emailData.to });
      } catch (error) {
        results.push({ success: false, error: error.message, email: emailData.to });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    throw error;
  }
};

// Send notification email
export const sendNotificationEmail = async ({ to, subject, message, type = 'info' }) => {
  const typeStyles = {
    info: { color: '#3498db', icon: 'ℹ️' },
    success: { color: '#2ecc71', icon: '✅' },
    warning: { color: '#f39c12', icon: '⚠️' },
    error: { color: '#e74c3c', icon: '❌' }
  };
  
  const style = typeStyles[type] || typeStyles.info;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
      <div style="background: ${style.color}; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${style.icon} ${subject}</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="color: #666; line-height: 1.6;">
          ${message}
        </div>
        
        <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
          <p style="color: #666; margin: 0;">Best regards,</p>
          <p style="color: #764ba2; font-weight: bold; margin: 5px 0 0 0;">The Sakhi Junction Team 💜</p>
        </div>
      </div>
    </div>
  `;
  
  try {
    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from: `"Sakhi Junction" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    
    return result;
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
};
