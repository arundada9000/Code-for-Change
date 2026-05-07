// ============================================================
// Resume Data Shape, Defaults & Template Metadata
// ============================================================

/**
 * Creates a fresh, empty resume data object.
 * @param {Object} user - Optional user object to pre-fill personal info.
 * @returns {Object} A new resume data object with unique ID.
 */
export function createBlankResume(user = null) {
  return {
    id: crypto.randomUUID(),
    title: "Untitled Resume",
    templateId: "minimalist-pro",
    accentColor: "#0076B4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    personalInfo: {
      fullName: user?.name || "",
      title: "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      summary: user?.bio || "",
      website: user?.website || "",
      linkedin: user?.linkedin || "",
      github: user?.github || "",
      profileImage: user?.profileImage || "",
    },

    experience: [],
    education: user?.education?.collegeName
      ? [
          {
            id: crypto.randomUUID(),
            institution: user.education.collegeName || "",
            degree: "",
            field: user.education.faculty || "",
            startDate: "",
            endDate: "",
            gpa: "",
            description: "",
          },
        ]
      : [],

    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    links: [],
  };
}

// ---- Factory helpers for adding new entries ----

export function createExperienceEntry() {
  return {
    id: crypto.randomUUID(),
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
}

export function createEducationEntry() {
  return {
    id: crypto.randomUUID(),
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    gpa: "",
    description: "",
  };
}

export function createSkillGroup() {
  return {
    id: crypto.randomUUID(),
    category: "",
    items: [],
  };
}

export function createProjectEntry() {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    technologies: "",
    link: "",
  };
}

export function createCertificationEntry() {
  return {
    id: crypto.randomUUID(),
    name: "",
    issuer: "",
    date: "",
    link: "",
  };
}

export function createLanguageEntry() {
  return {
    id: crypto.randomUUID(),
    language: "",
    proficiency: "Intermediate",
  };
}

export function createLinkEntry() {
  return {
    id: crypto.randomUUID(),
    label: "",
    url: "",
  };
}

// ---- Template metadata ----

export const TEMPLATE_LIST = [
  {
    id: "minimalist-pro",
    name: "Minimalist Pro",
    description: "Clean, modern layout with subtle accent colors and strong typography.",
    isPremium: false,
  },
  {
    id: "creative-bold",
    name: "Creative Bold",
    description: "Striking two-column design with dark sidebar for creative professionals.",
    isPremium: false,
  },
  {
    id: "classic-formal",
    name: "Classic Formal",
    description: "Traditional serif-based layout ideal for corporate and executive roles.",
    isPremium: false,
  },
];

export const PROFICIENCY_LEVELS = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Beginner",
];
