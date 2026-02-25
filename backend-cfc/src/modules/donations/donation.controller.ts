import { Request, Response } from "express";
import { DonationService } from "./donation.service.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { successResponse } from "../../shared/utils/response.js";
import { uploadToCloudinary, CLOUDINARY_FOLDERS } from "../../shared/utils/cloudinary.js";

const donationService = new DonationService();

export class DonationController {
  createDonation = asyncHandler(async (req: Request, res: Response) => {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.IMPACT);
      req.body.receipt = result.secure_url;
    }
    const donation = await donationService.createDonation(req.body);
    successResponse(res, donation, "Donation recorded successfully. It will be verified soon.", 201);
  });

  getAllDonations = asyncHandler(async (req: Request, res: Response) => {
    const donations = await donationService.getAllDonations(req.query);
    successResponse(res, donations, "Donations retrieved successfully");
  });

  getDonationById = asyncHandler(async (req: Request, res: Response) => {
    const donation = await donationService.getDonationById(req.params.id);
    successResponse(res, donation, "Donation detail retrieved successfully");
  });

  updateDonationStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const verifiedBy = (req as any).user?.name || 'Admin';
    const donation = await donationService.updateDonationStatus(req.params.id, status, verifiedBy);
    successResponse(res, donation, `Donation ${status.toLowerCase()} successfully`);
  });

  updateDonation = asyncHandler(async (req: Request, res: Response) => {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.IMPACT);
      req.body.receipt = result.secure_url;
    }
    const donation = await donationService.updateDonation(req.params.id, req.body);
    successResponse(res, donation, "Donation record updated successfully");
  });

  getDonationStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await donationService.getDonationStats();
    successResponse(res, stats, "Donation statistics retrieved successfully");
  });

  initiatePayment = asyncHandler(async (req: Request, res: Response) => {
    const paymentData = await donationService.initiateESewaPayment(req.body);
    successResponse(res, paymentData, "eSewa payment initiated successfully");
  });

  verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const { data } = req.query;
    if (!data) throw new Error("No payment data provided");
    const donation = await donationService.verifyESewaPayment(data as string);
    successResponse(res, donation, "eSewa payment verified successfully");
  });
}
