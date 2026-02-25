import { Response } from "express";
import { ENV } from "../configs/env.js";

export const successResponse = <T>(
  res: Response,
  data: T,
  message = "Success",
  status = 200
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  status = 400,
  details?: unknown
) => {
  const payload: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (ENV.NODE_ENV !== "production" && details) {
    payload.details = details;
  }

  return res.status(status).json(payload);
};
// Alias for backward compatibility or preferred naming
export const sendSuccess = successResponse;
export const sendError = errorResponse;
