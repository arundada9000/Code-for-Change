import React, { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";
import DOMPurify from "dompurify";

const DocxViewer = ({ url }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const loadDocx = async () => {
      try {
        containerRef.current.innerHTML = `
          <div class="docx-loading">Loading document…</div>
        `;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch document");
        
        const blob = await response.blob();

        await renderAsync(blob, containerRef.current, null, {
          className: "docx-content",
          ignoreWidth: false,
          ignoreHeight: false,
          experimental: true,
        });

        // Sanitize the rendered DOM output to prevent XSS from malicious docx
        if (containerRef.current) {
          DOMPurify.sanitize(containerRef.current, { IN_PLACE: true });
        }
      } catch (err) {
        if (containerRef.current) {
          const div = document.createElement("div");
          div.className = "docx-error p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg text-center font-medium text-sm";
          div.textContent = `Failed to load document: ${err.message}`;
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(div);
        }
      }
    };

    loadDocx();
  }, [url]);

  return (
    <div className="docx-viewer">
      <div ref={containerRef} className="docx-container" />
    </div>
  );
};

export default DocxViewer;
