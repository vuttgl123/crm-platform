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

export interface PreviewLeadRow {
  id: string;
  name: string;
  company: string;
  source: string;
  /** Must match a key in LeadStatusConfigMap: MockLeadTable looks the badge
   *  styling up by this string. */
  status: string;
  owner: string;
}

export const previewLeadRows: PreviewLeadRow[] = [
  { id: 'l1', name: 'Elena Marsh',   company: 'Northwind Logistics',  source: 'Web form',   status: 'NEW',       owner: 'TM' },
  { id: 'l2', name: 'Daniel Okafor', company: 'Helios Manufacturing', source: 'Referral',   status: 'CONTACTED', owner: 'PL' },
  { id: 'l3', name: 'Sarah Jenkins', company: 'NovaStar Enterprise',  source: 'Trade show', status: 'QUALIFIED', owner: 'TM' },
  { id: 'l4', name: 'Marco Rossi',   company: 'Adriatic Foods Group', source: 'Outbound',   status: 'CONTACTED', owner: 'HN' },
  { id: 'l5', name: 'Priya Raman',   company: 'Cobalt Health Systems', source: 'Partner',   status: 'NEW',       owner: 'PL' },
];

export interface PreviewQuoteLine {
  id: string;
  product: string;
  qty: number;
  unitPrice: string;
  total: string;
}

export const previewQuoteLines: PreviewQuoteLine[] = [
  { id: 'q1', product: 'Platform licence - Standard',  qty: 40, unitPrice: '4,200,000 ₫',  total: '168,000,000 ₫' },
  { id: 'q2', product: 'Data migration package',       qty: 1,  unitPrice: '96,000,000 ₫', total: '96,000,000 ₫' },
  { id: 'q3', product: 'Onboarding and training',      qty: 3,  unitPrice: '18,000,000 ₫', total: '54,000,000 ₫' },
  { id: 'q4', product: 'Priority support - 12 months', qty: 1,  unitPrice: '42,000,000 ₫', total: '42,000,000 ₫' },
];

export interface PreviewApprovalStep {
  id: string;
  role: string;
  person: string;
  initials: string;
  state: 'approved' | 'pending' | 'waiting';
}

export const previewApprovalSteps: PreviewApprovalStep[] = [
  { id: 'a1', role: 'Sales manager',        person: 'Thanh Mai',  initials: 'TM', state: 'approved' },
  { id: 'a2', role: 'Finance review',       person: 'Peter Lund', initials: 'PL', state: 'pending' },
  { id: 'a3', role: 'Commercial director',  person: 'Hai Nguyen', initials: 'HN', state: 'waiting' },
];

export interface PreviewContractRow {
  id: string;
  code: string;
  account: string;
  value: string;
  endDate: string;
  status: string;
}

export const previewContractRows: PreviewContractRow[] = [
  { id: 'c1', code: 'CTR-2026-0148', account: 'Pacific Rim Real Estate', value: '1,250,000,000 ₫', endDate: '2027-03-31', status: 'ACTIVE' },
  { id: 'c2', code: 'CTR-2026-0151', account: 'NovaStar Enterprise',     value: '780,000,000 ₫',   endDate: '2026-12-15', status: 'ACTIVE' },
  { id: 'c3', code: 'CTR-2025-0932', account: 'Apex Health Logistics',   value: '3,400,000,000 ₫', endDate: '2026-09-30', status: 'RENEWAL' },
  { id: 'c4', code: 'CTR-2025-0871', account: 'Helios Manufacturing',    value: '520,000,000 ₫',   endDate: '2026-08-31', status: 'EXPIRING' },
];

export interface PreviewActivityRow {
  id: string;
  kind: string;
  summary: string;
  when: string;
  initials: string;
}

export const previewActivityRows: PreviewActivityRow[] = [
  { id: 'v1', kind: 'Call',    summary: 'Discovery call with procurement',    when: '2 days ago', initials: 'TM' },
  { id: 'v2', kind: 'Meeting', summary: 'Solution walkthrough - 6 attendees', when: '5 days ago', initials: 'PL' },
  { id: 'v3', kind: 'Email',   summary: 'Sent revised commercial scope',      when: '1 week ago', initials: 'TM' },
];
