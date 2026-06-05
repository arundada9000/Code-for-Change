import React, { forwardRef } from "react";
import { getTemplateComponent } from "./templates/templateRegistry";

/**
 * ResumePreview — renders the selected template at A4 scale inside a
 * scrollable container with page shadow. The inner div ref is forwarded
 * for PDF export capture.
 *
 * Props:
 *   - resumeData: full resume object
 *   - templateId: string
 *   - accentColor: hex string
 */
const ResumePreview = forwardRef(({ resumeData, templateId, accentColor }, ref) => {
  const TemplateComponent = getTemplateComponent(templateId);

  return (
    <div className="flex justify-center items-start w-full">
      <div
        ref={ref}
        className="bg-white rounded-md shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex-shrink-0"
        style={{
          width: "210mm",
          minHeight: "297mm",
          transformOrigin: "top center",
        }}
      >
        <TemplateComponent data={resumeData} accentColor={accentColor} />
      </div>
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;
