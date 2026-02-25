import { Request, Response } from "express";
import { ContactService } from "./contact.service.js";
import { asyncHandler } from "../../shared/utils/errorHandler.js";
import { successResponse } from "../../shared/utils/response.js";

const contactService = new ContactService();

export class ContactController {
  getAllContacts = asyncHandler(async (req: Request, res: Response) => {
    const contacts = await contactService.getAllContacts(req.query);
    successResponse(res, contacts, "Contacts fetched successfully");
  });

  getContactById = asyncHandler(async (req: Request, res: Response) => {
    const contact = await contactService.getContactById(req.params.id);
    successResponse(res, contact, "Contact fetched successfully");
  });

  createContact = asyncHandler(async (req: Request, res: Response) => {
    const contact = await contactService.createContact(req.body);
    sendSuccess(res, contact, "Contact form submitted successfully", 201);
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const contact = await contactService.markAsRead(req.params.id);
    sendSuccess(res, contact, "Contact marked as read");
  });

  deleteContact = asyncHandler(async (req: Request, res: Response) => {
    await contactService.deleteContact(req.params.id);
    sendSuccess(res, null, "Contact deleted successfully");
  });
}
