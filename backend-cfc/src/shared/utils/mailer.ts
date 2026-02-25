// src/config/mailer.ts
import { ENV } from "../configs/env.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.SMTP_USER, 
    pass: ENV.SMTP_PASS, 
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Code for Change" <${ENV.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
  } catch (err: any) {
    console.error("Failed to send email:", err);
    throw new Error(`Failed to send email: ${err.message}`);
  }
};
