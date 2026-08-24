import { z } from 'zod';
import {
  ContactLifecycleStage,
  PreferredContactChannel,
  ContactOwnerType,
} from '@/services/api/contactApi';

const LIFECYCLE_STAGES: [ContactLifecycleStage, ...ContactLifecycleStage[]] = [
  'PROSPECT',
  'QUALIFIED',
  'CUSTOMER',
  'CHURNED',
  'INACTIVE',
];

const PREFERRED_CHANNELS: [PreferredContactChannel, ...PreferredContactChannel[]] = [
  'EMAIL',
  'PHONE',
  'MOBILE',
  'SMS',
  'WHATSAPP',
  'OTHER',
];

const OWNER_TYPES: [ContactOwnerType, ...ContactOwnerType[]] = ['USER', 'TEAM'];

export const contactOwnerSchema = z.object({
  type: z.enum(OWNER_TYPES),
  id: z.string().uuid({ message: 'Invalid owner ID' }),
});

export const contactFormSchema = z.object({
  contactNumber: z
    .string()
    .trim()
    .min(1, { message: 'Contact number is required' })
    .max(191, { message: 'Contact number cannot exceed 191 characters' }),
  accountId: z
    .string()
    .uuid({ message: 'Invalid account ID' })
    .nullable()
    .optional(),
  owner: contactOwnerSchema.nullable().optional(),
  honorific: z.string().trim().max(255).nullable().optional(),
  givenName: z.string().trim().max(255).nullable().optional(),
  middleName: z.string().trim().max(255).nullable().optional(),
  familyName: z.string().trim().max(255).nullable().optional(),
  displayName: z
    .string()
    .trim()
    .min(1, { message: 'Display name is required' })
    .max(255, { message: 'Display name cannot exceed 255 characters' }),
  jobTitle: z.string().trim().max(255).nullable().optional(),
  department: z.string().trim().max(255).nullable().optional(),
  preferredLanguageCode: z
    .string()
    .trim()
    .max(10, { message: 'Language code cannot exceed 10 characters' })
    .regex(/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/, {
      message: 'Invalid IETF language tag (e.g. en, en-US, vi)',
    })
    .nullable()
    .optional()
    .or(z.literal('')),
  preferredContactChannel: z.enum(PREFERRED_CHANNELS).nullable().optional(),
  lifecycleStage: z.enum(LIFECYCLE_STAGES, {
    required_error: 'Lifecycle stage is required',
  }),
  dateOfBirth: z.string().nullable().optional(),
  doNotContact: z.boolean(),
  description: z.string().trim().nullable().optional(),
  version: z.number().int().positive().optional(),
});

export type ContactFormSchemaValues = z.infer<typeof contactFormSchema>;
