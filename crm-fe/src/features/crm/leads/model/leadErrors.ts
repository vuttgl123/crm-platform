export interface LeadErrorMapping {
  title: string;
  description: string;
  field?: string;
  isConflict?: boolean;
}

export function mapLeadError(error: any): LeadErrorMapping {
  const code = error?.errorCode || error?.code || error?.error;
  const message = error?.message;

  switch (code) {
    case 'LEAD_NUMBER_ALREADY_EXISTS':
      return {
        title: 'Duplicate Lead Number',
        description: 'A lead with this lead number already exists. Please provide a unique lead number.',
        field: 'leadNumber',
      };
    case 'LEAD_VERSION_CONFLICT':
      return {
        title: 'Concurrent Modification Conflict',
        description: 'This lead record was modified by another user or session. Please reload the latest data before saving.',
        isConflict: true,
      };
    case 'LEAD_STATUS_INVALID':
      return {
        title: 'Invalid Lead Status',
        description: 'The selected status is invalid or inactive in the sales configuration catalogue.',
        field: 'statusId',
      };
    case 'LEAD_SOURCE_INVALID':
      return {
        title: 'Invalid Lead Source',
        description: 'The selected source is invalid or inactive in the sales configuration catalogue.',
        field: 'sourceId',
      };
    case 'LEAD_OWNER_INVALID':
      return {
        title: 'Invalid Owner Assignment',
        description: 'The assigned user or team owner is not eligible or is inactive.',
        field: 'owner',
      };
    case 'LEAD_ALREADY_CONVERTED':
      return {
        title: 'Lead Already Converted',
        description: 'This lead has already been converted and cannot be converted again.',
      };
    case 'LEAD_CONVERSION_INVALID':
      return {
        title: 'Invalid Conversion Parameters',
        description: message || 'Please check that the converted status and linked references are valid and active.',
      };
    case 'LEAD_ASSIGNMENT_NO_ELIGIBLE_OWNER':
      return {
        title: 'No Eligible Owner Available',
        description: 'No eligible sales user or team could be found for automatic assignment.',
      };
    case 'LEAD_NOT_FOUND':
      return {
        title: 'Lead Not Found',
        description: 'The requested lead record could not be found or has already been deleted.',
      };
    case 'REQUEST_VALIDATION_FAILED':
      return {
        title: 'Validation Error',
        description: message || 'Please review the highlighted form fields and try again.',
      };
    case 'ACCESS_DENIED':
      return {
        title: 'Access Denied',
        description: 'You do not have sufficient permissions to perform this action on leads.',
      };
    default:
      return {
        title: 'Operation Failed',
        description: message || 'An unexpected error occurred while communicating with the Lead service.',
      };
  }
}
