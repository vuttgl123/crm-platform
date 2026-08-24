import {
  LeadResponse,
  CreateLeadRequest,
  UpdateLeadRequest,
  ConvertLeadRequest,
} from '@/services/api/leadApi';
import { LeadFormValues, LeadConversionFormValues } from './leadTypes';

export function createDefaultLeadFormValues(defaultStatusId: string = ''): LeadFormValues {
  return {
    leadNumber: '',
    statusId: defaultStatusId,
    sourceId: null,
    owner: null,
    rating: null,
    accountName: '',
    companyName: '',
    honorific: '',
    givenName: '',
    familyName: '',
    displayName: '',
    email: '',
    phoneE164: '',
    jobTitle: '',
    website: '',
    countryCode: '',
    preferredLanguageCode: '',
    estimatedValueAmount: null,
    estimatedValueCurrency: 'USD',
    qualificationNotes: '',
    disqualificationReason: '',
  };
}

export function leadResponseToFormValues(detail: LeadResponse): LeadFormValues {
  return {
    leadNumber: detail.leadNumber || '',
    statusId: detail.statusId || '',
    sourceId: detail.sourceId || null,
    owner: detail.owner || null,
    rating: detail.rating || null,
    accountName: detail.accountName || '',
    companyName: detail.companyName || '',
    honorific: detail.honorific || '',
    givenName: detail.givenName || '',
    familyName: detail.familyName || '',
    displayName: detail.displayName || '',
    email: detail.email || '',
    phoneE164: detail.phoneE164 || '',
    jobTitle: detail.jobTitle || '',
    website: detail.website || '',
    countryCode: detail.countryCode || '',
    preferredLanguageCode: detail.preferredLanguageCode || '',
    estimatedValueAmount: detail.estimatedValue?.amount ?? null,
    estimatedValueCurrency: detail.estimatedValue?.currencyCode || 'USD',
    qualificationNotes: detail.qualificationNotes || '',
    disqualificationReason: detail.disqualificationReason || '',
    version: detail.version,
  };
}

export function formValuesToCreateRequest(values: LeadFormValues): CreateLeadRequest {
  return {
    leadNumber: values.leadNumber.trim(),
    statusId: values.statusId,
    sourceId: values.sourceId || null,
    owner: values.owner?.id ? values.owner : null,
    rating: values.rating || null,
    accountName: values.accountName?.trim() || null,
    companyName: values.companyName?.trim() || null,
    honorific: values.honorific?.trim() || null,
    givenName: values.givenName?.trim() || null,
    familyName: values.familyName?.trim() || null,
    displayName: values.displayName.trim(),
    email: values.email?.trim() || null,
    phoneE164: values.phoneE164?.trim() || null,
    jobTitle: values.jobTitle?.trim() || null,
    website: values.website?.trim() || null,
    countryCode: values.countryCode?.trim()?.toUpperCase() || null,
    preferredLanguageCode: values.preferredLanguageCode?.trim() || null,
    estimatedValue:
      values.estimatedValueAmount !== null && values.estimatedValueAmount !== undefined
        ? {
            amount: values.estimatedValueAmount,
            currencyCode: values.estimatedValueCurrency?.trim() || 'USD',
          }
        : null,
    qualificationNotes: values.qualificationNotes?.trim() || null,
  };
}

export function formValuesToUpdateRequest(
  values: LeadFormValues,
  version: number
): UpdateLeadRequest {
  return {
    version,
    statusId: values.statusId,
    sourceId: values.sourceId || null,
    owner: values.owner?.id ? values.owner : null,
    rating: values.rating || null,
    accountName: values.accountName?.trim() || null,
    companyName: values.companyName?.trim() || null,
    honorific: values.honorific?.trim() || null,
    givenName: values.givenName?.trim() || null,
    familyName: values.familyName?.trim() || null,
    displayName: values.displayName.trim(),
    email: values.email?.trim() || null,
    phoneE164: values.phoneE164?.trim() || null,
    jobTitle: values.jobTitle?.trim() || null,
    website: values.website?.trim() || null,
    countryCode: values.countryCode?.trim()?.toUpperCase() || null,
    preferredLanguageCode: values.preferredLanguageCode?.trim() || null,
    estimatedValue:
      values.estimatedValueAmount !== null && values.estimatedValueAmount !== undefined
        ? {
            amount: values.estimatedValueAmount,
            currencyCode: values.estimatedValueCurrency?.trim() || 'USD',
          }
        : null,
    qualificationNotes: values.qualificationNotes?.trim() || null,
    disqualificationReason: values.disqualificationReason?.trim() || null,
  };
}

export function formValuesToConvertRequest(
  values: LeadConversionFormValues
): ConvertLeadRequest {
  return {
    version: values.version,
    convertedStatusId: values.convertedStatusId,
    convertedAccountId: values.convertedAccountId || null,
    convertedContactId: values.convertedContactId || null,
    convertedOpportunityId: values.convertedOpportunityId || null,
  };
}
