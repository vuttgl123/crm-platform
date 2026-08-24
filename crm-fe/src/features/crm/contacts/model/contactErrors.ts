export interface ContactErrorMapping {
  title: string;
  description: string;
  field?: string;
  isConflict?: boolean;
}

export function mapContactError(error: any): ContactErrorMapping {
  const code = error?.errorCode || error?.code || error?.error;
  const message = error?.message;

  switch (code) {
    case 'CONTACT_NUMBER_ALREADY_EXISTS':
      return {
        title: 'Duplicate Contact Number',
        description: 'A contact with this contact number already exists in this tenant. Please use a unique number.',
        field: 'contactNumber',
      };
    case 'CONTACT_VERSION_CONFLICT':
      return {
        title: 'Concurrent Modification Conflict',
        description: 'This contact was modified by another session. Please reload the latest record before saving your changes.',
        isConflict: true,
      };
    case 'CONTACT_NOT_FOUND':
      return {
        title: 'Contact Not Found',
        description: 'The requested contact record could not be found or has already been deleted.',
      };
    case 'CONTACT_ACCOUNT_INVALID':
      return {
        title: 'Invalid Account Association',
        description: 'The selected account does not exist or is not accessible.',
        field: 'accountId',
      };
    case 'CONTACT_OWNER_INVALID':
      return {
        title: 'Invalid Owner Assignment',
        description: 'The assigned user or team owner is invalid or inactive.',
        field: 'owner',
      };
    case 'REQUEST_VALIDATION_FAILED':
      return {
        title: 'Validation Error',
        description: message || 'Please check the highlighted form fields and try again.',
      };
    case 'ACCESS_DENIED':
      return {
        title: 'Access Denied',
        description: 'You do not have permission to perform this action on contacts.',
      };
    default:
      return {
        title: 'Operation Failed',
        description: message || 'An unexpected error occurred while saving the contact record.',
      };
  }
}
