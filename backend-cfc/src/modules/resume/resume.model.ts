import mongoose, { Schema, Document } from "mongoose";

// ---- Sub-document interfaces ----

interface IExperience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

interface IEducation {
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  description?: string;
}

interface ISkillGroup {
  category: string;
  items: string[];
}

interface IProject {
  name: string;
  description?: string;
  technologies?: string;
  link?: string;
}

interface ICertification {
  name: string;
  issuer?: string;
  date?: string;
  link?: string;
}

interface ILanguage {
  language: string;
  proficiency: string;
}

interface ILink {
  label: string;
  url: string;
}

interface IPersonalInfo {
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  summary?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  profileImage?: string;
}

// ---- Main Resume interface ----

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  templateId: string;
  accentColor: string;
  personalInfo: IPersonalInfo;
  experience: IExperience[];
  education: IEducation[];
  skills: ISkillGroup[];
  projects: IProject[];
  certifications: ICertification[];
  languages: ILanguage[];
  links: ILink[];
  createdAt: Date;
  updatedAt: Date;
}

// ---- Sub-schemas ----

const ExperienceSchema = new Schema(
  {
    company: { type: String, default: "" },
    position: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    current: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  { _id: true },
);

const EducationSchema = new Schema(
  {
    institution: { type: String, default: "" },
    degree: { type: String, default: "" },
    field: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    gpa: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: true },
);

const SkillGroupSchema = new Schema(
  {
    category: { type: String, default: "" },
    items: [{ type: String }],
  },
  { _id: true },
);

const ProjectSchema = new Schema(
  {
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    technologies: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { _id: true },
);

const CertificationSchema = new Schema(
  {
    name: { type: String, default: "" },
    issuer: { type: String, default: "" },
    date: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { _id: true },
);

const LanguageSchema = new Schema(
  {
    language: { type: String, default: "" },
    proficiency: { type: String, default: "Intermediate" },
  },
  { _id: true },
);

const LinkSchema = new Schema(
  {
    label: { type: String, default: "" },
    url: { type: String, default: "" },
  },
  { _id: true },
);

const PersonalInfoSchema = new Schema(
  {
    fullName: { type: String, default: "" },
    title: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    summary: { type: String, default: "" },
    website: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    profileImage: { type: String, default: "" },
  },
  { _id: false },
);

// ---- Main Resume Schema ----

const ResumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, default: "Untitled Resume", maxlength: 200 },
    templateId: { type: String, default: "minimalist-pro" },
    accentColor: { type: String, default: "#0076B4" },
    personalInfo: { type: PersonalInfoSchema, default: () => ({}) },
    experience: { type: [ExperienceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    skills: { type: [SkillGroupSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    certifications: { type: [CertificationSchema], default: [] },
    languages: { type: [LanguageSchema], default: [] },
    links: { type: [LinkSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Limit resumes per user to 10
ResumeSchema.statics.countByUser = function (userId: string) {
  return this.countDocuments({ userId });
};

export const Resume = mongoose.model<IResume>("Resume", ResumeSchema);
