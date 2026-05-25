import imageCompression from "browser-image-compression";

/**
 * Default compression options used across the application.
 * These are tuned for a good balance between quality and file size,
 * staying well within the backend's 5MB multer limit.
 */
const DEFAULT_OPTIONS = {
  maxSizeMB: 1, // Target max file size (1MB)
  maxWidthOrHeight: 1920, // Downscale images larger than 1920px
  useWebWorker: true, // Offload to web worker so UI doesn't freeze
  initialQuality: 0.8, // Start at 80% quality
  preserveExif: false, // Strip EXIF to reduce size (orientation is auto-corrected)
};

/**
 * File types that should NOT be compressed.
 * GIFs lose animation, SVGs are vectors, and non-image files are irrelevant.
 */
const SKIP_COMPRESSION_TYPES = [
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Minimum file size threshold (in bytes) below which compression is skipped.
 * No point compressing a 50KB image — it's already tiny.
 */
const MIN_SIZE_FOR_COMPRESSION = 100 * 1024; // 100KB

/**
 * Compresses an image file on the client side before upload.
 *
 * Edge cases handled:
 * - Non-image files (PDFs, docs) → returned as-is
 * - GIFs/SVGs → returned as-is (would lose animation/vector quality)
 * - Files already smaller than 100KB → returned as-is
 * - Compression failure → falls back to original file with a console warning
 * - Null/undefined input → returns null
 * - Compressed file somehow larger than original → returns original
 *
 * @param {File} file - The file to compress
 * @param {Object} [options] - Override default compression options
 * @param {number} [options.maxSizeMB=1] - Max output size in MB
 * @param {number} [options.maxWidthOrHeight=1920] - Max dimension in px
 * @param {boolean} [options.useWebWorker=true] - Use web worker for compression
 * @param {number} [options.initialQuality=0.8] - Starting quality (0-1)
 * @param {Function} [options.onProgress] - Progress callback (0-100)
 * @returns {Promise<{file: File, stats: Object}>} Compressed file and compression stats
 */
export async function compressImage(file, options = {}) {
  // Guard: null/undefined input
  if (!file) {
    return { file: null, stats: { skipped: true, reason: "No file provided" } };
  }

  // Guard: not a File/Blob
  if (!(file instanceof Blob)) {
    return {
      file,
      stats: { skipped: true, reason: "Input is not a valid File/Blob" },
    };
  }

  const originalSize = file.size;
  const fileType = file.type;

  // Guard: non-compressible file types (GIFs, SVGs, PDFs, docs)
  if (SKIP_COMPRESSION_TYPES.includes(fileType)) {
    return {
      file,
      stats: {
        skipped: true,
        reason: `File type "${fileType}" is not compressible`,
        originalSize,
      },
    };
  }

  // Guard: non-image files that aren't in our skip list
  if (!fileType.startsWith("image/")) {
    return {
      file,
      stats: {
        skipped: true,
        reason: `Non-image file type "${fileType}"`,
        originalSize,
      },
    };
  }

  // Guard: file already small enough — no need to waste CPU
  if (originalSize <= MIN_SIZE_FOR_COMPRESSION) {
    return {
      file,
      stats: {
        skipped: true,
        reason: `File already under ${MIN_SIZE_FOR_COMPRESSION / 1024}KB`,
        originalSize,
      },
    };
  }

  // Merge user options with defaults
  const compressionOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  try {
    const compressedBlob = await imageCompression(file, compressionOptions);

    // Safety check: if compressed is somehow bigger, return original
    if (compressedBlob.size >= originalSize) {
      return {
        file,
        stats: {
          skipped: true,
          reason: "Compressed file is not smaller than original",
          originalSize,
          compressedSize: compressedBlob.size,
        },
      };
    }

    // Convert Blob back to File (preserves the original filename)
    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type || file.type,
      lastModified: Date.now(),
    });

    const compressedSize = compressedFile.size;
    const savings = originalSize - compressedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

    return {
      file: compressedFile,
      stats: {
        skipped: false,
        originalSize,
        compressedSize,
        savings,
        savingsPercent: `${savingsPercent}%`,
        originalSizeFormatted: formatBytes(originalSize),
        compressedSizeFormatted: formatBytes(compressedSize),
      },
    };
  } catch (error) {
    // Fallback: if compression fails for ANY reason, return the original file
    // This ensures the user can always upload, even if compression breaks.
    console.warn(
      "[ImageCompressor] Compression failed, using original file:",
      error.message,
    );
    return {
      file,
      stats: {
        skipped: true,
        reason: `Compression failed: ${error.message}`,
        originalSize,
        error: true,
      },
    };
  }
}

/**
 * Compress multiple image files in parallel.
 * Useful for gallery uploads or bulk operations.
 *
 * @param {File[]} files - Array of files to compress
 * @param {Object} [options] - Compression options (same as compressImage)
 * @returns {Promise<Array<{file: File, stats: Object}>>}
 */
export async function compressImages(files, options = {}) {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return [];
  }

  // Process all files concurrently
  const results = await Promise.all(
    files.map((file) => compressImage(file, options)),
  );

  return results;
}

/**
 * Formats bytes into a human-readable string (e.g. "1.5 MB").
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
