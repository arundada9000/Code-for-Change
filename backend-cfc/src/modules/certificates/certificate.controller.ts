import { Request, Response } from "express";
import { CertificateService } from "./certificate.service.js";
import { asyncHandler } from "../../shared/utils/errorHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { AdminService } from "../admin/admin.service.js";
import { AuthRequest } from "../../shared/middlewares/auth.middleware.js";

const certificateService = new CertificateService();
const adminService = new AdminService();

export class CertificateController {
  /**
   * Admin: Issue a new certificate
   */
  issueCertificate = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const issueData = {
      ...req.body,
      issuedBy: authReq.user?.id,
    };

    const certificate = await certificateService.issueCertificate(issueData);

    // Log Activity
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "CREATE",
        resource: "CERTIFICATE",
        resourceId: certificate._id.toString(),
        details: `Issued ${certificate.courseName} certificate to ${certificate.recipientName} (ID: ${certificate.certificateId})`,
      });
    }

    sendSuccess(res, certificate, "Certificate issued successfully", 201);
  });

  /**
   * Admin: Bulk-issue multiple certificates in one request
   */
  bulkIssueCertificates = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { sharedData, recipients } = req.body;

    const certificates = await certificateService.bulkIssueCertificates(
      { ...sharedData, issuedBy: authReq.user?.id },
      recipients,
      authReq.user!.id
    );

    // Log as a single activity entry
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "CREATE",
        resource: "CERTIFICATE",
        resourceId: "bulk",
        details: `Bulk issued ${certificates.length} × "${sharedData.courseName}" certificates for ${sharedData.province}`,
      });
    }

    sendSuccess(res, certificates, `${certificates.length} certificates issued successfully`, 201);
  });

  /**
   * Admin: Get all certificates (Ledger)
   */
  getAllCertificates = asyncHandler(async (req: Request, res: Response) => {
    const certificates = await certificateService.getAllCertificates(req.query);
    sendSuccess(res, certificates, "Certificates ledger fetched successfully");
  });

  /**
   * Public: Verify certificate by token or ID
   */
  verifyCertificate = asyncHandler(async (req: Request, res: Response) => {
    const certificate = await certificateService.verifyCertificate((req.params.token as string));
    sendSuccess(res, certificate, "Certificate verification successful");
  });

  /**
   * Admin: Update certificate status
   */
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const certificate = await certificateService.updateStatus((req.params.id as string), status);

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "UPDATE",
        resource: "CERTIFICATE",
        resourceId: certificate._id.toString(),
        details: `Updated certificate status for ${certificate.recipientName} to ${status}`,
      });
    }

    sendSuccess(res, certificate, `Certificate marked as ${status.toLowerCase()}`);
  });

  /**
   * Admin: Delete certificate
   */
  deleteCertificate = asyncHandler(async (req: Request, res: Response) => {
    const certificate = await certificateService.getCertificateByIdOrSerial((req.params.id as string));
    await certificateService.deleteCertificate((req.params.id as string));

    // Log Activity
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await adminService.logActivity({
        userId: authReq.user.id,
        userName: authReq.user.name || authReq.user.email,
        action: "DELETE",
        resource: "CERTIFICATE",
        resourceId: (req.params.id as string),
        details: `Deleted certificate record of ${certificate.recipientName} (${certificate.certificateId})`,
      });
    }

    sendSuccess(res, null, "Certificate record removed successfully");
  });
}
