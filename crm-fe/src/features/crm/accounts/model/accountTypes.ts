import {
  AccountType,
  AccountLifecycleStage,
  OwnerType,
  AccountOwner,
  AccountRevenue,
  AccountSummaryResponse,
  AccountResponse,
} from '@/services/api/accountApi';
import {
  AccountAddressType,
  AccountAddressResponse,
  CreateAccountAddressRequest,
  UpdateAccountAddressRequest,
} from '@/services/api/accountAddressApi';
import {
  ChannelType,
  AccountCommunicationChannelResponse,
  CreateAccountCommunicationChannelRequest,
  UpdateAccountCommunicationChannelRequest,
} from '@/services/api/accountChannelApi';
import {
  RelationshipType,
  RelationshipDirection,
  AccountRelationshipResponse,
  CreateAccountRelationshipRequest,
  EndAccountRelationshipRequest,
} from '@/services/api/accountRelationshipApi';
import { NoteItem, NoteVisibility } from '@/services/api/noteApi';

export type {
  AccountType,
  AccountLifecycleStage,
  OwnerType,
  AccountOwner,
  AccountRevenue,
  AccountSummaryResponse,
  AccountResponse,
  AccountAddressType,
  AccountAddressResponse,
  CreateAccountAddressRequest,
  UpdateAccountAddressRequest,
  ChannelType,
  AccountCommunicationChannelResponse,
  CreateAccountCommunicationChannelRequest,
  UpdateAccountCommunicationChannelRequest,
  RelationshipType,
  RelationshipDirection,
  AccountRelationshipResponse,
  CreateAccountRelationshipRequest,
  EndAccountRelationshipRequest,
  NoteItem,
  NoteVisibility,
};

export type AccountEditorMode = 'create' | 'edit' | 'subsidiary';
export type AccountDetailTab = 'overview' | 'addresses' | 'channels' | 'relationships' | 'subsidiaries' | 'notes';
export type AccountOwnershipFilter = 'ALL' | 'MINE' | 'TEAM';
export type AccountViewMode = 'tree' | 'flat';

export interface AccountTreeNode {
  account: AccountSummaryResponse;
  children: AccountTreeNode[];
  level: number;
}

export interface AccountFilterState {
  q: string;
  accountType: AccountType | 'ALL';
  lifecycleStage: AccountLifecycleStage | 'ALL';
  ownership: AccountOwnershipFilter;
  viewMode: AccountViewMode;
  page: number;
  size: number;
}

export interface AccountFormValues {
  accountNumber: string;
  accountType: AccountType;
  displayName: string;
  legalName?: string | null;
  parentAccountId?: string | null;
  owner?: AccountOwner | null;
  lifecycleStage: AccountLifecycleStage;
  industryCode?: string | null;
  taxIdentifier?: string | null;
  registrationNumber?: string | null;
  website?: string | null;
  annualRevenueAmount?: number | null;
  annualRevenueCurrency?: string;
  employeeCount?: number | null;
  description?: string | null;
  preferredLanguageCode?: string | null;
  doNotContact: boolean;
  version?: number;
}

export interface AccountUrlState {
  q: string;
  accountType: AccountType | 'ALL';
  lifecycleStage: AccountLifecycleStage | 'ALL';
  ownership: AccountOwnershipFilter;
  viewMode: AccountViewMode;
  page: number;
  size: number;
  account?: string;
  mode?: AccountEditorMode;
  parentId?: string;
}

