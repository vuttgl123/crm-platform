import { DEMO_PASSWORD, DEMO_ROLES } from '@/mocks/fixtures/demoData';
import type { DemoRoleCode, LoginCredentials } from '@/types/auth';

export const authBrandCapabilityKeys = [
  'auth.gateway.brand.capabilities.customer360',
  'auth.gateway.brand.capabilities.pipeline',
  'auth.gateway.brand.capabilities.permissions',
] as const;

export interface DemoAccountOption {
  roleCode: DemoRoleCode;
  labelKey: string;
  credentials: Required<LoginCredentials>;
}

const demoRoleKeys: Array<{
  roleCode: DemoRoleCode;
  labelKey: string;
}> = [
  { roleCode: 'ADMIN', labelKey: 'auth.gateway.demo.roles.admin' },
  { roleCode: 'REGIONAL_MANAGER', labelKey: 'auth.gateway.demo.roles.regionalManager' },
  { roleCode: 'TEAM_LEADER', labelKey: 'auth.gateway.demo.roles.teamLead' },
  { roleCode: 'SALES_STAFF', labelKey: 'auth.gateway.demo.roles.staff' },
  { roleCode: 'VIEWER', labelKey: 'auth.gateway.demo.roles.viewer' },
];

export const demoAccountOptions: DemoAccountOption[] = demoRoleKeys.map(
  ({ roleCode, labelKey }) => ({
    roleCode,
    labelKey,
    credentials: {
      email: DEMO_ROLES[roleCode].userEmail,
      password: DEMO_PASSWORD,
    },
  })
);
