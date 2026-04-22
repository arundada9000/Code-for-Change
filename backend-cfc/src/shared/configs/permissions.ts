// ────────────────────────────────────────────────
// 1. Roles as const object
// ────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  EB: "eb",
  CR: "cr",
  GM: "gm",
  IPPL: "ippl",
  ADVISOR: "advisor",
  ALUMNI: "alumni",
  GUEST: "guest",
} as const;

export type RoleKey = keyof typeof ROLES;
export type RoleValue = (typeof ROLES)[RoleKey];

// ────────────────────────────────────────────────
// 2. EB Positions (sub-field for EB role)
// ────────────────────────────────────────────────
export const EB_POSITIONS = [
  "tech-lead",
  "project-lead",
  "vice-project-lead",
  "operation-lead",
  "admin-lead",
  "hr-lead",
  "pr-lead",
  "treasurer",
  "vice-treasurer",
  "executive-member",
  "secretary",
  "vice-secretary",
] as const;

export type EBPosition = (typeof EB_POSITIONS)[number];

// ────────────────────────────────────────────────
// 3. Association Permissions
// ────────────────────────────────────────────────
export const PERMISSIONS = {
  // Member Management
  MEMBER_CREATE: "member:create",
  MEMBER_UPDATE: "member:update",
  MEMBER_VIEW: "member:view",
  MEMBER_DELETE: "member:delete",
  MEMBER_VERIFY: "member:verify",

  // Event Management
  EVENT_CREATE: "event:create",
  EVENT_UPDATE: "event:update",
  EVENT_VIEW: "event:view",
  EVENT_DELETE: "event:delete",

  // Blog Management
  BLOG_CREATE: "blog:create",
  BLOG_UPDATE: "blog:update",
  BLOG_VIEW: "blog:view",
  BLOG_DELETE: "blog:delete",

  // Impact Management
  IMPACT_CREATE: "impact:create",
  IMPACT_UPDATE: "impact:update",
  IMPACT_VIEW: "impact:view",
  IMPACT_DELETE: "impact:delete",

  // Resource Management
  RESOURCE_CREATE: "resource:create",
  RESOURCE_UPDATE: "resource:update",
  RESOURCE_VIEW: "resource:view",
  RESOURCE_DELETE: "resource:delete",

  // Team Management
  TEAM_CREATE: "team:create",
  TEAM_UPDATE: "team:update",
  TEAM_VIEW: "team:view",
  TEAM_DELETE: "team:delete",

  // Contact Management
  CONTACT_VIEW: "contact:view",
  CONTACT_DELETE: "contact:delete",

  // System & Logs
  LOG_VIEW: "log:view",
  REPORT_VIEW: "report:view",
  SETTINGS_MANAGE: "settings:manage",

  // Profile
  PROFILE_UPDATE: "profile:update",

  // Internship Management
  INTERNSHIP_CREATE: "internship:create",
  INTERNSHIP_UPDATE: "internship:update",
  INTERNSHIP_VIEW: "internship:view",
  INTERNSHIP_DELETE: "internship:delete",

  // Certificate Management
  CERTIFICATE_ISSUE: "certificate:issue",
  CERTIFICATE_UPDATE: "certificate:update",
  CERTIFICATE_VIEW: "certificate:view",
  CERTIFICATE_DELETE: "certificate:delete",

  // Gallery Management
  GALLERY_CREATE: "gallery:create",
  GALLERY_UPDATE: "gallery:update",
  GALLERY_VIEW: "gallery:view",
  GALLERY_DELETE: "gallery:delete",

  // Testimonial Management
  TESTIMONIAL_CREATE: "testimonial:create",
  TESTIMONIAL_UPDATE: "testimonial:update",
  TESTIMONIAL_VIEW: "testimonial:view",
  TESTIMONIAL_DELETE: "testimonial:delete",

  // Supporter Management
  SUPPORTER_CREATE: "supporter:create",
  SUPPORTER_UPDATE: "supporter:update",
  SUPPORTER_VIEW: "supporter:view",
  SUPPORTER_DELETE: "supporter:delete",

  // Newsletter Management
  NEWSLETTER_VIEW: "newsletter:view",
  NEWSLETTER_UPDATE: "newsletter:update",
  NEWSLETTER_DELETE: "newsletter:delete",

  // Periodical Management
  PERIODICAL_CREATE: "periodical:create",
  PERIODICAL_UPDATE: "periodical:update",
  PERIODICAL_VIEW: "periodical:view",
  PERIODICAL_DELETE: "periodical:delete",

  // Walkthrough Management
  WALKTHROUGH_CREATE: "walkthrough:create",
  WALKTHROUGH_UPDATE: "walkthrough:update",
  WALKTHROUGH_VIEW: "walkthrough:view",
  WALKTHROUGH_DELETE: "walkthrough:delete",
} as const;

export type Permission = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[Permission];

// ────────────────────────────────────────────────
// 4. Role → Permissions mapping
// ────────────────────────────────────────────────
const EB_PERMISSIONS: PermissionValue[] = [
  PERMISSIONS.MEMBER_VIEW,
  PERMISSIONS.MEMBER_VERIFY,
  PERMISSIONS.EVENT_CREATE,
  PERMISSIONS.EVENT_UPDATE,
  PERMISSIONS.EVENT_VIEW,
  PERMISSIONS.BLOG_CREATE,
  PERMISSIONS.BLOG_UPDATE,
  PERMISSIONS.BLOG_VIEW,
  PERMISSIONS.LOG_VIEW,
  PERMISSIONS.PROFILE_UPDATE,
  PERMISSIONS.INTERNSHIP_CREATE,
  PERMISSIONS.INTERNSHIP_UPDATE,
  PERMISSIONS.INTERNSHIP_VIEW,
  PERMISSIONS.CERTIFICATE_ISSUE,
  PERMISSIONS.CERTIFICATE_UPDATE,
  PERMISSIONS.CERTIFICATE_VIEW,
  PERMISSIONS.PERIODICAL_VIEW,
  PERMISSIONS.WALKTHROUGH_VIEW,
];

export const ROLE_PERMISSIONS: Record<RoleValue, PermissionValue[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.EB]: EB_PERMISSIONS,
  [ROLES.CR]: [
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.IMPACT_VIEW,
    PERMISSIONS.GALLERY_VIEW,
    PERMISSIONS.INTERNSHIP_VIEW,
    PERMISSIONS.CERTIFICATE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
  ],
  [ROLES.GM]: [
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.IMPACT_VIEW,
    PERMISSIONS.GALLERY_VIEW,
    PERMISSIONS.INTERNSHIP_VIEW,
    PERMISSIONS.CERTIFICATE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
  ],
  [ROLES.IPPL]: [
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.IMPACT_VIEW,
    PERMISSIONS.GALLERY_VIEW,
    PERMISSIONS.INTERNSHIP_VIEW,
    PERMISSIONS.CERTIFICATE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
  ],
  [ROLES.ADVISOR]: [
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.IMPACT_VIEW,
    PERMISSIONS.GALLERY_VIEW,
    PERMISSIONS.INTERNSHIP_VIEW,
    PERMISSIONS.CERTIFICATE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
  ],
  [ROLES.ALUMNI]: [
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.IMPACT_VIEW,
    PERMISSIONS.GALLERY_VIEW,
    PERMISSIONS.INTERNSHIP_VIEW,
    PERMISSIONS.CERTIFICATE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.PROFILE_UPDATE,
  ],
};

export function getPermissionsForRole(role: RoleValue): PermissionValue[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

