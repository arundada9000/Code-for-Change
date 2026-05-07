import MinimalistPro from "./MinimalistPro";
import CreativeBold from "./CreativeBold";
import ClassicFormal from "./ClassicFormal";

/**
 * Template registry — maps template IDs to React components.
 * To add a new template, simply:
 *   1. Create the component in this directory
 *   2. Add an entry here
 *   3. Add metadata to TEMPLATE_LIST in resumeData.js
 */
const TEMPLATES = {
  "minimalist-pro": MinimalistPro,
  "creative-bold": CreativeBold,
  "classic-formal": ClassicFormal,
};

/**
 * Returns the template component for a given template ID.
 * Falls back to MinimalistPro if ID not found.
 */
export function getTemplateComponent(templateId) {
  return TEMPLATES[templateId] || MinimalistPro;
}

export default TEMPLATES;
