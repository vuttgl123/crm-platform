import { z } from 'zod';

export const activityFormSchema = z
  .object({
    activityType: z.enum([
      'CALL',
      'EMAIL',
      'MEETING',
      'TASK',
      'MESSAGE',
      'DEMO',
      'FOLLOW_UP',
      'OTHER',
    ]),
    subject: z
      .string()
      .trim()
      .min(1, 'Subject is required.')
      .max(255, 'Subject cannot exceed 255 characters.'),
    description: z.string().optional().nullable(),
    direction: z.enum(['INBOUND', 'OUTBOUND', 'INTERNAL']).optional().nullable(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
    ownerKind: z.enum(['USER', 'TEAM']),
    ownerId: z.string().min(1, 'Please select an owner.'),
    scheduledStartDate: z.string().optional().nullable(),
    scheduledStartTime: z.string().optional().nullable(),
    scheduledEndDate: z.string().optional().nullable(),
    scheduledEndTime: z.string().optional().nullable(),
    links: z
      .array(
        z.object({
          id: z.string().optional(),
          targetType: z.enum(['ACCOUNT', 'CONTACT', 'LEAD', 'OPPORTUNITY']),
          targetId: z.string().min(1, 'Target ID is required.'),
          displayName: z.string().optional(),
          displayCode: z.string().optional().nullable(),
        })
      )
      .default([]),
    participants: z
      .array(
        z.object({
          id: z.string().optional(),
          participantType: z.enum(['USER', 'CONTACT', 'EXTERNAL_EMAIL']),
          principalId: z.string().optional().nullable(),
          displayName: z.string().min(1, 'Display name is required.'),
          email: z.string().email('Invalid email address.').optional().nullable().or(z.literal('')),
          role: z.enum([
            'ORGANIZER',
            'ATTENDEE',
            'REQUIRED',
            'OPTIONAL',
            'CC',
            'BCC',
          ]),
        })
      )
      .default([]),
  })
  .superRefine((data, ctx) => {
    // Direction required for CALL, EMAIL, MESSAGE
    if (['CALL', 'EMAIL', 'MESSAGE'].includes(data.activityType) && !data.direction) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Direction is required for Call, Email, and Message activities.',
        path: ['direction'],
      });
    }

    // Schedule validation: Start date required for CALL, MEETING, DEMO
    if (['CALL', 'MEETING', 'DEMO'].includes(data.activityType) && !data.scheduledStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date is required for this activity type.',
        path: ['scheduledStartDate'],
      });
    }

    // End date required for MEETING, DEMO
    if (['MEETING', 'DEMO'].includes(data.activityType) && !data.scheduledEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date is required for Meetings and Demos.',
        path: ['scheduledEndDate'],
      });
    }

    // Organizer check for MEETING and DEMO
    if (['MEETING', 'DEMO'].includes(data.activityType)) {
      const organizers = data.participants.filter((p) => p.role === 'ORGANIZER');
      if (organizers.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one Organizer is required for Meetings and Demos.',
          path: ['participants'],
        });
      }
    }
  });

export type ActivityFormSchemaValues = z.infer<typeof activityFormSchema>;

export const activityTransitionSchema = z.object({
  action: z.enum(['START', 'COMPLETE', 'DEFER', 'RESUME', 'CANCEL', 'REOPEN']),
  outcomeCode: z.string().optional().nullable(),
  outcomeNotes: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});

export type ActivityTransitionSchemaValues = z.infer<typeof activityTransitionSchema>;

export const activityRescheduleSchema = z.object({
  scheduledStartDate: z.string().optional().nullable(),
  scheduledStartTime: z.string().optional().nullable(),
  scheduledEndDate: z.string().optional().nullable(),
  scheduledEndTime: z.string().optional().nullable(),
});

export type ActivityRescheduleSchemaValues = z.infer<typeof activityRescheduleSchema>;

export const activityLinkSchema = z.object({
  targetType: z.enum(['ACCOUNT', 'CONTACT', 'LEAD', 'OPPORTUNITY']),
  targetId: z.string().min(1, 'Please select a record.'),
});

export type ActivityLinkSchemaValues = z.infer<typeof activityLinkSchema>;

export const activityParticipantSchema = z.object({
  participantType: z.enum(['USER', 'CONTACT', 'EXTERNAL_EMAIL']),
  principalId: z.string().optional().nullable(),
  displayName: z.string().trim().min(1, 'Display name is required.'),
  email: z.string().email('Invalid email.').optional().nullable().or(z.literal('')),
  role: z.enum(['ORGANIZER', 'ATTENDEE', 'REQUIRED', 'OPTIONAL', 'CC', 'BCC']),
});

export type ActivityParticipantSchemaValues = z.infer<typeof activityParticipantSchema>;

export const activityNoteSchema = z.object({
  content: z.string().trim().min(1, 'Note content cannot be empty.').max(5000, 'Note is too long.'),
  visibility: z.enum(['PRIVATE', 'TEAM', 'TENANT']),
});

export type ActivityNoteSchemaValues = z.infer<typeof activityNoteSchema>;
