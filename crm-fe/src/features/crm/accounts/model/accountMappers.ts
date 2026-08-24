import {
  AccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '@/services/api/accountApi';
import { AccountFormValues } from './accountTypes';

export function createDefaultAccountFormValues(
  parentAccountId?: string | null
): AccountFormValues {
  return {
    accountNumber: '',
    accountType: 'ORGANIZATION',
    displayName: '',
    legalName: '',
    parentAccountId: parentAccountId || null,
    owner: null,
    lifecycleStage: 'PROSPECT',
    industryCode: '',
    taxIdentifier: '',
    registrationNumber: '',
    website: '',
    annualRevenueAmount: null,
    annualRevenueCurrency: 'USD',
    employeeCount: null,
    description: '',
    preferredLanguageCode: '',
    doNotContact: false,
  };
}

export function accountResponseToFormValues(
  detail: AccountResponse
): AccountFormValues {
  return {
    accountNumber: detail.accountNumber || '',
    accountType: detail.accountType,
    displayName: detail.displayName || '',
    legalName: detail.legalName || '',
    parentAccountId: detail.parentAccountId || null,
    owner: detail.owner || null,
    lifecycleStage: detail.lifecycleStage,
    industryCode: detail.industryCode || '',
    taxIdentifier: detail.taxIdentifier || '',
    registrationNumber: detail.registrationNumber || '',
    website: detail.website || '',
    annualRevenueAmount: detail.annualRevenue?.amount ?? null,
    annualRevenueCurrency: detail.annualRevenue?.currencyCode || 'USD',
    employeeCount: detail.employeeCount ?? null,
    description: detail.description || '',
    preferredLanguageCode: detail.preferredLanguageCode || '',
    doNotContact: Boolean(detail.doNotContact),
    version: detail.version,
  };
}

export function formValuesToCreateRequest(
  values: AccountFormValues
): CreateAccountRequest {
  return {
    accountNumber: values.accountNumber.trim(),
    accountType: values.accountType,
    legalName: values.legalName?.trim() || null,
    displayName: values.displayName.trim(),
    parentAccountId: values.parentAccountId || null,
    owner: values.owner?.id ? values.owner : null,
    lifecycleStage: values.lifecycleStage,
    industryCode: values.industryCode?.trim() || null,
    taxIdentifier: values.taxIdentifier?.trim() || null,
    registrationNumber: values.registrationNumber?.trim() || null,
    website: values.website?.trim() || null,
    annualRevenue:
      values.annualRevenueAmount !== null && values.annualRevenueAmount !== undefined
        ? {
            amount: values.annualRevenueAmount,
            currencyCode: values.annualRevenueCurrency?.trim() || 'USD',
          }
        : null,
    employeeCount: values.employeeCount ?? null,
    description: values.description?.trim() || null,
    preferredLanguageCode: values.preferredLanguageCode?.trim() || null,
    doNotContact: values.doNotContact,
  };
}

export function formValuesToUpdateRequest(
  values: AccountFormValues,
  version: number
): UpdateAccountRequest {
  return {
    version,
    accountType: values.accountType,
    displayName: values.displayName.trim(),
    lifecycleStage: values.lifecycleStage,
    doNotContact: values.doNotContact,
    legalName: values.legalName?.trim() || null,
    parentAccountId: values.parentAccountId || null,
    owner: values.owner?.id ? values.owner : null,
    industryCode: values.industryCode?.trim() || null,
    taxIdentifier: values.taxIdentifier?.trim() || null,
    registrationNumber: values.registrationNumber?.trim() || null,
    website: values.website?.trim() || null,
    annualRevenue:
      values.annualRevenueAmount !== null && values.annualRevenueAmount !== undefined
        ? {
            amount: values.annualRevenueAmount,
            currencyCode: values.annualRevenueCurrency?.trim() || 'USD',
          }
        : null,
    employeeCount: values.employeeCount ?? null,
    description: values.description?.trim() || null,
    preferredLanguageCode: values.preferredLanguageCode?.trim() || null,
  };
}
