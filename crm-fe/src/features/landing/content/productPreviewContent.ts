export interface PreviewPipelineItem {
  id: string;
  labelKey: string;
  stage: 'PROSPECT' | 'QUALIFIED' | 'CUSTOMER';
  nextActionKey: string;
  accountName: string;
  industry: string;
  contactPerson: string;
  amount: string;
  probability: string;
}

export const previewPipelineItems: PreviewPipelineItem[] = [
  {
    id: 'customer-data',
    labelKey: 'landing.preview.items.customerData',
    stage: 'PROSPECT',
    nextActionKey: 'landing.preview.actions.qualify',
    accountName: 'Pacific Rim Real Estate Group',
    industry: 'Real Estate & Construction',
    contactPerson: 'David Miller (Project Director)',
    amount: '1,250,000,000 ₫',
    probability: '60%',
  },
  {
    id: 'quote-process',
    labelKey: 'landing.preview.items.quoteProcess',
    stage: 'QUALIFIED',
    nextActionKey: 'landing.preview.actions.review',
    accountName: 'NovaStar Enterprise Tech Corp',
    industry: 'IT & Cloud Telecom',
    contactPerson: 'Sarah Jenkins (Procurement Lead)',
    amount: '780,000,000 ₫',
    probability: '85%',
  },
  {
    id: 'renewal-workflow',
    labelKey: 'landing.preview.items.renewalWorkflow',
    stage: 'CUSTOMER',
    nextActionKey: 'landing.preview.actions.followUp',
    accountName: 'Apex Health Logistics',
    industry: 'Healthcare & Pharma',
    contactPerson: 'James Harrison (COO)',
    amount: '3,400,000,000 ₫',
    probability: '95%',
  },
];
