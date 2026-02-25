import mongoose from "mongoose";
import { Certificate } from "./certificate.model.js";
import { ICertificate, CertificateStatus } from "./certificate.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";

export class CertificateService {
  /**
   * Issue a new certificate
   */
  async issueCertificate(data: Partial<ICertificate>): Promise<ICertificate> {
    // Duplicate Protection: Email + Course + Date (Day portion only)
    const issueDate = data.issueDate ? new Date(data.issueDate) : new Date();
    const startOfDay = new Date(issueDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(issueDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingCert = await Certificate.findOne({
      recipientEmail: data.recipientEmail,
      courseName: data.courseName,
      issueDate: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingCert) {
      throw new AppError(`A certificate for "${data.courseName}" has already been issued to "${data.recipientEmail}" today`, 409);
    }

    try {
      return await Certificate.create(data);
    } catch (error: any) {
      // Handle MongoDB Duplicate Key (code 11000)
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || "Unknown field";
        const value = error.keyValue ? error.keyValue[field] : "unknown";
        throw new AppError(`Conflict: A certificate with this ${field} (${value}) already exists.`, 409);
      }

      console.error("Certificate Issuance Error:", error);
      throw new AppError(error.message || "Failed to issue certificate", error.statusCode || 500);
    }
  }

  /**
   * Get all certificates with filters (Ledger)
   */
  async getAllCertificates(queryParams: any = {}): Promise<ICertificate[]> {
    const { search, status, course, province, startDate, endDate } = queryParams;
    const query: any = {};

    if (search) {
      query.$or = [
        { recipientName: { $regex: search, $options: "i" } },
        { recipientEmail: { $regex: search, $options: "i" } },
        { certificateId: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "All") query.status = status;
    if (course && course !== "All") query.courseName = course;
    if (queryParams.certificateType && queryParams.certificateType !== "All") {
      query.certificateType = queryParams.certificateType;
    }
    if (province && province !== "all") query.province = province;

    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.issueDate.$lte = end;
      }
    }

    try {
      return await Certificate.find(query)
        .sort({ createdAt: -1 })
        .populate("issuedBy", "name email");
    } catch (error) {
      console.error("Ledger Fetch Error:", error);
      throw new AppError("Failed to fetch certificates ledger", 500);
    }
  }

  /**
   * Verify a certificate by its secure token or Certificate ID
   */
  async verifyCertificate(credential: string): Promise<ICertificate> {
    const certificate = await Certificate.findOne({
      $or: [
        { tokenHash: credential },
        { certificateId: credential.toUpperCase() },
      ],
    }).populate("issuedBy", "name email");

    if (!certificate) {
      throw new AppError("Invalid or non-existent certificate credential", 404);
    }
    return certificate;
  }

  /**
   * Get certificate by ID (Manual lookup)
   */
  async getCertificateByIdOrSerial(id: string): Promise<ICertificate> {
    const query = mongoose.isValidObjectId(id) 
      ? { _id: id } 
      : { certificateId: id.toUpperCase() };

    const certificate = await Certificate.findOne(query).populate("issuedBy", "name email");
    if (!certificate) {
      throw new AppError("Certificate not found", 404);
    }
    return certificate;
  }

  /**
   * Update certificate status
   */
  async updateStatus(id: string, status: CertificateStatus): Promise<ICertificate> {
    const certificate = await Certificate.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!certificate) {
      throw new AppError("Certificate not found", 404);
    }

    return certificate;
  }

  /**
   * Delete a certificate (Admin only)
   */
  async deleteCertificate(id: string): Promise<void> {
    const certificate = await Certificate.findByIdAndDelete(id);
    if (!certificate) {
      throw new AppError("Certificate not found", 404);
    }
  }
}
