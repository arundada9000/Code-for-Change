import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { createBlankResume } from "../Data/resumeData";

const STORAGE_KEY_PREFIX = "cfc_resumes_";

/**
 * Custom hook for managing resumes in localStorage.
 * Designed as a clean abstraction that can be swapped to API calls later.
 *
 * Usage:
 *   const { resumes, loading, getResume, saveResume, deleteResume, duplicateResume, createNewResume } = useResumes();
 */
export function useResumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const storageKey = `${STORAGE_KEY_PREFIX}${user?._id || user?.id || "guest"}`;

  // Load resumes from localStorage on mount
  useEffect(() => {
    if (!user) {
      setResumes([]);
      setLoading(false);
      return;
    }
    try {
      const stored = localStorage.getItem(storageKey);
      setResumes(stored ? JSON.parse(stored) : []);
    } catch (err) {
      console.error("Failed to load resumes from localStorage:", err);
      setResumes([]);
    }
    setLoading(false);
  }, [storageKey, user]);

  // Persist to localStorage whenever resumes change
  const persist = useCallback(
    (updated) => {
      setResumes(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save resumes to localStorage:", err);
      }
    },
    [storageKey],
  );

  /** Get a single resume by ID */
  const getResume = useCallback(
    (id) => {
      return resumes.find((r) => r.id === id) || null;
    },
    [resumes],
  );

  /** Create a new resume pre-filled with user profile data */
  const createNewResume = useCallback(() => {
    const newResume = createBlankResume(user);
    const updated = [newResume, ...resumes];
    persist(updated);
    return newResume;
  }, [user, resumes, persist]);

  /** Save (create or update) a resume */
  const saveResume = useCallback(
    (resumeData) => {
      const now = new Date().toISOString();
      const existing = resumes.findIndex((r) => r.id === resumeData.id);

      let updated;
      if (existing >= 0) {
        // Update existing
        updated = resumes.map((r) =>
          r.id === resumeData.id ? { ...resumeData, updatedAt: now } : r,
        );
      } else {
        // Add new
        updated = [{ ...resumeData, createdAt: now, updatedAt: now }, ...resumes];
      }
      persist(updated);
      return resumeData;
    },
    [resumes, persist],
  );

  /** Delete a resume by ID */
  const deleteResume = useCallback(
    (id) => {
      const updated = resumes.filter((r) => r.id !== id);
      persist(updated);
    },
    [resumes, persist],
  );

  /** Duplicate a resume */
  const duplicateResume = useCallback(
    (id) => {
      const original = resumes.find((r) => r.id === id);
      if (!original) return null;

      const copy = {
        ...JSON.parse(JSON.stringify(original)),
        id: crypto.randomUUID(),
        title: `${original.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [copy, ...resumes];
      persist(updated);
      return copy;
    },
    [resumes, persist],
  );

  return {
    resumes,
    loading,
    getResume,
    createNewResume,
    saveResume,
    deleteResume,
    duplicateResume,
  };
}
