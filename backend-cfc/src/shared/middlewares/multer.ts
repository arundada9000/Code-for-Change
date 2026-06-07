import multer from "multer";
import type { Request, Response, NextFunction } from "express";

// Use memory storage for now - files will be uploaded to Cloudinary from buffer
const storage = multer.memoryStorage();

/**
 * Magic byte signatures for allowed file types.
 * Checking these prevents MIME type spoofing (where a malicious file is
 * uploaded with a forged Content-Type header).
 */
const MAGIC_BYTES: { mime: string; bytes: number[]; offset?: number; additionalBytes?: { bytes: number[], offset: number } }[] = [
  // JPEG: FF D8 FF
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/jpg", bytes: [0xff, 0xd8, 0xff] },
  // PNG: 89 50 4E 47
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  // WebP: starts with RIFF, then WEBP at offset 8
  { 
    mime: "image/webp", 
    bytes: [0x52, 0x49, 0x46, 0x46], // "RIFF"
    offset: 0,
    additionalBytes: { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 } // "WEBP"
  },
  // PDF: %PDF
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  // DOC (OLE2): D0 CF 11 E0
  { mime: "application/msword", bytes: [0xd0, 0xcf, 0x11, 0xe0] },
  // DOCX (ZIP-based): PK (50 4B 03 04)
  {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    bytes: [0x50, 0x4b, 0x03, 0x04],
  },
];

const ALLOWED_MIMES = MAGIC_BYTES.map((m) => m.mime);

/**
 * Validates that an uploaded file's actual content (magic bytes) matches
 * its declared MIME type. Returns `true` if valid, `false` if forged.
 */
function isFileMagicValid(file: Express.Multer.File): boolean {
  if (!file.buffer || file.buffer.length < 4) return false;

  const signatures = MAGIC_BYTES.filter((m) => m.mime === file.mimetype);
  if (signatures.length === 0) return false;

  return signatures.some((sig) => {
    const offset = sig.offset ?? 0;
    const matchesPrimary = sig.bytes.every(
      (byte, i) => file.buffer[offset + i] === byte,
    );
    if (!matchesPrimary) return false;

    if (sig.additionalBytes) {
      if (file.buffer.length < sig.additionalBytes.offset + sig.additionalBytes.bytes.length) return false;
      return sig.additionalBytes.bytes.every(
        (byte, i) => file.buffer[sig.additionalBytes.offset + i] === byte,
      );
    }
    return true;
  });
}

/**
 * Express middleware that validates uploaded file magic bytes AFTER multer
 * has parsed the upload into `req.file` / `req.files`.
 *
 * Attach this AFTER any multer middleware in your route chain.
 *
 * @example
 *   router.post("/upload", upload.single("image"), validateFileMagicBytes, controller);
 */
export function validateFileMagicBytes(req: Request, res: Response, next: NextFunction) {
  const files: Express.Multer.File[] = [];

  if (req.file) files.push(req.file);
  if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else {
      // req.files is a Record<string, File[]> when using .fields()
      for (const fieldFiles of Object.values(req.files) as Express.Multer.File[][]) {
        files.push(...fieldFiles);
      }
    }
  }

  // No files uploaded — nothing to validate (file may be optional)
  if (files.length === 0) return next();

  for (const file of files) {
    if (!isFileMagicValid(file)) {
      return res.status(400).json({
        success: false,
        message: `File "${file.originalname}" content does not match its declared type (${file.mimetype}). Upload rejected.`,
      });
    }
  }

  next();
}

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Fast first-pass: reject obviously wrong MIME types before buffering
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, PDF, and DOC/DOCX are allowed."));
    }
  },
});
