export interface PreviewPipelineItem {
  id: string;
  labelKey: string;
  stage: 'PROSPECT' | 'QUALIFIED' | 'CUSTOMER';
  nextActionKey: string;
}

export const previewPipelineItems: PreviewPipelineItem[] = [
  {
    id: 'customer-data',
    labelKey: 'landing.preview.items.customerData',
    stage: 'PROSPECT',
    nextActionKey: 'landing.preview.actions.qualify',
  },
  {
    id: 'quote-process',
    labelKey: 'landing.preview.items.quoteProcess',
    stage: 'QUALIFIED',
    nextActionKey: 'landing.preview.actions.review',
  },
  {
    id: 'renewal-workflow',
    labelKey: 'landing.preview.items.renewalWorkflow',
    stage: 'CUSTOMER',
    nextActionKey: 'landing.preview.actions.followUp',
  },
];
