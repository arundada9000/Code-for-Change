import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { z } from "zod";

export const validateReqBody =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res
        .status(400)
        .json({ success: false, message: (error as Error).message });
    }
  };

/**
 * Middleware to validate request using Zod schema
 * Validates body, params, and query
 */
export const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res
        .status(400)
        .json({ success: false, message: (error as Error).message });
    }
  };

  /**
 * Middleware to validate MongoDB ObjectId in route params
 */
export const validateMongoId =
  (paramName: string = "id") =>
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid MongoDB ObjectId in parameter "${paramName}"`,
      });
    }

    next();
  };