import {
  ContactResponse,
  CreateContactRequest,
  UpdateContactRequest,
} from '@/services/api/contactApi';
import { ContactFormValues } from './contactTypes';

export function createDefaultContactFormValues(): ContactFormValues {
  return {
    contactNumber: '',
    accountId: null,
    owner: null,
    honorific: '',
    givenName: '',
    middleName: '',
    familyName: '',
    displayName: '',
    jobTitle: '',
    department: '',
    preferredLanguageCode: '',
    preferredContactChannel: null,
    lifecycleStage: 'PROSPECT',
    dateOfBirth: null,
    doNotContact: false,
    description: '',
  };
}

export function contactResponseToFormValues(detail: ContactResponse): ContactFormValues {
  return {
    contactNumber: detail.contactNumber || '',
    accountId: detail.accountId || null,
    owner: detail.owner || null,
    honorific: detail.honorific || '',
    givenName: detail.givenName || '',
    middleName: detail.middleName || '',
    familyName: detail.familyName || '',
    displayName: detail.displayName || '',
    jobTitle: detail.jobTitle || '',
    department: detail.department || '',
    preferredLanguageCode: detail.preferredLanguageCode || '',
    preferredContactChannel: detail.preferredContactChannel || null,
    lifecycleStage: detail.lifecycleStage || 'PROSPECT',
    dateOfBirth: detail.dateOfBirth || null,
    doNotContact: Boolean(detail.doNotContact),
    description: detail.description || '',
    version: detail.version,
  };
}

export function formValuesToCreateRequest(values: ContactFormValues): CreateContactRequest {
  return {
    contactNumber: values.contactNumber.trim(),
    accountId: values.accountId || null,
    owner: values.owner?.id ? values.owner : null,
    honorific: values.honorific?.trim() || null,
    givenName: values.givenName?.trim() || null,
    middleName: values.middleName?.trim() || null,
    familyName: values.familyName?.trim() || null,
    displayName: values.displayName.trim(),
    jobTitle: values.jobTitle?.trim() || null,
    department: values.department?.trim() || null,
    preferredLanguageCode: values.preferredLanguageCode?.trim() || null,
    preferredContactChannel: values.preferredContactChannel || null,
    lifecycleStage: values.lifecycleStage || 'PROSPECT',
    dateOfBirth: values.dateOfBirth || null,
    doNotContact: Boolean(values.doNotContact),
    description: values.description?.trim() || null,
  };
}

export function formValuesToUpdateRequest(
  values: ContactFormValues,
  version: number
): UpdateContactRequest {
  return {
    version,
    accountId: values.accountId || null,
    owner: values.owner?.id ? values.owner : null,
    honorific: values.honorific?.trim() || null,
    givenName: values.givenName?.trim() || null,
    middleName: values.middleName?.trim() || null,
    familyName: values.familyName?.trim() || null,
    displayName: values.displayName.trim(),
    jobTitle: values.jobTitle?.trim() || null,
    department: values.department?.trim() || null,
    preferredLanguageCode: values.preferredLanguageCode?.trim() || null,
    preferredContactChannel: values.preferredContactChannel || null,
    lifecycleStage: values.lifecycleStage,
    dateOfBirth: values.dateOfBirth || null,
    doNotContact: Boolean(values.doNotContact),
    description: values.description?.trim() || null,
  };
}
