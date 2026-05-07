import React from "react";
import {
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaCogs,
  FaProjectDiagram,
  FaCertificate,
  FaLanguage,
  FaLink,
} from "react-icons/fa";

import SectionWrapper from "./SectionWrapper";
import PersonalInfoForm from "./PersonalInfoForm";
import ExperienceForm from "./ExperienceForm";
import EducationForm from "./EducationForm";
import SkillsForm from "./SkillsForm";
import ProjectsForm from "./ProjectsForm";
import CertificationsForm from "./CertificationsForm";
import LanguagesForm from "./LanguagesForm";
import LinksForm from "./LinksForm";

/**
 * ResumeEditor — left-side scrollable form with collapsible sections.
 *
 * Props:
 *   - resumeData: full resume object
 *   - onUpdate: (field, value) => void  — updates a top-level field
 *   - accentColor: hex string
 */
const ResumeEditor = ({ resumeData, onUpdate, accentColor = "#0076B4" }) => {
  const updatePersonalInfo = (field, value) => {
    onUpdate("personalInfo", { ...resumeData.personalInfo, [field]: value });
  };

  return (
    <div className="space-y-3">
      <SectionWrapper
        icon={FaUser}
        title="Personal Information"
        defaultOpen={true}
        accentColor={accentColor}
      >
        <PersonalInfoForm
          data={resumeData.personalInfo}
          onChange={updatePersonalInfo}
          accentColor={accentColor}
        />
      </SectionWrapper>

      <SectionWrapper
        icon={FaBriefcase}
        title="Work Experience"
        count={resumeData.experience.length}
        accentColor={accentColor}
      >
        <ExperienceForm
          items={resumeData.experience}
          onChange={(val) => onUpdate("experience", val)}
          accentColor={accentColor}
        />
      </SectionWrapper>

      <SectionWrapper
        icon={FaGraduationCap}
        title="Education"
        count={resumeData.education.length}
        accentColor={accentColor}
      >
        <EducationForm
          items={resumeData.education}
          onChange={(val) => onUpdate("education", val)}
          accentColor={accentColor}
        />
      </SectionWrapper>

      <SectionWrapper
        icon={FaCogs}
        title="Skills"
        count={resumeData.skills.length}
        accentColor={accentColor}
      >
        <SkillsForm
          items={resumeData.skills}
          onChange={(val) => onUpdate("skills", val)}
          accentColor={accentColor}
        />
      </SectionWrapper>

      <SectionWrapper
        icon={FaProjectDiagram}
        title="Projects"
        count={resumeData.projects.length}
        accentColor={accentColor}
      >
        <ProjectsForm
          items={resumeData.projects}
          onChange={(val) => onUpdate("projects", val)}
          accentColor={accentColor}
        />
      </SectionWrapper>

      <SectionWrapper
        icon={FaCertificate}
        title="Certifications"
        count={resumeData.certifications.length}
        accentColor={accentColor}
      >
        <CertificationsForm
          items={resumeData.certifications}
          onChange={(val) => onUpdate("certifications", val)}
        />
      </SectionWrapper>

      <SectionWrapper
        icon={FaLanguage}
        title="Languages"
        count={resumeData.languages.length}
        accentColor={accentColor}
      >
        <LanguagesForm
          items={resumeData.languages}
          onChange={(val) => onUpdate("languages", val)}
        />
      </SectionWrapper>

      <SectionWrapper
        icon={FaLink}
        title="Custom Links"
        count={resumeData.links.length}
        accentColor={accentColor}
      >
        <LinksForm
          items={resumeData.links}
          onChange={(val) => onUpdate("links", val)}
        />
      </SectionWrapper>
    </div>
  );
};

export default ResumeEditor;
