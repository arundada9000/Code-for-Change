import { sendMail } from "./mailer.js";

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (email: string, otp: string) => {
  const subject = "Your OTP Code";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #202124; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1a73e8; font-weight: normal;">Your One-Time Password (OTP)</h2>
      <p>Use the code below to complete your action. It will expire in <strong>5 minutes</strong>.</p>

      <div style="margin: 20px 0; text-align: center;">
        <span style="
          display: inline-block;
          font-size: 28px;
          letter-spacing: 5px;
          font-weight: bold;
          padding: 10px 20px;
          border: 2px solid #1a73e8;
          border-radius: 6px;
          background-color: #f1f3f4;
        ">${otp}</span>
      </div>

      <p>If you did not request this, you can safely ignore this email.</p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />

      <p style="font-size: 12px; color: #5f6368;">
        This is a system-generated email from <strong>Sajilo Digital</strong>. Please do not reply.
        Please do not reply.
      </p>
      <p style="
        color: #d8000c;
        padding: 4px;
        text-align: center;
        font-weight: semi-bold;
      ">
        ⚠️ Do NOT share this OTP with anyone. Keep it confidential.
      </p>
    </div>
  `;

  await sendMail(email, subject, html);
};
