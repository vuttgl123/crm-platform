import { z } from 'zod';

export const roleBasicsSchema = z.object({
  roleCode: z
    .string()
    .trim()
    .min(1, 'Role Code is required')
    .max(191, 'Role Code must be 191 characters or fewer')
    .regex(/^[A-Z][A-Z0-9_]*$/, 'Role Code must start with an uppercase letter and contain only uppercase letters, numbers, and underscores'),
  name: z
    .string()
    .trim()
    .min(1, 'Role Name is required')
    .max(255, 'Role Name must be 255 characters or fewer'),
  description: z
    .string()
    .max(4000, 'Description must be 4000 characters or fewer')
    .optional()
    .default(''),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const roleDataScopeItemSchema = z
  .object({
    entityType: z
      .string()
      .trim()
      .min(1, 'Entity type is required')
      .max(191, 'Entity type must be 191 characters or fewer')
      .regex(/^[A-Z][A-Z0-9_]*$/, 'Entity type must be uppercase alphanumeric and underscores'),
    type: z.enum(['OWN', 'TEAM', 'TEAM_TREE', 'TENANT']),
    teamId: z.string().nullable().optional(),
  })
  .refine(
    (val) => {
      if (val.type === 'TEAM' || val.type === 'TEAM_TREE') {
        return Boolean(val.teamId && val.teamId.trim().length > 0);
      }
      return true;
    },
    {
      message: 'A valid team must be selected for TEAM and TEAM_TREE scoping',
      path: ['teamId'],
    }
  );

export const roleDraftSchema = z.object({
  roleCode: z
    .string()
    .trim()
    .min(1, 'Role Code is required')
    .max(191, 'Role Code must be 191 characters or fewer')
    .regex(/^[A-Z][A-Z0-9_]*$/, 'Role Code format is invalid'),
  name: z
    .string()
    .trim()
    .min(1, 'Role Name is required')
    .max(255, 'Role Name must be 255 characters or fewer'),
  description: z.string().max(4000).default(''),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  system: z.boolean().default(false),
  permissionCodes: z.array(z.string()),
  dataScopes: z.array(roleDataScopeItemSchema),
});

export type RoleBasicsFormValues = z.infer<typeof roleBasicsSchema>;
export type RoleDataScopeItemValues = z.infer<typeof roleDataScopeItemSchema>;
