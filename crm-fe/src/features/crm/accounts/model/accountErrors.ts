export interface AccountErrorMapping {
  title: string;
  description: string;
  field?: string;
  isConflict?: boolean;
}

export function mapAccountError(error: any): AccountErrorMapping {
  const code = error?.errorCode || error?.code || error?.error;
  const message = error?.message;

  switch (code) {
    case 'ACCOUNT_NUMBER_ALREADY_EXISTS':
      return {
        title: 'Duplicate Account Number',
        description: 'An account with this account number already exists. Please provide a unique account number.',
        field: 'accountNumber',
      };
    case 'ACCOUNT_VERSION_CONFLICT':
      return {
        title: 'Concurrent Modification Conflict',
        description: 'This account was modified by another user or session. Please reload the latest account data before saving.',
        isConflict: true,
      };
    case 'ACCOUNT_OWNER_INVALID':
      return {
        title: 'Invalid Owner Assignment',
        description: 'The assigned user or team owner is not eligible or is inactive in your organization.',
        field: 'owner',
      };
    case 'ACCOUNT_PARENT_INVALID':
      return {
        title: 'Invalid Parent Account',
        description: 'The selected parent account is invalid, inactive, or outside your data scope.',
        field: 'parentAccountId',
      };
    case 'ACCOUNT_PARENT_CYCLE':
      return {
        title: 'Parent Hierarchy Cycle Detected',
        description: 'An account cannot be parented under itself or one of its own descendants. Please choose a different parent.',
        field: 'parentAccountId',
      };
    case 'ACCOUNT_HAS_ACTIVE_CHILDREN':
      return {
        title: 'Cannot Delete Account With Active Subsidiaries',
        description: 'This account has active subsidiary accounts. Please reparent or resolve subsidiaries before deleting.',
      };
    case 'ACCOUNT_REVENUE_CURRENCY_REQUIRED':
      return {
        title: 'Currency Code Required',
        description: 'An annual revenue amount requires a valid 3-letter uppercase currency code (e.g. USD).',
        field: 'annualRevenueCurrency',
      };
    case 'ACCOUNT_NOT_FOUND':
      return {
        title: 'Account Not Found',
        description: 'The requested account record could not be found or has already been removed.',
      };
    case 'REQUEST_VALIDATION_FAILED':
      return {
        title: 'Validation Error',
        description: message || 'Please review the highlighted form fields and try again.',
      };
    case 'ACCESS_DENIED':
      return {
        title: 'Access Denied',
        description: 'You do not have sufficient permissions to perform this action on accounts.',
      };
    default:
      return {
        title: 'Operation Failed',
        description: message || 'An unexpected error occurred while communicating with the Account service.',
      };
  }
}
