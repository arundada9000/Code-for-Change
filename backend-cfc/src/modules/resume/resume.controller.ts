import type { Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { successResponse } from "../../shared/utils/response.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";
import * as service from "./resume.service.js";

/** GET /api/resumes — list all resumes for current user */
export const listResumes = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const resumes = await service.getUserResumes(req.user?.id!);
    successResponse(res, resumes, "Resumes retrieved");
  },
);

/** GET /api/resumes/:id — get a single resume */
export const getResume = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const resume = await service.getResumeById(req.params.id as string, req.user?.id!);
    successResponse(res, resume, "Resume retrieved");
  },
);

/** POST /api/resumes — create a new resume */
export const createResume = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const resume = await service.createResume(req.user?.id!, req.body);
    successResponse(res, resume, "Resume created", 201);
  },
);

/** PATCH /api/resumes/:id — update a resume */
export const updateResume = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const resume = await service.updateResume(
      req.params.id as string,
      req.user?.id!,
      req.body,
    );
    successResponse(res, resume, "Resume updated");
  },
);

/** DELETE /api/resumes/:id — delete a resume */
export const deleteResume = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await service.deleteResume(req.params.id as string, req.user?.id!);
    successResponse(res, null, "Resume deleted");
  },
);

/** POST /api/resumes/:id/duplicate — duplicate a resume */
export const duplicateResume = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const resume = await service.duplicateResume(req.params.id as string, req.user?.id!);
    successResponse(res, resume, "Resume duplicated", 201);
  },
);
