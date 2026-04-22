import { Contact } from "./contact.model.js";
import { IContact } from "./contact.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import { verifyEmailDomain } from "../../shared/utils/dns.js";
import { sendMail } from "../../shared/utils/mailer.js";
import { ENV } from "../../shared/configs/env.js"; // Ensure we get the admin email from env if needed

export class ContactService {
  async getAllContacts(filters: any = {}): Promise<IContact[]> {
    return await Contact.find(filters).sort({ createdAt: -1 });
  }

  async getContactById(id: string): Promise<IContact> {
    const contact = await Contact.findById(id);
    if (!contact) throw new AppError("Contact not found", 404);
    return contact;
  }

  async createContact(data: Partial<IContact>): Promise<IContact> {
    // 1. Verify that the email domain exists and accepts emails
    if (data.email) {
      await verifyEmailDomain(data.email);
    }

    // 2. Save to database
    const contact = await Contact.create(data);

    // 3. Send email notification to admin asynchronously
    // Using the SMTP config user email as the receiver, or a specific admin email if preferred.
    // For now, mailing to the official app email address so admins see it.
    const adminEmail = ENV.SMTP_USER || "codeforchangeofficial@gmail.com";
    
    const emailSubject = `New Contact Form Submission: ${data.subject}`;
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <hr/>
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${data.message}</p>
    `;

    // Fire and forget email (don't block the response if email fails)
    sendMail(adminEmail, emailSubject, emailHtml).catch(err => {
      console.error("Failed to send contact notification email:", err);
    });

    return contact;
  }

  async markAsRead(id: string): Promise<IContact> {
    const contact = await Contact.findByIdAndUpdate(
      id, 
      { isRead: true }, 
      { new: true }
    );
    if (!contact) throw new AppError("Contact not found", 404);
    return contact;
  }

  async deleteContact(id: string): Promise<void> {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) throw new AppError("Contact not found", 404);
  }
}
