import { Request, Response } from "express";
import { ImpactService } from "./impact.service.js";
import { asyncHandler } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { uploadToCloudinary, CLOUDINARY_FOLDERS } from "../../shared/utils/cloudinary.js";

const impactService = new ImpactService();

export class ImpactController {
  getAllImpacts = asyncHandler(async (req: Request, res: Response) => {
    const impacts = await impactService.getAllImpacts(req.query);
    sendSuccess(res, impacts, "Impacts fetched successfully");
  });

  getImpactById = asyncHandler(async (req: Request, res: Response) => {
    const impact = await impactService.getImpactById((req.params.id as string));
    sendSuccess(res, impact, "Impact fetched successfully");
  });

  createImpact = asyncHandler(async (req: Request, res: Response) => {
    let imageUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.IMPACT);
      imageUrl = result.secure_url;
    }

    // Handle nested metrics from FormData if necessary
    const metrics = req.body.metrics || {};
    if (req.body['metrics[participants]']) metrics.participants = Number(req.body['metrics[participants]']);
    if (req.body['metrics[projects]']) metrics.projects = Number(req.body['metrics[projects]']);
    if (req.body['metrics[impact]']) metrics.impact = req.body['metrics[impact]'];

    const impact = await impactService.createImpact({
      ...req.body,
      image: imageUrl,
      metrics,
      isLarge: req.body.isLarge === 'true' || req.body.isLarge === true
    });
    sendSuccess(res, impact, "Impact created successfully", 201);
  });

  updateImpact = asyncHandler(async (req: Request, res: Response) => {
    let updateData = { ...req.body };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.IMPACT);
      updateData.image = result.secure_url;
    }

    // Handle nested metrics if sent as flat keys
    if (req.body['metrics[participants]'] || req.body['metrics[projects]'] || req.body['metrics[impact]']) {
      updateData.metrics = {
        participants: req.body['metrics[participants]'] ? Number(req.body['metrics[participants]']) : undefined,
        projects: req.body['metrics[projects]'] ? Number(req.body['metrics[projects]']) : undefined,
        impact: req.body['metrics[impact]'] || undefined
      };
    }

    if (updateData.isLarge !== undefined) {
      updateData.isLarge = updateData.isLarge === 'true' || updateData.isLarge === true;
    }

    const impact = await impactService.updateImpact((req.params.id as string), updateData);
    sendSuccess(res, impact, "Impact updated successfully");
  });

  deleteImpact = asyncHandler(async (req: Request, res: Response) => {
    await impactService.deleteImpact((req.params.id as string));
    sendSuccess(res, null, "Impact deleted successfully");
  });
}
