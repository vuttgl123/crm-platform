/**
 * Exact 19 permission codes seeded in docs/crm_mysql80.sql (lines 2208-2228).
 * Do NOT invent replacement permission strings.
 */

export const SEEDED_PERMISSIONS = [
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
] as const;

export type SeededPermissionCode = (typeof SEEDED_PERMISSIONS)[number];

export const CRM_READ_PERMISSIONS = [
  'crm_account.read',
  'crm_contact.read',
  'crm_lead.read',
  'crm_opportunity.read',
] as const;
