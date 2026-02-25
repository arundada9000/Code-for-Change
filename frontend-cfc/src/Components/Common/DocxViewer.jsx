import React, { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";

const DocxViewer = ({ url }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const loadDocx = async () => {
      containerRef.current.innerHTML = `
        <div class="docx-loading">Loading document…</div>
      `;

      const response = await fetch(url);
      const blob = await response.blob();

      await renderAsync(blob, containerRef.current, null, {
        className: "docx-content",
        ignoreWidth: false,
        ignoreHeight: false,
        experimental: true,
      });
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
