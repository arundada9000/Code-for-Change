import { Request, Response } from "express";
import { AdminService } from "./admin.service.js";
import { asyncHandler } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";

const adminService = new AdminService();

export class AdminController {
  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, stats, "Dashboard statistics fetched successfully");
  });

  getAllContent = asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.query;
    const content = await adminService.getAllContent(type as string);
    sendSuccess(res, content, `${type} fetched successfully`);
  });

  // Member & User Management
  createUserController = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.createUser(req.body);
    
    await adminService.logActivity({
      userId: (req as any).user?.id,
      userName: (req as any).user?.name,
      action: "CREATE",
      resource: "USER",
      details: `Created new user/member: ${user.name}`,
    });

    sendSuccess(res, user, "User created successfully");
  });

  updateUserController = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.updateUser(req.params.id, req.body, (req as any).user);

    await adminService.logActivity({
      userId: (req as any).user?.id,
      userName: (req as any).user?.name,
      action: "UPDATE",
      resource: "USER",
      details: `Updated user/member: ${user.name}`,
    });

    sendSuccess(res, user, "User updated successfully");
  });

  deleteUserController = asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteUser(req.params.id);

    await adminService.logActivity({
      userId: (req as any).user?.id,
      userName: (req as any).user?.name,
      action: "DELETE",
      resource: "USER",
      details: `Deleted user with ID: ${req.params.id}`,
    });

    sendSuccess(res, null, "User deleted successfully");
  });

  getUserDetails = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.getUserById(req.params.id);
    sendSuccess(res, user, "User details fetched successfully");
  });

  getEventDetails = asyncHandler(async (req: Request, res: Response) => {
    const event = await adminService.getEventById(req.params.id);
    sendSuccess(res, event, "Event details fetched successfully");
  });

  getBlogDetails = asyncHandler(async (req: Request, res: Response) => {
    const blog = await adminService.getBlogById(req.params.id);
    sendSuccess(res, blog, "Blog details fetched successfully");
  });

  globalSearch = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    const results = await adminService.globalSearch(q as string);
    sendSuccess(res, results, "Global search results fetched successfully");
  });
}
