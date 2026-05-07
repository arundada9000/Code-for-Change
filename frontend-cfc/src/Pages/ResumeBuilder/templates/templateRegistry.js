import MinimalistPro from "./MinimalistPro";

/**
 * Template registry — maps template IDs to React components.
 * To add a new template, simply:
 *   1. Create the component in this directory
 *   2. Add an entry here
 *   3. Add metadata to TEMPLATE_LIST in resumeData.js
 */
const TEMPLATES = {
  "minimalist-pro": MinimalistPro,
  // Future:
  // 'creative-bold': CreativeBold,
  // 'classic-formal': ClassicFormal,
  // 'tech-modern': TechModern,
  // 'elegant-serif': ElegantSerif,
};

/**
 * Returns the template component for a given template ID.
 * Falls back to MinimalistPro if ID not found.
 */
export function getTemplateComponent(templateId) {
  return TEMPLATES[templateId] || MinimalistPro;
}

export default TEMPLATES;
