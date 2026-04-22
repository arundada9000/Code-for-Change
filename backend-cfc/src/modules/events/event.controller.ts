import { Request, Response } from "express";
import { EventService } from "./event.service.js";
import { asyncHandler } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY_FOLDERS } from "../../shared/utils/cloudinary.js";
import { AdminService } from "../admin/admin.service.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

const adminService = new AdminService();
const eventService = new EventService();

export class EventController {
  /**
   * Get all events
   */
  getAllEvents = asyncHandler(async (req: Request, res: Response) => {
    const events = await eventService.getAllEvents(req.query);
    sendSuccess(res, events, "Events fetched successfully");
  });

  /**
   * Get event by ID
   */
  getEventById = asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.getEventById((req.params.id as string));
    sendSuccess(res, event, "Event fetched successfully");
  });

  /**
   * Get event by Slug
   */
  getEventBySlug = asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.getEventBySlug((req.params.slug as string));
    sendSuccess(res, event, "Event fetched successfully");
  });

  /**
   * Create event with image upload
   */
  createEvent = asyncHandler(async (req: Request, res: Response) => {
    let imageUrl = "";

    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.EVENTS);
        imageUrl = result.secure_url;
      } catch (error) {
        throw new Error(`Image upload failed: ${(error as Error).message}`);
      }
    }

    // Use uploaded image URL or fall back to body image (for URL uploads)
    if (imageUrl) {
      req.body.image = imageUrl;
    }

    console.log("Creating Access Event with Data:", {
      ...req.body,
      image: req.body.image ? "PRESENT" : "MISSING"
    });

    // Parse JSON string arrays from FormData
    const parseJsonField = (val: any) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    };

    const eventData = {
      ...req.body,
      speakers: parseJsonField(req.body.speakers),
      highlights: parseJsonField(req.body.highlights),
      benefits: parseJsonField(req.body.benefits),
      contactInfo: parseJsonField(req.body.contactInfo),
      isCompleted: req.body.isCompleted === 'true' || req.body.isCompleted === true,
      isNational: req.body.isNational === 'true' || req.body.isNational === true,
    };

    const event = await eventService.createEvent(eventData);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "CREATE",
        resource: "EVENT",
        resourceId: event._id.toString(),
        details: `Created event: ${event.title}`,
      });
    }

    sendSuccess(res, event, "Event created successfully", 201);
  });

  /**
   * Update event
   */
  updateEvent = asyncHandler(async (req: Request, res: Response) => {
    let updateData = { ...req.body };

    // Upload new image if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.EVENTS);
      updateData.image = result.secure_url;

      // Delete old image if exists
      const oldEvent = await eventService.getEventById((req.params.id as string));
      if (oldEvent.image) {
        const publicId = oldEvent.image.split("/").pop()?.split(".")[0];
        if (publicId) {
          await deleteFromCloudinary(`events/${publicId}`);
        }
      }
    }

    // Parse JSON string arrays from FormData
    const parseJsonField = (val: any) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    };

    if (updateData.speakers) updateData.speakers = parseJsonField(updateData.speakers);
    if (updateData.highlights) updateData.highlights = parseJsonField(updateData.highlights);
    if (updateData.benefits) updateData.benefits = parseJsonField(updateData.benefits);
    if (updateData.contactInfo) updateData.contactInfo = parseJsonField(updateData.contactInfo);
    if (updateData.isCompleted !== undefined) {
      updateData.isCompleted = updateData.isCompleted === 'true' || updateData.isCompleted === true;
    }
    if (updateData.isNational !== undefined) {
      updateData.isNational = updateData.isNational === 'true' || updateData.isNational === true;
    }

    const event = await eventService.updateEvent((req.params.id as string), updateData);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "UPDATE",
        resource: "EVENT",
        resourceId: event._id.toString(),
        details: `Updated event: ${event.title}`,
      });
    }

    sendSuccess(res, event, "Event updated successfully");
  });

  /**
   * Delete event
   */
  deleteEvent = asyncHandler(async (req: Request, res: Response) => {
    // Get event to delete associated image
    const event = await eventService.getEventById((req.params.id as string));

    // Delete image from Cloudinary
    if (event.image) {
      const publicId = event.image.split("/").pop()?.split(".")[0];
      if (publicId) {
        await deleteFromCloudinary(`events/${publicId}`);
      }
    }

    await eventService.deleteEvent((req.params.id as string));

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "DELETE",
        resource: "EVENT",
        resourceId: (req.params.id as string),
        details: `Deleted event: ${event.title}`,
      });
    }

    sendSuccess(res, null, "Event deleted successfully");
  });
}
