import React from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaLinkedinIn,
  FaGithub,
  FaExternalLinkAlt,
  FaStar,
} from "react-icons/fa";

/**
 * Creative Bold — Template #2
 *
 * A striking two-column layout with a dark sidebar containing personal info,
 * skills, languages, and links. The main area has experience, education,
 * projects, and certifications. Uses the accent color as highlight.
 *
 * All styles inline for PDF export fidelity.
 */
const CreativeBold = ({ data, accentColor = "#6366f1" }) => {
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    links,
  } = data;
  const accent = accentColor || "#6366f1";

  const styles = {
    page: {
      width: "210mm",
      minHeight: "297mm",
      backgroundColor: "#ffffff",
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      color: "#1e293b",
      fontSize: "9.5pt",
      lineHeight: "1.5",
      display: "flex",
      boxSizing: "border-box",
    },
    sidebar: {
      width: "72mm",
      backgroundColor: "#0f172a",
      color: "#e2e8f0",
      padding: "28px 20px",
      flexShrink: 0,
      minHeight: "297mm",
    },
    main: {
      flex: 1,
      padding: "28px 28px 28px 24px",
    },
    // Sidebar styles
    avatar: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      backgroundColor: accent,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "28pt",
      fontWeight: 900,
      color: "#fff",
      margin: "0 auto 16px",
      border: `3px solid ${accent}`,
    },
    sidebarName: {
      fontSize: "16pt",
      fontWeight: 900,
      color: "#ffffff",
      textAlign: "center",
      lineHeight: "1.2",
      marginBottom: "4px",
    },
    sidebarTitle: {
      fontSize: "9pt",
      fontWeight: 500,
      color: accent,
      textAlign: "center",
      marginBottom: "20px",
      letterSpacing: "0.5px",
    },
    sidebarSection: {
      marginBottom: "18px",
    },
    sidebarSectionTitle: {
      fontSize: "8pt",
      fontWeight: 800,
      color: accent,
      textTransform: "uppercase",
      letterSpacing: "2px",
      marginBottom: "10px",
      paddingBottom: "5px",
      borderBottom: `1px solid ${accent}40`,
    },
    contactItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      fontSize: "8pt",
      color: "#cbd5e1",
      marginBottom: "7px",
      lineHeight: "1.4",
    },
    contactIcon: {
      color: accent,
      fontSize: "9pt",
      marginTop: "1px",
      flexShrink: 0,
    },
    contactLink: {
      color: "#cbd5e1",
      textDecoration: "none",
      wordBreak: "break-all",
    },
    skillChip: {
      display: "inline-block",
      padding: "3px 9px",
      backgroundColor: `${accent}20`,
      color: accent,
      borderRadius: "4px",
      fontSize: "7.5pt",
      fontWeight: 600,
      marginRight: "4px",
      marginBottom: "4px",
    },
    skillCategory: {
      fontSize: "8pt",
      fontWeight: 700,
      color: "#f1f5f9",
      marginBottom: "4px",
    },
    skillGroup: {
      marginBottom: "8px",
    },
    langRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "8pt",
      marginBottom: "5px",
    },
    langName: {
      color: "#f1f5f9",
      fontWeight: 600,
    },
    langLevel: {
      color: "#94a3b8",
      fontSize: "7.5pt",
    },
    linkItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "8pt",
      marginBottom: "5px",
    },
    // Main area styles
    mainSectionTitle: {
      fontSize: "12pt",
      fontWeight: 900,
      color: "#0f172a",
      textTransform: "uppercase",
      letterSpacing: "1px",
      marginBottom: "12px",
      marginTop: "20px",
      paddingBottom: "6px",
      borderBottom: `3px solid ${accent}`,
      display: "inline-block",
    },
    firstSection: {
      marginTop: "0",
    },
    entryBlock: {
      marginBottom: "14px",
      paddingLeft: "12px",
      borderLeft: `2px solid ${accent}30`,
    },
    entryHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: "2px",
    },
    entryTitle: {
      fontSize: "10.5pt",
      fontWeight: 800,
      color: "#0f172a",
    },
    entrySubtitle: {
      fontSize: "9pt",
      fontWeight: 500,
      color: "#64748b",
    },
    entryDate: {
      fontSize: "8pt",
      color: accent,
      fontWeight: 700,
      whiteSpace: "nowrap",
      backgroundColor: `${accent}10`,
      padding: "2px 8px",
      borderRadius: "4px",
    },
    entryDescription: {
      fontSize: "8.5pt",
      color: "#475569",
      lineHeight: "1.55",
      marginTop: "4px",
      whiteSpace: "pre-line",
    },
    summary: {
      fontSize: "9pt",
      color: "#475569",
      lineHeight: "1.65",
      marginBottom: "4px",
      fontStyle: "italic",
      borderLeft: `3px solid ${accent}`,
      paddingLeft: "12px",
    },
    projectTech: {
      fontSize: "7.5pt",
      color: "#94a3b8",
      marginTop: "3px",
      fontStyle: "italic",
    },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const hasContent = (arr) => arr && arr.length > 0;
  const initials = personalInfo.fullName
    ? personalInfo.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div style={styles.page}>
      {/* ===== SIDEBAR ===== */}
      <div style={styles.sidebar}>
        {/* Avatar */}
        <div style={styles.avatar}>{initials}</div>

        {/* Name & Title */}
        {personalInfo.fullName && (
          <div style={styles.sidebarName}>{personalInfo.fullName}</div>
        )}
        {personalInfo.title && (
          <div style={styles.sidebarTitle}>{personalInfo.title}</div>
        )}

        {/* Contact */}
        <div style={styles.sidebarSection}>
          <div style={styles.sidebarSectionTitle}>Contact</div>
          {personalInfo.email && (
            <div style={styles.contactItem}>
              <FaEnvelope style={styles.contactIcon} />
              <a
                href={`mailto:${personalInfo.email}`}
                style={styles.contactLink}
              >
                {personalInfo.email}
              </a>
            </div>
          )}
          {personalInfo.phone && (
            <div style={styles.contactItem}>
              <FaPhone style={styles.contactIcon} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.address && (
            <div style={styles.contactItem}>
              <FaMapMarkerAlt style={styles.contactIcon} />
              <span>{personalInfo.address}</span>
            </div>
          )}
          {personalInfo.website && (
            <div style={styles.contactItem}>
              <FaGlobe style={styles.contactIcon} />
              <a
                href={personalInfo.website}
                style={styles.contactLink}
                target="_blank"
                rel="noreferrer"
              >
                {personalInfo.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {personalInfo.linkedin && (
            <div style={styles.contactItem}>
              <FaLinkedinIn style={styles.contactIcon} />
              <a
                href={personalInfo.linkedin}
                style={styles.contactLink}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </div>
          )}
          {personalInfo.github && (
            <div style={styles.contactItem}>
              <FaGithub style={styles.contactIcon} />
              <a
                href={personalInfo.github}
                style={styles.contactLink}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          )}
        </div>

        {/* Skills */}
        {hasContent(skills) && (
          <div style={styles.sidebarSection}>
            <div style={styles.sidebarSectionTitle}>Skills</div>
            {skills.map((group) => (
              <div key={group.id} style={styles.skillGroup}>
                {group.category && (
                  <div style={styles.skillCategory}>{group.category}</div>
                )}
                <div>
                  {group.items?.map((skill, i) => (
                    <span key={i} style={styles.skillChip}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {hasContent(languages) && (
          <div style={styles.sidebarSection}>
            <div style={styles.sidebarSectionTitle}>Languages</div>
            {languages.map((lang) => (
              <div key={lang.id} style={styles.langRow}>
                <span style={styles.langName}>{lang.language}</span>
                <span style={styles.langLevel}>{lang.proficiency}</span>
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        {hasContent(links) && (
          <div style={styles.sidebarSection}>
            <div style={styles.sidebarSectionTitle}>Links</div>
            {links.map((link) => (
              <div key={link.id} style={styles.linkItem}>
                <FaExternalLinkAlt
                  style={{ color: accent, fontSize: "7pt" }}
                />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#cbd5e1", textDecoration: "none" }}
                >
                  {link.label || link.url}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div style={styles.main}>
        {/* Summary */}
        {personalInfo.summary && (
          <>
            <div style={{ ...styles.mainSectionTitle, ...styles.firstSection }}>
              About Me
            </div>
            <p style={styles.summary}>{personalInfo.summary}</p>
          </>
        )}

        {/* Experience */}
        {hasContent(experience) && (
          <>
            <div
              style={
                !personalInfo.summary
                  ? { ...styles.mainSectionTitle, ...styles.firstSection }
                  : styles.mainSectionTitle
              }
            >
              Experience
            </div>
            {experience.map((exp) => (
              <div key={exp.id} style={styles.entryBlock}>
                <div style={styles.entryHeader}>
                  <div>
                    <div style={styles.entryTitle}>
                      {exp.position || "Position"}
                    </div>
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

        {/* Education */}
        {hasContent(education) && (
          <>
            <div style={styles.mainSectionTitle}>Education</div>
            {education.map((edu) => (
              <div key={edu.id} style={styles.entryBlock}>
                <div style={styles.entryHeader}>
                  <div>
                    <div style={styles.entryTitle}>
                      {edu.degree}
                      {edu.degree && edu.field ? " in " : ""}
                      {edu.field}
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

        {/* Projects */}
        {hasContent(projects) && (
          <>
            <div style={styles.mainSectionTitle}>Projects</div>
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
                        style={{
                          color: accent,
                          marginLeft: "6px",
                          fontSize: "8pt",
                        }}
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
                  <div style={styles.projectTech}>
                    Tech: {proj.technologies}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Certifications */}
        {hasContent(certifications) && (
          <>
            <div style={styles.mainSectionTitle}>Certifications</div>
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
                          style={{
                            color: accent,
                            marginLeft: "6px",
                            fontSize: "8pt",
                          }}
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
      </div>
    </div>
  );
};

export default CreativeBold;
