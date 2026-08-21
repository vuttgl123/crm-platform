/**
 * Known permission codes seeded in the database.
 * This list can be expanded as backend catalogue expands.
 */

export const KNOWN_PERMISSION_CODES = [
  'crm_account.read',
  'crm_account.write',
  'crm_contact.read',
  'crm_contact.write',
  'crm_lead.read',
  'crm_lead.write',
  'crm_opportunity.read',
  'crm_opportunity.write',
  'sales_quote.read',
  'sales_quote.write',
  'sales_quote.approve',
  'sales_order.read',
  'sales_order.write',
  'service_ticket.read',
  'service_ticket.write',
  'privacy_consent.read',
  'privacy_consent.write',
  'audit_read',
  'platform_user.manage',
  'platform_role.read',
  'platform_role.manage',
] as const;

export type KnownPermissionCode = (typeof KNOWN_PERMISSION_CODES)[number];

export const CRM_READ_PERMISSIONS = [
  'crm_account.read',
  'crm_contact.read',
  'crm_lead.read',
  'crm_opportunity.read',
] as const;
