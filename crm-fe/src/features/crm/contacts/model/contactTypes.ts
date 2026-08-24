import {
  ContactLifecycleStage,
  PreferredContactChannel,
  ContactOwner,
} from '@/services/api/contactApi';

export type {
  ContactLifecycleStage,
  PreferredContactChannel,
  ContactOwner,
};

export type ContactEditorMode = 'view' | 'create' | 'edit';
export type ContactOwnershipFilter = 'ALL' | 'MINE' | 'TEAM';

export interface ContactFilterState {
  q: string;
  stage: ContactLifecycleStage | 'ALL';
  ownership: ContactOwnershipFilter;
  accountId?: string;
  page: number;
  size: number;
}

export interface ContactFormValues {
  contactNumber: string;
  accountId?: string | null;
  owner?: ContactOwner | null;
  honorific?: string | null;
  givenName?: string | null;
  middleName?: string | null;
  familyName?: string | null;
  displayName: string;
  jobTitle?: string | null;
  department?: string | null;
  preferredLanguageCode?: string | null;
  preferredContactChannel?: PreferredContactChannel | null;
  lifecycleStage: ContactLifecycleStage;
  dateOfBirth?: string | null;
  doNotContact: boolean;
  description?: string | null;
  version?: number;
}

export interface ContactUrlState {
  q: string;
  stage: ContactLifecycleStage | 'ALL';
  ownership: ContactOwnershipFilter;
  account?: string;
  page: number;
  size: number;
  contact?: string;
  mode?: ContactEditorMode;
}

export interface AccountOption {
  id: string;
  displayName: string;
  accountNumber: string;
}
