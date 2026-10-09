import nodemailer from 'nodemailer';

// Create transporter dynamically based on available env variables
const getTransporter = () => {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (user && pass) {
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user, pass }
      });
    }
    // Default to Gmail service
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }
  return null;
};

/**
 * Sends a 6-digit OTP email to user for Password Reset
 */
export const sendPasswordResetOtpEmail = async (toEmail, otp) => {
  const transporter = getTransporter();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; background-color: #0b0f19; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #06b6d4, #2563eb); padding: 28px 24px; text-align: center;">
        <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">OG SUPPLEMENTS</h1>
        <p style="margin: 4px 0 0 0; color: #000; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Admin Security Portal</p>
      </div>
      <div style="padding: 32px 28px;">
        <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff;">Password Reset Request</h2>
        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
          We received a request to reset your password for your <strong>OG Supplements</strong> account (<strong>${toEmail}</strong>).
        </p>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #38bdf8; letter-spacing: 1px; margin-bottom: 8px;">Your 6-Digit Verification Code</span>
          <span style="display: inline-block; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">${otp}</span>
          <span style="display: block; font-size: 11px; color: #94a3b8; margin-top: 8px;">Valid for 10 minutes only. Do not share this with anyone.</span>
        </div>

        <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
          If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
      <div style="border-top: 1px solid #1e293b; padding: 16px 28px; text-align: center; font-size: 11px; color: #64748b;">
        &copy; ${new Date().getFullYear()} OG Supplements India. 100% Authentic Gym Nutrition.
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`\x1b[33m[Email Service Notice]\x1b[0m SMTP credentials not configured in env. OTP for ${toEmail} is: \x1b[32m${otp}\x1b[0m`);
    return {
      sent: false,
      simulated: true,
      message: 'SMTP not configured; simulated delivery in dev logs',
      otp
    };
  }

  const sender = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@ogsupplement.com';

  const mailOptions = {
    from: `"OG Supplements Security" <${sender}>`,
    to: toEmail,
    subject: `🔐 Your OG-Supplements Password Reset Code: ${otp}`,
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`\x1b[32m[Email Sent]\x1b[0m Password reset OTP sent to ${toEmail}. Message ID: ${info.messageId}`);
  return { sent: true, messageId: info.messageId };
};
