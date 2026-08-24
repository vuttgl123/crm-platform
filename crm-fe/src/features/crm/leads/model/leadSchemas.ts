import { z } from 'zod';
import { LeadRating, LeadOwnerType } from '@/services/api/leadApi';

const RATINGS: [LeadRating, ...LeadRating[]] = ['HOT', 'WARM', 'COLD'];
const OWNER_TYPES: [LeadOwnerType, ...LeadOwnerType[]] = ['USER', 'TEAM'];

export const leadOwnerSchema = z.object({
  type: z.enum(OWNER_TYPES),
  id: z.string().uuid({ message: 'Invalid owner ID' }),
});

export const leadFormSchema = z.object({
  leadNumber: z
    .string()
    .trim()
    .min(1, { message: 'Lead number is required' })
    .max(191, { message: 'Lead number cannot exceed 191 characters' }),
  statusId: z
    .string()
    .uuid({ message: 'Please select a valid status' })
    .min(1, { message: 'Status is required' }),
  sourceId: z
    .string()
    .uuid({ message: 'Invalid source ID' })
    .nullable()
    .optional()
    .or(z.literal('')),
  owner: leadOwnerSchema.nullable().optional(),
  rating: z.enum(RATINGS).nullable().optional(),
  accountName: z.string().trim().max(255).nullable().optional(),
  companyName: z.string().trim().max(255).nullable().optional(),
  honorific: z.string().trim().max(255).nullable().optional(),
  givenName: z.string().trim().max(255).nullable().optional(),
  familyName: z.string().trim().max(255).nullable().optional(),
  displayName: z
    .string()
    .trim()
    .min(1, { message: 'Display name is required' })
    .max(255, { message: 'Display name cannot exceed 255 characters' }),
  email: z
    .string()
    .trim()
    .max(320, { message: 'Email cannot exceed 320 characters' })
    .email({ message: 'Invalid email address' })
    .nullable()
    .optional()
    .or(z.literal('')),
  phoneE164: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{1,14}$/, {
      message: 'Phone must be in E.164 format (e.g. +12025550123)',
    })
    .nullable()
    .optional()
    .or(z.literal('')),
  jobTitle: z.string().trim().max(255).nullable().optional(),
  website: z.string().trim().max(255).nullable().optional(),
  countryCode: z
    .string()
    .trim()
    .max(2, { message: 'Country code must be 2 letters' })
    .regex(/^[A-Z]{2}$/, { message: 'Country code must be 2 uppercase letters (e.g. US, VN)' })
    .nullable()
    .optional()
    .or(z.literal('')),
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
  estimatedValueAmount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0, { message: 'Estimated value cannot be negative' })
    .nullable()
    .optional(),
  estimatedValueCurrency: z
    .string()
    .trim()
    .max(3, { message: 'Currency code must be 3 letters' })
    .optional(),
  qualificationNotes: z.string().trim().nullable().optional(),
  disqualificationReason: z.string().trim().nullable().optional(),
  version: z.number().int().positive().optional(),
});

export type LeadFormSchemaValues = z.infer<typeof leadFormSchema>;

export const leadConversionSchema = z.object({
  version: z.number().int().positive(),
  convertedStatusId: z
    .string()
    .uuid({ message: 'Please select an active converted status' })
    .min(1, { message: 'Converted status is required' }),
  convertedAccountId: z.string().uuid({ message: 'Invalid Account ID' }).nullable().optional(),
  convertedContactId: z.string().uuid({ message: 'Invalid Contact ID' }).nullable().optional(),
  convertedOpportunityId: z.string().uuid({ message: 'Invalid Opportunity ID' }).nullable().optional(),
});

export type LeadConversionSchemaValues = z.infer<typeof leadConversionSchema>;
