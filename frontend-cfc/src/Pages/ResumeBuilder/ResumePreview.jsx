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
    <div className="h-full overflow-auto bg-slate-100 p-4 flex justify-center">
      <div
        ref={ref}
        className="bg-white shadow-2xl flex-shrink-0"
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
