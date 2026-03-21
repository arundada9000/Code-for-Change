import mongoose, { Schema } from "mongoose";
import { ICertificate, CertificateStatus, CertificateType } from "./certificate.interface.js";
import crypto from "crypto";
import QRCode from "qrcode";
import { ENV } from "../../shared/configs/env.js";

const CertificateSchema: Schema = new Schema(
  {
    recipientName: { type: String, required: true, trim: true },
    recipientEmail: { type: String, required: false, lowercase: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    province: { type: String, trim: true },
    certificateType: {
      type: String,
      enum: Object.values(CertificateType),
      default: CertificateType.Event,
    },
    certificateId: { type: String, unique: true },
    tokenHash: { type: String, unique: true },
    qrCode: { type: String },
    issueDate: { type: Date, default: Date.now },
    startDate: { type: Date },
    endDate: { type: Date },
    expiryDate: { type: Date },
    duration: { type: String, trim: true },
    hours: { type: String, trim: true },
    regdNo: { type: String, trim: true },
    grade: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(CertificateStatus),
      default: CertificateStatus.Valid,
    },
    programId: { type: Schema.Types.ObjectId }, // Flexible link to Event or Internship
    issuedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    metadata: { type: Schema.Types.Map, of: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook to generate certificateId and tokenHash
CertificateSchema.pre("save", async function () {
  if (this.isNew) {
    // Generate secure token for verification URL
    if (!this.tokenHash) {
      this.tokenHash = crypto.randomUUID();
    }

    // Generate Certificate ID: CFC-YYYYMMDD-XXXXX
    if (!this.certificateId) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
      this.certificateId = `CFC-${dateStr}-${randomSuffix}`;
    }

    // Generate QR Code for verification
    if (!this.qrCode || this.isModified("tokenHash")) {
      try {
        const baseUrl = ENV.FRONTEND_URL || "https://codeforchangenepal.com";
        const verifyUrl = `${baseUrl}/certificate-verification/${this.certificateId}`;
        this.qrCode = await QRCode.toDataURL(verifyUrl, {
          errorCorrectionLevel: 'H',
          margin: 1,
          color: {
            dark: '#0f172a', // slate-900
            light: '#ffffff'
          }
        });
      } catch (err) {
        console.error("QR Code Generation Error:", err);
      }
    }
  }
});

// Indexes for verification and ledger
CertificateSchema.index({ certificateId: 1 });
CertificateSchema.index({ tokenHash: 1 });
CertificateSchema.index({ recipientName: "text", recipientEmail: "text", courseName: "text" });

export const Certificate = mongoose.model<ICertificate>("Certificate", CertificateSchema);
