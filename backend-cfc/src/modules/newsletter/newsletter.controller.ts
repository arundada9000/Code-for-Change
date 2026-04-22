import { Request, Response } from "express";
import { NewsletterService } from "./newsletter.service.js";
import { asyncHandler } from "../../shared/utils/errorHandler.js";
import { successResponse } from "../../shared/utils/response.js";

const newsletterService = new NewsletterService();

export class NewsletterController {
  // Public: Subscribe to newsletter
  subscribe = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const { subscriber, isNew } = await newsletterService.subscribe(email);
    const message = isNew
      ? "Thank you for subscribing to our newsletter!"
      : "Welcome back! Your subscription has been reactivated.";
    successResponse(res, subscriber, message, 201);
  });

  // Admin: Get all subscribers
  getAllSubscribers = asyncHandler(async (req: Request, res: Response) => {
    const subscribers = await newsletterService.getAllSubscribers(req.query);
    successResponse(res, subscribers, "Subscribers fetched successfully");
  });

  // Admin: Get single subscriber
  getSubscriberById = asyncHandler(async (req: Request, res: Response) => {
    const subscriber = await newsletterService.getSubscriberById(req.params.id);
    successResponse(res, subscriber, "Subscriber fetched successfully");
  });

  // Admin: Update subscriber status
  updateSubscriber = asyncHandler(async (req: Request, res: Response) => {
    const subscriber = await newsletterService.updateSubscriber(req.params.id, req.body);
    successResponse(res, subscriber, "Subscriber updated successfully");
  });

  // Admin: Delete a subscriber
  deleteSubscriber = asyncHandler(async (req: Request, res: Response) => {
    await newsletterService.deleteSubscriber(req.params.id);
    successResponse(res, null, "Subscriber deleted successfully");
  });

  // Admin: Export subscribers (CSV or JSON)
  exportSubscribers = asyncHandler(async (req: Request, res: Response) => {
    const format = (req.query.format as "csv" | "json") || "csv";
    const { data, mimeType, filename } = await newsletterService.getExportData(format);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(data);
  });
}
