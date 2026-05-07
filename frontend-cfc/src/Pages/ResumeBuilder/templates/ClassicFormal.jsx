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
 * Classic Formal — Template #3
 *
 * A traditional, elegant single-column layout inspired by academic CVs.
 * Uses serif-like styling for headings, clean horizontal rules, and
 * a centered header block. Ideal for corporate/executive resumes.
 *
 * All styles inline for PDF export fidelity.
 */
const ClassicFormal = ({ data, accentColor = "#1e3a5f" }) => {
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
  const accent = accentColor || "#1e3a5f";

  const styles = {
    page: {
      width: "210mm",
      minHeight: "297mm",
      backgroundColor: "#ffffff",
      fontFamily: "'Georgia', 'Times New Roman', 'Cambria', serif",
      color: "#1a1a1a",
      fontSize: "10pt",
      lineHeight: "1.55",
      padding: "0",
      boxSizing: "border-box",
    },
    content: {
      padding: "36px 40px",
    },
    // ---- Header ----
    header: {
      textAlign: "center",
      marginBottom: "8px",
      paddingBottom: "14px",
      borderBottom: `2px solid ${accent}`,
    },
    name: {
      fontSize: "28pt",
      fontWeight: 700,
      color: accent,
      letterSpacing: "2px",
      textTransform: "uppercase",
      lineHeight: "1.1",
      margin: "0 0 4px 0",
    },
    title: {
      fontSize: "11pt",
      fontWeight: 400,
      color: "#555555",
      fontStyle: "italic",
      letterSpacing: "1px",
      marginBottom: "10px",
    },
    contactRow: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "16px",
      fontSize: "8.5pt",
      color: "#444444",
    },
    contactItem: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    contactIcon: {
      color: accent,
      fontSize: "9pt",
      flexShrink: 0,
    },
    contactLink: {
      color: "#444444",
      textDecoration: "none",
    },
    // ---- Sections ----
    sectionTitle: {
      fontSize: "12pt",
      fontWeight: 700,
      color: accent,
      textTransform: "uppercase",
      letterSpacing: "2.5px",
      marginTop: "22px",
      marginBottom: "8px",
      paddingBottom: "4px",
      borderBottom: `1px solid #d0d0d0`,
      textAlign: "left",
    },
    summary: {
      fontSize: "9.5pt",
      color: "#333333",
      lineHeight: "1.7",
      marginBottom: "4px",
      textAlign: "justify",
    },
    // ---- Entries ----
    entryBlock: {
      marginBottom: "14px",
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
      color: "#1a1a1a",
    },
    entrySubtitle: {
      fontSize: "9.5pt",
      fontWeight: 400,
      color: "#555555",
      fontStyle: "italic",
    },
    entryDate: {
      fontSize: "8.5pt",
      color: "#777777",
      fontWeight: 400,
      whiteSpace: "nowrap",
      fontStyle: "italic",
    },
    entryDescription: {
      fontSize: "9pt",
      color: "#444444",
      lineHeight: "1.6",
      marginTop: "3px",
      whiteSpace: "pre-line",
      textAlign: "justify",
    },
    // ---- Skills ----
    skillRow: {
      marginBottom: "6px",
      fontSize: "9pt",
      lineHeight: "1.6",
    },
    skillCategory: {
      fontWeight: 700,
      color: "#1a1a1a",
    },
    skillItems: {
      color: "#444444",
    },
    // ---- Two-column section (languages + links) ----
    twoColGrid: {
      display: "flex",
      gap: "30px",
    },
    twoColHalf: {
      flex: 1,
    },
    langRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "2px 0",
      fontSize: "9pt",
      borderBottom: "1px dotted #e0e0e0",
    },
    langName: {
      fontWeight: 600,
      color: "#1a1a1a",
    },
    langLevel: {
      fontSize: "8.5pt",
      color: "#777777",
      fontStyle: "italic",
    },
    linkItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "9pt",
      color: accent,
      marginBottom: "4px",
    },
    projectTech: {
      fontSize: "8pt",
      color: "#888888",
      marginTop: "2px",
      fontStyle: "italic",
    },
    // ---- Horizontal divider (decorative) ----
    divider: {
      width: "60px",
      height: "1px",
      backgroundColor: accent,
      margin: "6px auto 0",
    },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const hasContent = (arr) => arr && arr.length > 0;
  const hasAnyContactInfo =
    personalInfo.email ||
    personalInfo.phone ||
    personalInfo.address ||
    personalInfo.website ||
    personalInfo.linkedin ||
    personalInfo.github;

  // Check if we should show the two-col bottom section
  const showLanguages = hasContent(languages);
  const showLinks = hasContent(links);
  const showTwoCol = showLanguages || showLinks;

  return (
    <div style={styles.page}>
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
                  <a
                    href={`mailto:${personalInfo.email}`}
                    style={styles.contactLink}
                  >
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
                  <a
                    href={personalInfo.website}
                    style={styles.contactLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {personalInfo.website.replace(/^https?:\/\//, "")}
                  </a>
                </span>
              )}
              {personalInfo.linkedin && (
                <span style={styles.contactItem}>
                  <FaLinkedinIn style={styles.contactIcon} />
                  <a
                    href={personalInfo.linkedin}
                    style={styles.contactLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                </span>
              )}
              {personalInfo.github && (
                <span style={styles.contactItem}>
                  <FaGithub style={styles.contactIcon} />
                  <a
                    href={personalInfo.github}
                    style={styles.contactLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </span>
              )}
            </div>
          )}

          <div style={styles.divider} />
        </div>

        {/* ===== SUMMARY ===== */}
        {personalInfo.summary && (
          <>
            <div style={styles.sectionTitle}>Professional Summary</div>
            <p style={styles.summary}>{personalInfo.summary}</p>
          </>
        )}

        {/* ===== EXPERIENCE ===== */}
        {hasContent(experience) && (
          <>
            <div style={styles.sectionTitle}>Professional Experience</div>
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
                    {(exp.startDate || exp.endDate || exp.current) && " – "}
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
                      {edu.degree}
                      {edu.degree && edu.field ? " in " : ""}
                      {edu.field}
                    </div>
                    <div style={styles.entrySubtitle}>{edu.institution}</div>
                  </div>
                  <div style={styles.entryDate}>
                    {formatDate(edu.startDate)}
                    {(edu.startDate || edu.endDate) && " – "}
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
            <div style={styles.sectionTitle}>Skills & Competencies</div>
            {skills.map((group) => (
              <div key={group.id} style={styles.skillRow}>
                {group.category && (
                  <span style={styles.skillCategory}>{group.category}: </span>
                )}
                <span style={styles.skillItems}>
                  {group.items?.join(" · ")}
                </span>
              </div>
            ))}
          </>
        )}

        {/* ===== PROJECTS ===== */}
        {hasContent(projects) && (
          <>
            <div style={styles.sectionTitle}>Notable Projects</div>
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
                    Technologies: {proj.technologies}
                  </div>
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

        {/* ===== LANGUAGES & LINKS (two-column) ===== */}
        {showTwoCol && (
          <div style={styles.twoColGrid}>
            {showLanguages && (
              <div style={styles.twoColHalf}>
                <div style={styles.sectionTitle}>Languages</div>
                {languages.map((lang) => (
                  <div key={lang.id} style={styles.langRow}>
                    <span style={styles.langName}>{lang.language}</span>
                    <span style={styles.langLevel}>{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            )}
            {showLinks && (
              <div style={styles.twoColHalf}>
                <div style={styles.sectionTitle}>Links</div>
                {links.map((link) => (
                  <div key={link.id} style={styles.linkItem}>
                    <FaExternalLinkAlt style={{ fontSize: "7pt" }} />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: accent, textDecoration: "none" }}
                    >
                      {link.label || link.url}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassicFormal;
