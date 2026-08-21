export type CompanySize =
  | 'UNDER_50'
  | 'FROM_50_TO_199'
  | 'FROM_200_TO_999'
  | 'FROM_1000';

export type DemoIndustry =
  | 'FINANCE'
  | 'REAL_ESTATE'
  | 'RETAIL_FNB'
  | 'MANUFACTURING_DISTRIBUTION'
  | 'TECHNOLOGY_B2B'
  | 'OTHER';

export type DemoPrimaryNeed =
  | 'CUSTOMER_360'
  | 'SALES_PIPELINE'
  | 'QUOTES_CONTRACTS'
  | 'AUTOMATION_FORECAST'
  | 'SECURITY_INTEGRATION'
  | 'OTHER';

export interface DemoRequestInput {
  fullName: string;
  workEmail: string;
  phone: string;
  companyName: string;
  companySize: CompanySize;
  industry: DemoIndustry;
  primaryNeed: DemoPrimaryNeed;
  message?: string;
  privacyConsent: true;
  locale: 'vi' | 'en';
  sourcePath: string;
}

export interface DemoRequestResult {
  requestId?: string;
  receivedAt?: string;
}

export interface DemoRequestServiceError extends Error {
  status?: number;
  code: 'CONFIGURATION_ERROR' | 'NETWORK_ERROR' | 'REQUEST_REJECTED';
}

export interface LandingMetadata {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
}

export type CockpitTabId = 'pipeline' | 'customer360' | 'governance';
export type RoleOutcomeId = 'executive' | 'manager' | 'sales';
