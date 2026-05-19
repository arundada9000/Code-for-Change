import React, { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";

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
      } catch (err) {
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="docx-error p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg text-center font-medium text-sm">
              Failed to load document: ${err.message}
            </div>
          `;
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
