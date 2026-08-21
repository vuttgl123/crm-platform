export type HomeRoleId = 'executive' | 'manager' | 'sales';

export type EnterpriseTrustId =
  | 'access'
  | 'scope'
  | 'audit'
  | 'integration';

export type CommercialScopeId =
  | 'scale'
  | 'process'
  | 'integration'
  | 'governance';

export const capabilityProofItems = [
  { id: 'customer-data', labelKey: 'landing.home.proof.customerData' },
  { id: 'pipeline', labelKey: 'landing.home.proof.pipeline' },
  { id: 'quotes', labelKey: 'landing.home.proof.quotes' },
  { id: 'contracts', labelKey: 'landing.home.proof.contracts' },
  { id: 'access', labelKey: 'landing.home.proof.access' },
] as const;

export const homeRoleItems = [
  {
    id: 'executive',
    labelKey: 'landing.home.roles.executiveLabel',
    titleKey: 'landing.home.roles.executiveTitle',
    pointKeys: [
      'landing.home.roles.executivePointPipeline',
      'landing.home.roles.executivePointRisk',
      'landing.home.roles.executivePointReporting',
    ],
  },
  {
    id: 'manager',
    labelKey: 'landing.home.roles.managerLabel',
    titleKey: 'landing.home.roles.managerTitle',
    pointKeys: [
      'landing.home.roles.managerPointOwnership',
      'landing.home.roles.managerPointStalled',
      'landing.home.roles.managerPointApproval',
    ],
  },
  {
    id: 'sales',
    labelKey: 'landing.home.roles.salesLabel',
    titleKey: 'landing.home.roles.salesTitle',
    pointKeys: [
      'landing.home.roles.salesPointContext',
      'landing.home.roles.salesPointQuote',
      'landing.home.roles.salesPointFollowUp',
    ],
  },
] as const satisfies ReadonlyArray<{
  id: HomeRoleId;
  labelKey: string;
  titleKey: string;
  pointKeys: readonly [string, string, string];
}>;

export const enterpriseTrustItems = [
  {
    id: 'access',
    titleKey: 'landing.home.trust.accessTitle',
    descriptionKey: 'landing.home.trust.accessDescription',
  },
  {
    id: 'scope',
    titleKey: 'landing.home.trust.scopeTitle',
    descriptionKey: 'landing.home.trust.scopeDescription',
  },
  {
    id: 'audit',
    titleKey: 'landing.home.trust.auditTitle',
    descriptionKey: 'landing.home.trust.auditDescription',
  },
  {
    id: 'integration',
    titleKey: 'landing.home.trust.integrationTitle',
    descriptionKey: 'landing.home.trust.integrationDescription',
  },
] as const satisfies ReadonlyArray<{
  id: EnterpriseTrustId;
  titleKey: string;
  descriptionKey: string;
}>;

export const commercialScopeItems = [
  {
    id: 'scale',
    titleKey: 'landing.home.commercial.scaleTitle',
    descriptionKey: 'landing.home.commercial.scaleDescription',
  },
  {
    id: 'process',
    titleKey: 'landing.home.commercial.processTitle',
    descriptionKey: 'landing.home.commercial.processDescription',
  },
  {
    id: 'integration',
    titleKey: 'landing.home.commercial.integrationTitle',
    descriptionKey: 'landing.home.commercial.integrationDescription',
  },
  {
    id: 'governance',
    titleKey: 'landing.home.commercial.governanceTitle',
    descriptionKey: 'landing.home.commercial.governanceDescription',
  },
] as const satisfies ReadonlyArray<{
  id: CommercialScopeId;
  titleKey: string;
  descriptionKey: string;
}>;
