import { useState, useCallback, useRef } from "react";
import {
  compressImage,
  compressImages,
  formatBytes,
} from "../utils/imageCompressor";

/**
 * Custom React hook for client-side image compression.
 *
 * Provides:
 * - `compress(file, options)` — compress a single image
 * - `compressBatch(files, options)` — compress multiple images
 * - `isCompressing` — loading state for UI feedback
 * - `progress` — compression progress (0-100) for single file ops
 * - `lastStats` — stats from the most recent compression
 * - `error` — error message if something goes wrong
 * - `reset()` — clear error and stats
 *
 * Edge cases handled:
 * - Prevents concurrent compressions (debounce protection)
 * - Cleans up on unmount to avoid memory leaks / state-after-unmount
 * - Falls back gracefully to original file on any failure
 *
 * @param {Object} [defaultOptions] - Default compression options for all calls
 * @returns {Object} Hook API
 *
 * @example
 * const { compress, isCompressing, lastStats } = useImageCompressor();
 *
 * const handleFile = async (e) => {
 *   const result = await compress(e.target.files[0]);
 *   if (result) {
 *     setFormData(prev => ({ ...prev, imageFile: result.file }));
 *     // result.stats contains compression info
 *   }
 * };
 */
export default function useImageCompressor(defaultOptions = {}) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastStats, setLastStats] = useState(null);
  const [error, setError] = useState(null);

  // Track mount state to prevent setting state after unmount
  const mountedRef = useRef(true);
  // Prevent concurrent compressions
  const compressingRef = useRef(false);

  // Cleanup on unmount
  useState(() => {
    return () => {
      mountedRef.current = false;
    };
  });

  /**
   * Compress a single image file.
   * @param {File} file - The image file to compress
   * @param {Object} [options] - Override options for this specific call
   * @returns {Promise<{file: File, stats: Object} | null>}
   */
  const compress = useCallback(
    async (file, options = {}) => {
      // Guard: prevent concurrent compressions
      if (compressingRef.current) {
        console.warn(
          "[useImageCompressor] Compression already in progress, skipping.",
        );
        return null;
      }

      compressingRef.current = true;

      if (mountedRef.current) {
        setIsCompressing(true);
        setProgress(0);
        setError(null);
      }

      try {
        const mergedOptions = {
          ...defaultOptions,
          ...options,
          onProgress: (p) => {
            if (mountedRef.current) {
              setProgress(Math.round(p));
            }
            // Also call user's onProgress if provided
            options.onProgress?.(p);
          },
        };

        const result = await compressImage(file, mergedOptions);

        if (mountedRef.current) {
          setLastStats(result.stats);
          setProgress(100);

          // Log stats for debugging in development
          if (result.stats && !result.stats.skipped) {
            console.info(
              `[ImageCompressor] ${result.stats.originalSizeFormatted} → ${result.stats.compressedSizeFormatted} (saved ${result.stats.savingsPercent})`,
            );
          } else if (result.stats?.skipped) {
            console.info(
              `[ImageCompressor] Skipped: ${result.stats.reason}`,
            );
          }
        }

        return result;
      } catch (err) {
        const errorMsg = err?.message || "Unknown compression error";
        if (mountedRef.current) {
          setError(errorMsg);
        }
        console.error("[useImageCompressor] Error:", errorMsg);

        // Fallback: return original file so the user can still upload
        return {
          file,
          stats: { skipped: true, reason: errorMsg, error: true },
        };
      } finally {
        compressingRef.current = false;
        if (mountedRef.current) {
          setIsCompressing(false);
        }
      }
    },
    [defaultOptions],
  );

  /**
   * Compress multiple image files in parallel.
   * @param {File[]} files - Array of image files
   * @param {Object} [options] - Override options
   * @returns {Promise<Array<{file: File, stats: Object}>>}
   */
  const compressBatch = useCallback(
    async (files, options = {}) => {
      if (compressingRef.current) {
        console.warn(
          "[useImageCompressor] Compression already in progress, skipping batch.",
        );
        return [];
      }

      compressingRef.current = true;

      if (mountedRef.current) {
        setIsCompressing(true);
        setProgress(0);
        setError(null);
      }

      try {
        const mergedOptions = { ...defaultOptions, ...options };
        const results = await compressImages(files, mergedOptions);

        if (mountedRef.current) {
          // Aggregate stats
          const totalOriginal = results.reduce(
            (sum, r) => sum + (r.stats?.originalSize || 0),
            0,
          );
          const totalCompressed = results.reduce(
            (sum, r) => sum + (r.stats?.compressedSize || r.stats?.originalSize || 0),
            0,
          );
          const totalSaved = totalOriginal - totalCompressed;

          setLastStats({
            fileCount: results.length,
            totalOriginalFormatted: formatBytes(totalOriginal),
            totalCompressedFormatted: formatBytes(totalCompressed),
            totalSavedFormatted: formatBytes(totalSaved),
            savingsPercent:
              totalOriginal > 0
                ? `${((totalSaved / totalOriginal) * 100).toFixed(1)}%`
                : "0%",
          });

          setProgress(100);
          console.info(
            `[ImageCompressor] Batch: ${results.length} files, ${formatBytes(totalOriginal)} → ${formatBytes(totalCompressed)}`,
          );
        }

        return results;
      } catch (err) {
        const errorMsg = err?.message || "Unknown batch compression error";
        if (mountedRef.current) {
          setError(errorMsg);
        }
        console.error("[useImageCompressor] Batch error:", errorMsg);
        return [];
      } finally {
        compressingRef.current = false;
        if (mountedRef.current) {
          setIsCompressing(false);
        }
      }
    },
    [defaultOptions],
  );

  /**
   * Reset error and stats state.
   */
  const reset = useCallback(() => {
    if (mountedRef.current) {
      setError(null);
      setLastStats(null);
      setProgress(0);
    }
  }, []);

  return {
    compress,
    compressBatch,
    isCompressing,
    progress,
    lastStats,
    error,
    reset,
    formatBytes, // Re-export for convenience in UI
  };
}
