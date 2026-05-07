import { Resume } from "./resume.model.js";
import { AppError } from "../../shared/utils/appError.js";

const MAX_RESUMES_PER_USER = 10;

/**
 * Get all resumes for a user (sorted by updatedAt desc)
 */
export const getUserResumes = async (userId: string) => {
  return Resume.find({ userId }).sort({ updatedAt: -1 }).lean();
};

/**
 * Get a single resume by ID (must belong to the user)
 */
export const getResumeById = async (resumeId: string, userId: string) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    throw new AppError("Resume not found", 404);
  }
  return resume;
};

/**
 * Create a new resume
 */
export const createResume = async (userId: string, data: any) => {
  // Enforce per-user limit
  const count = await Resume.countDocuments({ userId });
  if (count >= MAX_RESUMES_PER_USER) {
    throw new AppError(
      `You can have at most ${MAX_RESUMES_PER_USER} resumes. Please delete one before creating a new one.`,
      400,
    );
  }

  const resume = await Resume.create({ ...data, userId });
  return resume;
};

/**
 * Update a resume (must belong to the user)
 */
export const updateResume = async (
  resumeId: string,
  userId: string,
  data: any,
) => {
  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: data },
    { new: true, runValidators: true },
  );
  if (!resume) {
    throw new AppError("Resume not found", 404);
  }
  return resume;
};

/**
 * Delete a resume (must belong to the user)
 */
export const deleteResume = async (resumeId: string, userId: string) => {
  const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });
  if (!resume) {
    throw new AppError("Resume not found", 404);
  }
  return resume;
};

/**
 * Duplicate a resume (must belong to the user)
 */
export const duplicateResume = async (resumeId: string, userId: string) => {
  // Enforce per-user limit
  const count = await Resume.countDocuments({ userId });
  if (count >= MAX_RESUMES_PER_USER) {
    throw new AppError(
      `You can have at most ${MAX_RESUMES_PER_USER} resumes. Please delete one before duplicating.`,
      400,
    );
  }

  const original = await Resume.findOne({ _id: resumeId, userId }).lean();
  if (!original) {
    throw new AppError("Resume not found", 404);
  }

  // Strip _id fields so Mongoose generates new ones
  const { _id, createdAt, updatedAt, ...rest } = original as any;
  const copy = await Resume.create({
    ...rest,
    title: `${original.title} (Copy)`,
    userId,
  });
  return copy;
};
