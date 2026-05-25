import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { createBlankResume } from "../Data/resumeData";
import API from "../Services/api";

/**
 * Custom hook for managing resumes via the backend API.
 * Falls back to localStorage if the API call fails (offline support).
 */
export function useResumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Helpers to normalize API response ----
  // The backend uses _id, the frontend uses id. Map _id → id for sub-docs too.
  const normalize = (resume) => {
    if (!resume) return resume;
    const r = { ...resume };
    if (r._id && !r.id) r.id = r._id;

    // Normalize sub-document arrays (map _id → id)
    const arrayFields = [
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "languages",
      "links",
    ];
    for (const field of arrayFields) {
      if (Array.isArray(r[field])) {
        r[field] = r[field].map((item) => ({
          ...item,
          id: item.id || item._id || crypto.randomUUID(),
        }));
      }
    }
    return r;
  };

  // ---- Load resumes on mount ----
  const fetchResumes = useCallback(async () => {
    if (!user) {
      setResumes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await API.get("/resumes");
      const data = (res.data.data || []).map(normalize);
      setResumes(data);
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  /** Get a single resume by ID (from local state first, then API) */
  const getResume = useCallback(
    (id) => {
      return resumes.find((r) => r.id === id || r._id === id) || null;
    },
    [resumes],
  );

  /** Fetch a single resume from API (for when it's not in local state yet) */
  const fetchResume = useCallback(async (id) => {
    try {
      const res = await API.get(`/resumes/${id}`);
      return normalize(res.data.data);
    } catch (err) {
      console.error("Failed to fetch resume:", err);
      return null;
    }
  }, []);

  /** Create a new resume, pre-filled with user profile data */
  const createNewResume = useCallback(async () => {
    const blank = createBlankResume(user);
    // Strip the client-side `id` — the backend generates _id
    const { ...payload } = blank;

    try {
      const res = await API.post("/resumes", payload);
      const created = normalize(res.data.data);
      setResumes((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error("Failed to create resume:", err);
      throw err;
    }
  }, [user]);

  /** Save (update) a resume */
  const saveResume = useCallback(
    async (resumeData) => {
      const resumeId = resumeData.id || resumeData._id;
      if (!resumeId) return resumeData;

      // Strip fields the backend doesn't need
      const { __v, ...payload } =
        resumeData;

      try {
        const res = await API.patch(`/resumes/${resumeId}`, payload);
        const updated = normalize(res.data.data);
        setResumes((prev) =>
          prev.map((r) =>
            (r.id === resumeId || r._id === resumeId) ? updated : r,
          ),
        );
        return updated;
      } catch (err) {
        console.error("Failed to save resume:", err);
        throw err;
      }
    },
    [],
  );

  /** Delete a resume by ID */
  const deleteResume = useCallback(async (id) => {
    try {
      await API.delete(`/resumes/${id}`);
      setResumes((prev) =>
        prev.filter((r) => r.id !== id && r._id !== id),
      );
    } catch (err) {
      console.error("Failed to delete resume:", err);
      throw err;
    }
  }, []);

  /** Duplicate a resume */
  const duplicateResume = useCallback(async (id) => {
    try {
      const res = await API.post(`/resumes/${id}/duplicate`);
      const copy = normalize(res.data.data);
      setResumes((prev) => [copy, ...prev]);
      return copy;
    } catch (err) {
      console.error("Failed to duplicate resume:", err);
      throw err;
    }
  }, []);

  return {
    resumes,
    loading,
    getResume,
    fetchResume,
    createNewResume,
    saveResume,
    deleteResume,
    duplicateResume,
    refetch: fetchResumes,
  };
}
