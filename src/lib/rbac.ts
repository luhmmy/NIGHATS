/**
 * RBAC single source of truth.
 *
 * Permissions are granular "resource:action" strings. Roles bundle them.
 * The seed script writes these into the DB; runtime checks read the user's
 * effective permission set (resolved from their role) out of the session.
 */

// --- Permissions -----------------------------------------------------------

export const PERMISSIONS = {
  // User & access administration
  USER_READ: "user:read",
  USER_MANAGE: "user:manage", // create/disable users, assign roles
  ROLE_MANAGE: "role:manage", // edit roles & their permissions

  // Audit
  AUDIT_READ: "audit:read",

  // CFP / speakers
  CFP_READ: "cfp:read",
  CFP_REVIEW: "cfp:review", // submit a (blind) score/review
  CFP_DECIDE: "cfp:decide", // accept/reject/shortlist
  CFP_PII_READ: "cfp:pii_read", // see author identity

  // Competitions & teams
  COMPETITION_MANAGE: "competition:manage",
  TEAM_MANAGE: "team:manage",

  // Villages
  VILLAGE_READ: "village:read",
  VILLAGE_MANAGE: "village:manage", // approve/reject village proposals

  // Sponsors
  SPONSOR_MANAGE: "sponsor:manage",

  // Registrations & Event Day Check-in
  REGISTRATION_READ: "registration:read",
  REGISTRATION_MANAGE: "registration:manage",
  REGISTRATION_CHECKIN: "registration:checkin", // Day-of-event check-in desk

  // Volunteers & Public Inquiries
  VOLUNTEER_MANAGE: "volunteer:manage",
  INQUIRY_READ: "inquiry:read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// --- Roles -----------------------------------------------------------------

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ORGANIZER: "ORGANIZER",
  REGISTRATION_LEAD: "REGISTRATION_LEAD",
  CHECKIN_STAFF: "CHECKIN_STAFF",
  VOLUNTEER_LEAD: "VOLUNTEER_LEAD",
  CFP_LEAD: "CFP_LEAD",
  REVIEWER: "REVIEWER",
  SPONSOR_MANAGER: "SPONSOR_MANAGER",
  VILLAGE_LEAD: "VILLAGE_LEAD",
  COMPETITION_LEAD: "COMPETITION_LEAD",
  ATTENDEE: "ATTENDEE",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

const P = PERMISSIONS;

/** Human labels + descriptions for roles. */
export const ROLE_DEFS: Record<
  RoleName,
  { label: string; description: string; permissions: Permission[] }
> = {
  [ROLES.SUPER_ADMIN]: {
    label: "Super Admin",
    description: "Full platform control, user/role management, and system audit logs.",
    permissions: Object.values(P),
  },
  [ROLES.ORGANIZER]: {
    label: "Organizer",
    description: "Cross-functional event operations: content, registrations, logistics, and partnerships.",
    permissions: [
      P.USER_READ,
      P.AUDIT_READ,
      P.CFP_READ,
      P.CFP_DECIDE,
      P.CFP_PII_READ,
      P.COMPETITION_MANAGE,
      P.TEAM_MANAGE,
      P.VILLAGE_READ,
      P.VILLAGE_MANAGE,
      P.SPONSOR_MANAGE,
      P.REGISTRATION_READ,
      P.REGISTRATION_MANAGE,
      P.REGISTRATION_CHECKIN,
      P.VOLUNTEER_MANAGE,
      P.INQUIRY_READ,
    ],
  },
  [ROLES.REGISTRATION_LEAD]: {
    label: "Registration Lead",
    description: "Manages attendee registrations, ticket confirmation, and event day check-in.",
    permissions: [P.REGISTRATION_READ, P.REGISTRATION_MANAGE, P.REGISTRATION_CHECKIN],
  },
  [ROLES.CHECKIN_STAFF]: {
    label: "Check-in Staff",
    description: "Day-of-event welcome desk: searches attendees and handles live check-in.",
    permissions: [P.REGISTRATION_READ, P.REGISTRATION_CHECKIN],
  },
  [ROLES.VOLUNTEER_LEAD]: {
    label: "Volunteer Lead",
    description: "Manages volunteer inquiries, crew applications, and general public communications.",
    permissions: [P.VOLUNTEER_MANAGE, P.INQUIRY_READ],
  },
  [ROLES.CFP_LEAD]: {
    label: "CFP Lead / Program Chair",
    description: "Manages speaker proposal reviews, author identities, and program decisions.",
    permissions: [P.CFP_READ, P.CFP_REVIEW, P.CFP_DECIDE, P.CFP_PII_READ],
  },
  [ROLES.REVIEWER]: {
    label: "Program Reviewer",
    description: "Double-blind CFP reviewer. Evaluates talk proposals without seeing speaker identities.",
    permissions: [P.CFP_READ, P.CFP_REVIEW],
  },
  [ROLES.SPONSOR_MANAGER]: {
    label: "Sponsor Manager",
    description: "Manages corporate sponsor pipelines and partnership enquiries only.",
    permissions: [P.SPONSOR_MANAGE],
  },
  [ROLES.VILLAGE_LEAD]: {
    label: "Village Lead",
    description: "Proposes and administers specialized hacking villages and micro-labs.",
    permissions: [P.VILLAGE_READ, P.VILLAGE_MANAGE],
  },
  [ROLES.COMPETITION_LEAD]: {
    label: "Competition Lead",
    description: "Administers CTF challenges, scoreboards, and competition squads.",
    permissions: [P.COMPETITION_MANAGE, P.TEAM_MANAGE],
  },
  [ROLES.ATTENDEE]: {
    label: "Attendee",
    description: "Registered participant: manages personal registration and team participation.",
    permissions: [P.TEAM_MANAGE],
  },
};

// --- Checks ----------------------------------------------------------------

/** True if the permission set grants `required`. */
export function can(
  granted: readonly string[] | undefined | null,
  required: Permission
): boolean {
  return !!granted && granted.includes(required);
}

/** True if the set grants ALL required permissions. */
export function canAll(
  granted: readonly string[] | undefined | null,
  required: readonly Permission[]
): boolean {
  return !!granted && required.every((p) => granted.includes(p));
}

/** True if the set grants ANY of the required permissions. */
export function canAny(
  granted: readonly string[] | undefined | null,
  required: readonly Permission[]
): boolean {
  return !!granted && required.some((p) => granted.includes(p));
}

import { getAdminPath } from "./admin-route";

/**
 * Which top-level admin sections each permission unlocks.
 * Used to render role-aware navigation.
 */
export const ADMIN_NAV: {
  href: string;
  label: string;
  requires: Permission;
}[] = [
  { href: getAdminPath(""), label: "Overview", requires: P.USER_READ }, // Fallback gate handled in layout
  { href: getAdminPath("/registrations"), label: "Registrations", requires: P.REGISTRATION_READ },
  { href: getAdminPath("/checkin"), label: "Day-of Check-In", requires: P.REGISTRATION_CHECKIN },
  { href: getAdminPath("/inquiries"), label: "Volunteers & Inquiries", requires: P.INQUIRY_READ },
  { href: getAdminPath("/cfp"), label: "CFP & Speakers", requires: P.CFP_READ },
  { href: getAdminPath("/competitions"), label: "Competitions & Teams", requires: P.COMPETITION_MANAGE },
  { href: getAdminPath("/villages"), label: "Village Proposals", requires: P.VILLAGE_READ },
  { href: getAdminPath("/sponsors"), label: "Sponsor Pipeline", requires: P.SPONSOR_MANAGE },
  { href: getAdminPath("/users"), label: "Users & Staff", requires: P.USER_MANAGE },
  { href: getAdminPath("/audit"), label: "Audit Logs", requires: P.AUDIT_READ },
];
