import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  FaDownload,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

/**
 * CFC Member Card — downloadable branded profile card.
 * Renders a hidden card, captures as PNG on click.
 * Props: user object from AuthContext, regionColor from parent.
 */
const MemberCard = ({ user, regionColor = "#0076B4" }) => {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Make the card visible for capture
      cardRef.current.style.position = "fixed";
      cardRef.current.style.left = "-9999px";
      cardRef.current.style.display = "flex";

      // Wait a frame for render
      await new Promise((r) => setTimeout(r, 100));

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        quality: 1,
      });

      // Hide again
      cardRef.current.style.display = "none";

      const link = document.createElement("a");
      link.download = `${(user.name || "member").replace(/\s+/g, "_")}_CFC_Card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Card download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const accent = regionColor;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const roleLabel = user.role
    ? user.role.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Member";

  const socials = [
    user.linkedin && { icon: "in", url: "LinkedIn" },
    user.github && { icon: "gh", url: "GitHub" },
    user.website && { icon: "web", url: "Website" },
  ].filter(Boolean);

  return (
    <>
      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 cursor-pointer"
        style={{
          backgroundColor: `${accent}10`,
          color: accent,
          border: `1.5px solid ${accent}25`,
        }}
      >
        <FaDownload size={14} />
        {downloading ? "Generating..." : "Download Member Card"}
      </button>

      {/* Hidden Card — rendered off-screen, captured as PNG */}
      <div
        ref={cardRef}
        style={{
          display: "none",
          width: "420px",
          flexDirection: "column",
          fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        }}
      >
        {/* Top Banner */}
        <div
          style={{
            background: `linear-gradient(135deg, #01152E 0%, ${accent} 100%)`,
            padding: "20px 24px 40px",
            position: "relative",
          }}
        >
          {/* CFC Logo area */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <img
                src="/logo.png"
                alt="CFC"
                style={{ width: "32px", height: "32px", objectFit: "contain" }}
                crossOrigin="anonymous"
              />
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "#ffffff",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    lineHeight: "1.2",
                  }}
                >
                  Code for Change
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.6)",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  Nepal
                </div>
              </div>
            </div>
            {/* Role badge */}
            <div
              style={{
                fontSize: "8px",
                fontWeight: 800,
                color: "#ffffff",
                backgroundColor: "rgba(255,255,255,0.15)",
                padding: "4px 10px",
                borderRadius: "20px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                backdropFilter: "blur(4px)",
              }}
            >
              {roleLabel}
            </div>
          </div>
        </div>

        {/* Profile section — overlapping the banner */}
        <div
          style={{
            padding: "0 24px 20px",
            marginTop: "-28px",
            position: "relative",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              border: "3px solid #ffffff",
              overflow: "hidden",
              backgroundColor: `${accent}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            }}
          >
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  color: accent,
                }}
              >
                {initials}
              </span>
            )}
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.3px",
              lineHeight: "1.2",
              marginBottom: "2px",
            }}
          >
            {user.name}
          </div>

          {/* Email */}
          <div
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              fontWeight: 500,
              marginBottom: "12px",
            }}
          >
            {user.email}
          </div>

          {/* Info pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "14px",
            }}
          >
            {user.province && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "9px",
                  fontWeight: 700,
                  color: accent,
                  backgroundColor: `${accent}10`,
                  padding: "4px 10px",
                  borderRadius: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <FaMapMarkerAlt style={{ fontSize: "8px" }} />
                {user.province}
              </div>
            )}
            {user.education?.collegeName && (
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#64748b",
                  backgroundColor: "#f1f5f9",
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                {user.education.collegeName}
              </div>
            )}
            {memberSince && (
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#64748b",
                  backgroundColor: "#f1f5f9",
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                Since {memberSince}
              </div>
            )}
          </div>

          {/* Contact row */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              fontSize: "10px",
              color: "#64748b",
              flexWrap: "wrap",
            }}
          >
            {user.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <FaPhone style={{ fontSize: "9px", color: accent }} />
                <span>{user.phone}</span>
              </div>
            )}
            {user.address && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <FaMapMarkerAlt style={{ fontSize: "9px", color: accent }} />
                <span>{user.address}</span>
              </div>
            )}
          </div>

          {/* Social icons row */}
          {socials.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginTop: "12px",
              }}
            >
              {user.linkedin && (
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px",
                    backgroundColor: "#0A66C2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaLinkedinIn style={{ color: "#fff", fontSize: "12px" }} />
                </div>
              )}
              {user.github && (
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px",
                    backgroundColor: "#24292e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaGithub style={{ color: "#fff", fontSize: "12px" }} />
                </div>
              )}
              {user.website && (
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px",
                    backgroundColor: accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaGlobe style={{ color: "#fff", fontSize: "12px" }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: "7px",
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            codeforchangenepal.org
          </div>
          <div
            style={{
              fontSize: "7px",
              fontWeight: 800,
              color: accent,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Empowering Change Through Code
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberCard;
