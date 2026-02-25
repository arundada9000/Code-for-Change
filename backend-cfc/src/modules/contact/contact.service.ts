import { Contact } from "./contact.model.js";
import { IContact } from "./contact.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";

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
    return await Contact.create(data);
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
