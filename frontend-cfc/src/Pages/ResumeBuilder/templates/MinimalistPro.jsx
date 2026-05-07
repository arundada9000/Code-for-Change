import React from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaLinkedinIn,
  FaGithub,
  FaExternalLinkAlt,
} from "react-icons/fa";

/**
 * Minimalist Pro — Template #1
 *
 * A clean, modern, single-column resume layout with a subtle left accent bar.
 * All styles are inline so the template renders identically in PDF export.
 *
 * Props:
 *   - data: full resume data object
 *   - accentColor: hex color string (default: #0076B4)
 */
const MinimalistPro = ({ data, accentColor = "#0076B4" }) => {
  const { personalInfo, experience, education, skills, projects, certifications, languages, links } = data;
  const accent = accentColor || "#0076B4";

  // ---- Inline style objects ----
  const styles = {
    page: {
      width: "210mm",
      minHeight: "297mm",
      backgroundColor: "#ffffff",
      fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif",
      color: "#1e293b",
      fontSize: "10pt",
      lineHeight: "1.5",
      padding: "0",
      boxSizing: "border-box",
      position: "relative",
    },
    accentBar: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "4px",
      height: "100%",
      backgroundColor: accent,
      borderRadius: "0 2px 2px 0",
    },
    content: {
      padding: "32px 36px 32px 44px",
    },
    header: {
      marginBottom: "20px",
      borderBottom: `2px solid ${accent}20`,
      paddingBottom: "16px",
    },
    name: {
      fontSize: "26pt",
      fontWeight: 900,
      color: "#0f172a",
      letterSpacing: "-0.5px",
      lineHeight: "1.1",
      margin: 0,
    },
    title: {
      fontSize: "11pt",
      fontWeight: 500,
      color: accent,
      marginTop: "4px",
      letterSpacing: "0.5px",
    },
    contactRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "14px",
      marginTop: "10px",
      fontSize: "8.5pt",
      color: "#64748b",
    },
    contactItem: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    contactIcon: {
      color: accent,
      fontSize: "9pt",
      flexShrink: 0,
    },
    contactLink: {
      color: "#64748b",
      textDecoration: "none",
    },
    sectionTitle: {
      fontSize: "11pt",
      fontWeight: 800,
      color: accent,
      textTransform: "uppercase",
      letterSpacing: "1.5px",
      marginBottom: "10px",
      marginTop: "22px",
      paddingBottom: "4px",
      borderBottom: `1px solid ${accent}25`,
    },
    summary: {
      fontSize: "9.5pt",
      color: "#475569",
      lineHeight: "1.6",
      marginBottom: "4px",
    },
    entryHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: "2px",
    },
    entryTitle: {
      fontSize: "10.5pt",
      fontWeight: 700,
      color: "#0f172a",
    },
    entrySubtitle: {
      fontSize: "9.5pt",
      fontWeight: 500,
      color: "#475569",
    },
    entryDate: {
      fontSize: "8.5pt",
      color: "#94a3b8",
      fontWeight: 500,
      whiteSpace: "nowrap",
    },
    entryDescription: {
      fontSize: "9pt",
      color: "#64748b",
      lineHeight: "1.55",
      marginTop: "4px",
      whiteSpace: "pre-line",
    },
    entryBlock: {
      marginBottom: "12px",
    },
    skillRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      marginBottom: "8px",
    },
    skillCategory: {
      fontSize: "9pt",
      fontWeight: 700,
      color: "#334155",
      minWidth: "90px",
      marginRight: "4px",
    },
    skillChip: {
      display: "inline-block",
      padding: "2px 10px",
      backgroundColor: `${accent}12`,
      color: accent,
      borderRadius: "4px",
      fontSize: "8.5pt",
      fontWeight: 600,
    },
    projectTech: {
      fontSize: "8pt",
      color: "#94a3b8",
      marginTop: "2px",
      fontStyle: "italic",
    },
    langRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "3px 0",
      fontSize: "9pt",
    },
    langName: {
      fontWeight: 600,
      color: "#334155",
    },
    langLevel: {
      fontSize: "8.5pt",
      color: "#94a3b8",
      fontWeight: 500,
    },
    linkItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "9pt",
      color: accent,
      marginBottom: "3px",
    },
  };

  // ---- Helpers ----
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const hasContent = (arr) => arr && arr.length > 0;
  const hasAnyContactInfo = personalInfo.email || personalInfo.phone || personalInfo.address || personalInfo.website || personalInfo.linkedin || personalInfo.github;

  return (
    <div style={styles.page}>
      {/* Accent bar */}
      <div style={styles.accentBar} />

      <div style={styles.content}>
        {/* ===== HEADER ===== */}
        <div style={styles.header}>
          {personalInfo.fullName && (
            <h1 style={styles.name}>{personalInfo.fullName}</h1>
          )}
          {personalInfo.title && (
            <div style={styles.title}>{personalInfo.title}</div>
          )}

          {hasAnyContactInfo && (
            <div style={styles.contactRow}>
              {personalInfo.email && (
                <span style={styles.contactItem}>
                  <FaEnvelope style={styles.contactIcon} />
                  <a href={`mailto:${personalInfo.email}`} style={styles.contactLink}>
                    {personalInfo.email}
                  </a>
                </span>
              )}
              {personalInfo.phone && (
                <span style={styles.contactItem}>
                  <FaPhone style={styles.contactIcon} />
                  <span>{personalInfo.phone}</span>
                </span>
              )}
              {personalInfo.address && (
                <span style={styles.contactItem}>
                  <FaMapMarkerAlt style={styles.contactIcon} />
                  <span>{personalInfo.address}</span>
                </span>
              )}
              {personalInfo.website && (
                <span style={styles.contactItem}>
                  <FaGlobe style={styles.contactIcon} />
                  <a href={personalInfo.website} style={styles.contactLink} target="_blank" rel="noreferrer">
                    {personalInfo.website.replace(/^https?:\/\//, "")}
                  </a>
                </span>
              )}
              {personalInfo.linkedin && (
                <span style={styles.contactItem}>
                  <FaLinkedinIn style={styles.contactIcon} />
                  <a href={personalInfo.linkedin} style={styles.contactLink} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </span>
              )}
              {personalInfo.github && (
                <span style={styles.contactItem}>
                  <FaGithub style={styles.contactIcon} />
                  <a href={personalInfo.github} style={styles.contactLink} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ===== SUMMARY ===== */}
        {personalInfo.summary && (
          <>
            <div style={styles.sectionTitle}>Summary</div>
            <p style={styles.summary}>{personalInfo.summary}</p>
          </>
        )}

        {/* ===== EXPERIENCE ===== */}
        {hasContent(experience) && (
          <>
            <div style={styles.sectionTitle}>Experience</div>
            {experience.map((exp) => (
              <div key={exp.id} style={styles.entryBlock}>
                <div style={styles.entryHeader}>
                  <div>
                    <div style={styles.entryTitle}>{exp.position || "Position"}</div>
                    <div style={styles.entrySubtitle}>{exp.company}</div>
                  </div>
                  <div style={styles.entryDate}>
                    {formatDate(exp.startDate)}
                    {(exp.startDate || exp.endDate || exp.current) && " — "}
                    {exp.current ? "Present" : formatDate(exp.endDate)}
                  </div>
                </div>
                {exp.description && (
                  <div style={styles.entryDescription}>{exp.description}</div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ===== EDUCATION ===== */}
        {hasContent(education) && (
          <>
            <div style={styles.sectionTitle}>Education</div>
            {education.map((edu) => (
              <div key={edu.id} style={styles.entryBlock}>
                <div style={styles.entryHeader}>
                  <div>
                    <div style={styles.entryTitle}>
                      {edu.degree}{edu.degree && edu.field ? " in " : ""}{edu.field}
                    </div>
                    <div style={styles.entrySubtitle}>{edu.institution}</div>
                  </div>
                  <div style={styles.entryDate}>
                    {formatDate(edu.startDate)}
                    {(edu.startDate || edu.endDate) && " — "}
                    {formatDate(edu.endDate)}
                    {edu.gpa && ` | GPA: ${edu.gpa}`}
                  </div>
                </div>
                {edu.description && (
                  <div style={styles.entryDescription}>{edu.description}</div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ===== SKILLS ===== */}
        {hasContent(skills) && (
          <>
            <div style={styles.sectionTitle}>Skills</div>
            {skills.map((group) => (
              <div key={group.id} style={styles.skillRow}>
                {group.category && (
                  <span style={styles.skillCategory}>{group.category}:</span>
                )}
                {group.items?.map((skill, i) => (
                  <span key={i} style={styles.skillChip}>{skill}</span>
                ))}
              </div>
            ))}
          </>
        )}

        {/* ===== PROJECTS ===== */}
        {hasContent(projects) && (
          <>
            <div style={styles.sectionTitle}>Projects</div>
            {projects.map((proj) => (
              <div key={proj.id} style={styles.entryBlock}>
                <div style={styles.entryHeader}>
                  <div style={styles.entryTitle}>
                    {proj.name}
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: accent, marginLeft: "6px", fontSize: "8pt" }}
                      >
                        <FaExternalLinkAlt />
                      </a>
                    )}
                  </div>
                </div>
                {proj.description && (
                  <div style={styles.entryDescription}>{proj.description}</div>
                )}
                {proj.technologies && (
                  <div style={styles.projectTech}>Tech: {proj.technologies}</div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ===== CERTIFICATIONS ===== */}
        {hasContent(certifications) && (
          <>
            <div style={styles.sectionTitle}>Certifications</div>
            {certifications.map((cert) => (
              <div key={cert.id} style={styles.entryBlock}>
                <div style={styles.entryHeader}>
                  <div>
                    <div style={styles.entryTitle}>
                      {cert.name}
                      {cert.link && (
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: accent, marginLeft: "6px", fontSize: "8pt" }}
                        >
                          <FaExternalLinkAlt />
                        </a>
                      )}
                    </div>
                    <div style={styles.entrySubtitle}>{cert.issuer}</div>
                  </div>
                  {cert.date && (
                    <div style={styles.entryDate}>{formatDate(cert.date)}</div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ===== LANGUAGES ===== */}
        {hasContent(languages) && (
          <>
            <div style={styles.sectionTitle}>Languages</div>
            {languages.map((lang) => (
              <div key={lang.id} style={styles.langRow}>
                <span style={styles.langName}>{lang.language}</span>
                <span style={styles.langLevel}>{lang.proficiency}</span>
              </div>
            ))}
          </>
        )}

        {/* ===== CUSTOM LINKS ===== */}
        {hasContent(links) && (
          <>
            <div style={styles.sectionTitle}>Links</div>
            {links.map((link) => (
              <div key={link.id} style={styles.linkItem}>
                <FaExternalLinkAlt style={{ fontSize: "7pt" }} />
                <a href={link.url} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: "none" }}>
                  {link.label || link.url}
                </a>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default MinimalistPro;
