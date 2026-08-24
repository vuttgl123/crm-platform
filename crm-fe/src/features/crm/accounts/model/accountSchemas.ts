import { z } from 'zod';
import {
  AccountType,
  AccountLifecycleStage,
  OwnerType,
  AccountAddressType,
  ChannelType,
  RelationshipType,
  NoteVisibility,
} from './accountTypes';

const ACCOUNT_TYPES: [AccountType, ...AccountType[]] = [
  'ORGANIZATION',
  'PERSON',
  'PARTNER',
  'RESELLER',
  'SUPPLIER',
];

const LIFECYCLE_STAGES: [AccountLifecycleStage, ...AccountLifecycleStage[]] = [
  'PROSPECT',
  'QUALIFIED',
  'CUSTOMER',
  'CHURNED',
  'INACTIVE',
];

const OWNER_TYPES: [OwnerType, ...OwnerType[]] = ['USER', 'TEAM'];

const ADDRESS_TYPES: [AccountAddressType, ...AccountAddressType[]] = [
  'BILLING',
  'SHIPPING',
  'OFFICE',
  'REGISTERED',
  'OTHER',
];

const CHANNEL_TYPES: [ChannelType, ...ChannelType[]] = [
  'EMAIL',
  'PHONE',
  'MOBILE',
  'SMS',
  'WHATSAPP',
  'LINKEDIN',
  'OTHER',
];

const RELATIONSHIP_TYPES: [RelationshipType, ...RelationshipType[]] = [
  'PARENT_CHILD',
  'PARTNER',
  'AFFILIATE',
  'SUPPLIER',
  'CUSTOMER',
  'OTHER',
];

const NOTE_VISIBILITIES: [NoteVisibility, ...NoteVisibility[]] = [
  'PRIVATE',
  'TEAM',
  'TENANT',
];

export const accountOwnerSchema = z.object({
  type: z.enum(OWNER_TYPES),
  id: z.string().uuid({ message: 'Invalid owner ID' }),
});

export const accountFormSchema = z.object({
  accountNumber: z
    .string()
    .trim()
    .min(1, { message: 'Account number is required' })
    .max(191, { message: 'Account number cannot exceed 191 characters' }),
  accountType: z.enum(ACCOUNT_TYPES, {
    required_error: 'Please select an account type',
  }),
  displayName: z
    .string()
    .trim()
    .min(1, { message: 'Display name is required' })
    .max(255, { message: 'Display name cannot exceed 255 characters' }),
  legalName: z.string().trim().max(255).nullable().optional(),
  parentAccountId: z
    .string()
    .uuid({ message: 'Invalid parent account ID' })
    .nullable()
    .optional()
    .or(z.literal('')),
  owner: accountOwnerSchema.nullable().optional(),
  lifecycleStage: z.enum(LIFECYCLE_STAGES, {
    required_error: 'Please select a lifecycle stage',
  }),
  industryCode: z.string().trim().max(191).nullable().optional(),
  taxIdentifier: z.string().trim().max(255).nullable().optional(),
  registrationNumber: z.string().trim().max(191).nullable().optional(),
  website: z.string().trim().max(255).nullable().optional(),
  annualRevenueAmount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0, { message: 'Annual revenue cannot be negative' })
    .nullable()
    .optional(),
  annualRevenueCurrency: z
    .string()
    .trim()
    .max(3, { message: 'Currency code must be 3 letters' })
    .optional(),
  employeeCount: z
    .number({ invalid_type_error: 'Employee count must be a number' })
    .int({ message: 'Employee count must be an integer' })
    .min(0, { message: 'Employee count cannot be negative' })
    .nullable()
    .optional(),
  description: z.string().trim().nullable().optional(),
  preferredLanguageCode: z
    .string()
    .trim()
    .max(10, { message: 'Language tag cannot exceed 10 characters' })
    .regex(/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/, {
      message: 'Invalid IETF language tag (e.g. en, vi, en-US)',
    })
    .nullable()
    .optional()
    .or(z.literal('')),
  doNotContact: z.boolean().default(false),
  version: z.number().int().positive().optional(),
});

export type AccountFormSchemaValues = z.infer<typeof accountFormSchema>;

export const accountAddressSchema = z.object({
  addressType: z.enum(ADDRESS_TYPES, {
    required_error: 'Please select an address type',
  }),
  addressLine1: z.string().trim().max(255).nullable().optional(),
  addressLine2: z.string().trim().max(255).nullable().optional(),
  locality: z.string().trim().max(255).nullable().optional(),
  administrativeArea: z.string().trim().max(255).nullable().optional(),
  postalCode: z.string().trim().max(20).nullable().optional(),
  countryCode: z
    .string()
    .trim()
    .min(2, { message: 'Country code must be 2 uppercase letters' })
    .max(2, { message: 'Country code must be 2 uppercase letters' })
    .regex(/^[A-Z]{2}$/, {
      message: 'Country code must be 2 uppercase letters (e.g. US, VN, SG)',
    }),
  isPrimary: z.boolean().default(false),
  validFrom: z.string().nullable().optional(),
});

export type AccountAddressSchemaValues = z.infer<typeof accountAddressSchema>;

export const accountChannelSchema = z.object({
  channelType: z.enum(CHANNEL_TYPES, {
    required_error: 'Please select a channel type',
  }),
  rawValue: z
    .string()
    .trim()
    .min(1, { message: 'Channel value is required' })
    .max(255, { message: 'Value cannot exceed 255 characters' }),
  label: z.string().trim().max(100).nullable().optional(),
  isPrimary: z.boolean().default(false),
  doNotUse: z.boolean().default(false),
});

export type AccountChannelSchemaValues = z.infer<typeof accountChannelSchema>;

export const accountRelationshipSchema = z.object({
  relatedAccountId: z
    .string()
    .uuid({ message: 'Please select a valid related account' })
    .min(1, { message: 'Related account is required' }),
  relationshipType: z.enum(RELATIONSHIP_TYPES, {
    required_error: 'Please select a relationship type',
  }),
  validFrom: z.string().nullable().optional(),
  validTo: z.string().nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
});

export type AccountRelationshipSchemaValues = z.infer<typeof accountRelationshipSchema>;

export const endRelationshipSchema = z.object({
  validTo: z
    .string()
    .min(1, { message: 'End date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date format must be YYYY-MM-DD' }),
});

export type EndRelationshipSchemaValues = z.infer<typeof endRelationshipSchema>;

export const accountNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: 'Note content is required' }),
  visibility: z.enum(NOTE_VISIBILITIES).default('TEAM'),
});

export type AccountNoteSchemaValues = z.infer<typeof accountNoteSchema>;
