import { Request, Response } from "express";
import { TeamService } from "./team.service.js";
import { asyncHandler } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../shared/utils/cloudinary.js";

const teamService = new TeamService();

export class TeamController {
  getAllMembers = asyncHandler(async (req: Request, res: Response) => {
    const members = await teamService.getAllMembers(req.query);
    sendSuccess(res, members, "Team members fetched successfully");
  });

  getMemberById = asyncHandler(async (req: Request, res: Response) => {
    const member = await teamService.getMemberById((req.params.id as string));
    sendSuccess(res, member, "Team member fetched successfully");
  });

  createMember = asyncHandler(async (req: Request, res: Response) => {
    let imageUrl = "";

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, "team");
        imageUrl = result.secure_url;
      } catch (error) {
        throw new Error(`Image upload failed: ${(error as Error).message}`);
      }
    }

    if (imageUrl) {
      req.body.image = imageUrl;
    }

    // Parse socialLinks if it arrives as stringified JSON from FormData
    if (typeof req.body.socialLinks === "string") {
      try {
        req.body.socialLinks = JSON.parse(req.body.socialLinks);
      } catch (e) {
        req.body.socialLinks = {};
      }
    }

    const member = await teamService.createMember(req.body);
    sendSuccess(res, member, "Team member created successfully", 201);
  });

  updateMember = asyncHandler(async (req: Request, res: Response) => {
    if (req.file) {
      const oldMember = await teamService.getMemberById((req.params.id as string));
      if (oldMember.image) {
        const publicId = oldMember.image.split("/").pop()?.split(".")[0];
        if (publicId) {
          await deleteFromCloudinary(`team/${publicId}`);
        }
      }

      try {
        const result = await uploadToCloudinary(req.file.buffer, "team");
        req.body.image = result.secure_url;
      } catch (error) {
        throw new Error(`Image upload failed: ${(error as Error).message}`);
      }
    }

    if (typeof req.body.socialLinks === "string") {
      try {
        req.body.socialLinks = JSON.parse(req.body.socialLinks);
      } catch (e) {
        req.body.socialLinks = {};
      }
    }

    const member = await teamService.updateMember((req.params.id as string), req.body);
    sendSuccess(res, member, "Team member updated successfully");
  });

  deleteMember = asyncHandler(async (req: Request, res: Response) => {
    const member = await teamService.getMemberById((req.params.id as string));
    
    if (member.image) {
      const publicId = member.image.split("/").pop()?.split(".")[0];
      if (publicId) {
        await deleteFromCloudinary(`team/${publicId}`);
      }
    }

    await teamService.deleteMember((req.params.id as string));
    sendSuccess(res, null, "Team member deleted successfully");
  });
}
