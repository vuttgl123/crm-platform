import { z } from 'zod';

export const opportunityOwnerSchema = z
  .object({
    type: z.enum(['USER', 'TEAM']),
    id: z.string().uuid('Invalid owner identifier'),
  })
  .nullable();

export const opportunityAmountSchema = z.object({
  amount: z.coerce
    .number()
    .min(0, 'Amount must be a non-negative number')
    .max(99999999999999, 'Amount is too large'),
  currencyCode: z
    .string()
    .length(3, 'Currency code must be 3 letters (e.g. USD, VND, EUR)')
    .toUpperCase(),
});

export const opportunityFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Opportunity deal name is required')
    .max(255, 'Deal name must not exceed 255 characters'),
  accountId: z
    .string()
    .min(1, 'Account organization is required'),
  pipelineId: z
    .string()
    .min(1, 'Sales pipeline is required'),
  currentStageId: z
    .string()
    .min(1, 'Pipeline stage is required'),
  owner: opportunityOwnerSchema.optional().nullable(),
  sourceId: z.string().nullable().optional(),
  primaryContactId: z.string().nullable().optional(),
  opportunityType: z.enum([
    'NEW_BUSINESS',
    'UPSELL',
    'CROSS_SELL',
    'RENEWAL',
    'PARTNERSHIP',
    'OTHER',
  ]),
  amount: opportunityAmountSchema,
  probability: z.coerce
    .number()
    .min(0, 'Probability must be at least 0%')
    .max(100, 'Probability cannot exceed 100%'),
  expectedCloseDate: z.string().nullable().optional(),
  nextStep: z.string().max(255, 'Next step must not exceed 255 characters').nullable().optional(),
  description: z.string().nullable().optional(),
  campaignId: z.string().nullable().optional(),
});

export type OpportunityFormSchemaValues = z.infer<typeof opportunityFormSchema>;

export const opportunityTransitionSchema = z
  .object({
    action: z.enum(['MOVE_STAGE', 'CHANGE_PIPELINE', 'MARK_WON', 'MARK_LOST', 'CANCEL', 'REOPEN']),
    targetPipelineId: z.string().optional(),
    targetStageId: z.string().optional(),
    actualCloseDate: z.string().optional(),
    lostReasonId: z.string().optional(),
    lostReasonNotes: z.string().max(255).nullable().optional(),
    reason: z.string().max(255).nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.action === 'MOVE_STAGE' && !val.targetStageId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Target stage is required',
        path: ['targetStageId'],
      });
    }
    if (val.action === 'CHANGE_PIPELINE') {
      if (!val.targetPipelineId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Target pipeline is required',
          path: ['targetPipelineId'],
        });
      }
      if (!val.targetStageId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Target stage is required',
          path: ['targetStageId'],
        });
      }
    }
    if (val.action === 'MARK_WON') {
      if (!val.actualCloseDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Actual close date is required',
          path: ['actualCloseDate'],
        });
      }
    }
    if (val.action === 'MARK_LOST') {
      if (!val.lostReasonId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Lost reason is required',
          path: ['lostReasonId'],
        });
      }
      if (!val.actualCloseDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Actual close date is required',
          path: ['actualCloseDate'],
        });
      }
    }
    if (val.action === 'CANCEL' && !val.actualCloseDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cancellation date is required',
        path: ['actualCloseDate'],
      });
    }
    if (val.action === 'REOPEN' && !val.targetStageId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Target open stage is required',
        path: ['targetStageId'],
      });
    }
  });

export type OpportunityTransitionSchemaValues = z.infer<typeof opportunityTransitionSchema>;

export const opportunityStakeholderSchema = z.object({
  contactId: z.string().min(1, 'Contact is required'),
  role: z.enum([
    'DECISION_MAKER',
    'CHAMPION',
    'INFLUENCER',
    'PROCUREMENT',
    'TECHNICAL_EVALUATOR',
    'LEGAL',
    'OTHER',
  ]),
  influenceLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).nullable().optional(),
  primary: z.boolean(),
});

export type OpportunityStakeholderSchemaValues = z.infer<typeof opportunityStakeholderSchema>;

export const opportunityNoteSchema = z.object({
  title: z.string().max(255, 'Title must not exceed 255 characters').nullable().optional(),
  body: z.string().trim().min(1, 'Note content is required'),
  visibility: z.enum(['PRIVATE', 'TEAM', 'TENANT']),
});

export type OpportunityNoteSchemaValues = z.infer<typeof opportunityNoteSchema>;
