import {
  LeadRating,
  LeadOwnerType,
  LeadOwner,
  LeadEstimatedValue,
  LeadSummaryResponse,
  LeadResponse,
  LeadScoringResult,
} from '@/services/api/leadApi';
import { LeadStatusItem, LeadSourceItem } from '@/services/api/salesConfigApi';

export type {
  LeadRating,
  LeadOwnerType,
  LeadOwner,
  LeadEstimatedValue,
  LeadSummaryResponse,
  LeadResponse,
  LeadScoringResult,
  LeadStatusItem,
  LeadSourceItem,
};

export type LeadEditorMode = 'view' | 'create' | 'edit';
export type LeadOwnershipFilter = 'ALL' | 'MINE' | 'TEAM';
export type LeadConversionFilter = 'ALL' | 'ACTIVE' | 'CONVERTED';

export interface LeadFilterState {
  q: string;
  statusId: string;
  sourceId: string;
  rating: LeadRating | 'ALL';
  ownership: LeadOwnershipFilter;
  conversion: LeadConversionFilter;
  page: number;
  size: number;
}

export interface LeadFormValues {
  leadNumber: string;
  statusId: string;
  sourceId?: string | null;
  owner?: LeadOwner | null;
  rating?: LeadRating | null;
  accountName?: string | null;
  companyName?: string | null;
  honorific?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  displayName: string;
  email?: string | null;
  phoneE164?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  countryCode?: string | null;
  preferredLanguageCode?: string | null;
  estimatedValueAmount?: number | null;
  estimatedValueCurrency?: string;
  qualificationNotes?: string | null;
  disqualificationReason?: string | null;
  version?: number;
}

export interface LeadConversionFormValues {
  version: number;
  convertedStatusId: string;
  convertedAccountId?: string | null;
  convertedContactId?: string | null;
  convertedOpportunityId?: string | null;
}

export interface LeadUrlState {
  q: string;
  statusId: string;
  sourceId: string;
  rating: LeadRating | 'ALL';
  ownership: LeadOwnershipFilter;
  conversion: LeadConversionFilter;
  page: number;
  size: number;
  lead?: string;
  mode?: LeadEditorMode;
}
