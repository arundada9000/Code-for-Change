import mongoose from "mongoose";
import { Certificate } from "./certificate.model.js";
import { Counter } from "./counter.model.js";
import { ICertificate, CertificateStatus } from "./certificate.interface.js";
import { AppError } from "../../shared/utils/errorHandler.js";
import { escapeRegex } from "../../shared/utils/escapeRegex.js";

// ── Region Code Dictionary ────────────────────────────────────────────────────
// Strict 2-letter codes so IDs are always predictable
const REGION_CODES: Record<string, string> = {
  Kathmandu:   "KA",
  Pokhara:     "PO",
  Rupandehi:   "RU",
  Dang:        "DA",
  Birgunj:     "BI",
  Farwest:     "FW",
  Koshi:       "KO",
  Chitwan:     "CH",
  "LB Karnali":"LB",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Sanitise a prefix: uppercase, alphanumeric only, max 4 chars */
const sanitizePrefix = (raw?: string): string =>
  (raw ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);

/** Pad a number to 4 digits: 3 → "0003" */
const pad4 = (n: number): string => String(n).padStart(4, "0");

/** Get (or create) atomic next sequence number for a province-year key */
const nextSeq = async (province: string, year: number): Promise<number> => {
  const counterId = `${province}-${year}`;
  const doc = await Counter.findOneAndUpdate(
    { counterId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return doc.seq;
};

export class CertificateService {
  // ── Single Issue ────────────────────────────────────────────────────────────
  async issueCertificate(data: Partial<ICertificate>): Promise<ICertificate> {
    // Duplicate protection: same Name + Course + same day
    const issueDate = data.issueDate ? new Date(data.issueDate) : new Date();
    const startOfDay = new Date(issueDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(issueDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingCert = await Certificate.findOne({
      recipientName: data.recipientName,
      courseName: data.courseName,
      issueDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingCert) {
      throw new AppError(
        `A certificate for "${data.courseName}" has already been issued to "${data.recipientName}" today`,
        409
      );
    }

    try {
      return await Certificate.create(data);
    } catch (error: any) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || "Unknown field";
        const value = error.keyValue ? error.keyValue[field] : "unknown";
        throw new AppError(`Conflict: A certificate with this ${field} (${value}) already exists.`, 409);
      }
      console.error("Certificate Issuance Error:", error);
      throw new AppError(error.message || "Failed to issue certificate", error.statusCode || 500);
    }
  }

  // ── Bulk Issue ──────────────────────────────────────────────────────────────
  /**
   * Issues multiple certificates at once.
   * ID Pattern: [Prefix1]-[RegionCode]-[YY]-[Prefix2]-[0001]
   * Sequence is tracked atomically per Province+Year to prevent any clash.
   */
  async bulkIssueCertificates(
    sharedData: Partial<ICertificate> & { province: string },
    recipients: Array<{
      recipientName: string;
      recipientEmail?: string;
      prefix1?: string;
      prefix2?: string;
    }>,
    issuedById: string
  ): Promise<ICertificate[]> {
    const province = sharedData.province;
    const regionCode = REGION_CODES[province];
    if (!regionCode) {
      throw new AppError(`Unknown province: "${province}". Cannot generate certificate ID.`, 400);
    }

    const issueDate = sharedData.issueDate ? new Date(sharedData.issueDate as any) : new Date();
    const year = issueDate.getFullYear() % 100; // two-digit year: 2026 → 26

    const issued: ICertificate[] = [];
    const errors: string[] = [];

    for (const recipient of recipients) {
      const name = recipient.recipientName.trim();

      // Duplicate guard per recipient
      const startOfDay = new Date(issueDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(issueDate);
      endOfDay.setHours(23, 59, 59, 999);

      const dupe = await Certificate.findOne({
        recipientName: name,
        courseName: sharedData.courseName,
        issueDate: { $gte: startOfDay, $lte: endOfDay },
      });

      if (dupe) {
        errors.push(`Skipped "${name}" — certificate for this course already issued today.`);
        continue;
      }

      // Build the unique ID atomically
      const seq = await nextSeq(province, 2000 + year);
      if (seq > 9999) {
        throw new AppError(
          `Province "${province}" has exceeded 9999 certificates for ${2000 + year}. ` +
          `Please contact the development team to extend the sequence.`,
          409
        );
      }

      const p1 = sanitizePrefix(recipient.prefix1);
      const p2 = sanitizePrefix(recipient.prefix2);

      // Build certificateId: parts that exist are joined with "-"
      const parts = [p1, regionCode, String(year).padStart(2, "0"), p2, pad4(seq)].filter(Boolean);
      const certificateId = parts.join("-");

      try {
        const cert = await Certificate.create({
          ...sharedData,
          recipientName: name,
          recipientEmail: recipient.recipientEmail || undefined,
          certificateId,
          issuedBy: issuedById,
          issueDate,
        });
        issued.push(cert);
      } catch (err: any) {
        // Unique index collision is technically impossible due to atomic counter,
        // but we handle it defensively just in case.
        if (err.code === 11000) {
          errors.push(`Skipped "${name}" — generated ID "${certificateId}" already exists (unexpected collision).`);
        } else {
          errors.push(`Failed to issue for "${name}": ${err.message}`);
        }
      }
    }

    if (issued.length === 0) {
      throw new AppError(
        `No certificates were issued. Reasons: ${errors.join(" | ")}`,
        409
      );
    }

    // Log skipped entries but don't fail the whole batch
    if (errors.length > 0) {
      console.warn("[BulkIssue] Skipped entries:", errors);
    }

    return issued;
  }

  // ── Ledger ──────────────────────────────────────────────────────────────────
  async getAllCertificates(queryParams: any = {}): Promise<ICertificate[]> {
    const { search, status, course, province, startDate, endDate } = queryParams;
    const query: any = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { recipientName: { $regex: safeSearch, $options: "i" } },
        { recipientEmail: { $regex: safeSearch, $options: "i" } },
        { certificateId: { $regex: safeSearch, $options: "i" } },
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

  // ── Verify ──────────────────────────────────────────────────────────────────
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

  // ── By ID ───────────────────────────────────────────────────────────────────
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

  // ── Update Status ───────────────────────────────────────────────────────────
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

  // ── Delete ──────────────────────────────────────────────────────────────────
  async deleteCertificate(id: string): Promise<void> {
    const certificate = await Certificate.findByIdAndDelete(id);
    if (!certificate) {
      throw new AppError("Certificate not found", 404);
    }
  }
}
