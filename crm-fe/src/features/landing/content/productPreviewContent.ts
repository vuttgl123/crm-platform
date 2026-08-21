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
    accountName: 'Tập đoàn Bất động sản Phú Mỹ',
    industry: 'Bất động sản',
    contactPerson: 'Trần Minh Đức (Giám đốc Dự án)',
    amount: '1.250.000.000 ₫',
    probability: '60%',
  },
  {
    id: 'quote-process',
    labelKey: 'landing.preview.items.quoteProcess',
    stage: 'QUALIFIED',
    nextActionKey: 'landing.preview.actions.review',
    accountName: 'Công ty CP Công nghệ Sao Việt',
    industry: 'CNTT & Viễn thông',
    contactPerson: 'Nguyễn Thị Hương (Trưởng phòng Mua hàng)',
    amount: '780.000.000 ₫',
    probability: '85%',
  },
  {
    id: 'renewal-workflow',
    labelKey: 'landing.preview.items.renewalWorkflow',
    stage: 'CUSTOMER',
    nextActionKey: 'landing.preview.actions.followUp',
    accountName: 'Tổng công ty Dược Phẩm Á Châu',
    industry: 'Y tế & Dược phẩm',
    contactPerson: 'Lê Hoàng Nam (Phó TGĐ Vận hành)',
    amount: '3.400.000.000 ₫',
    probability: '95%',
  },
];
