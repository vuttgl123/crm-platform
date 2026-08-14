import { FormSchema } from '@/components/common/DynamicForm';
import { AccountSummaryResponse } from '@/services/api/accountApi';

export interface AccountFormValues {
  displayName: string;
  legalName: string;
  parentAccountId?: string;
  accountType: 'ORGANIZATION' | 'PERSON' | 'PARTNER' | 'RESELLER' | 'SUPPLIER';
  lifecycleStage: 'PROSPECT' | 'QUALIFIED' | 'CUSTOMER' | 'CHURNED' | 'INACTIVE';
  taxIdentifier: string;
  registrationNumber: string;
  industryCode: string;
  website: string;
  revenueAmount: string;
  currencyCode: string;
  employeeCount: string;
  description: string;
  doNotContact: boolean;
}

export function createAccountFormSchema(
  allAccounts: AccountSummaryResponse[] = [],
  currentAccountId?: string
): FormSchema<AccountFormValues> {
  return {
    sections: [
      {
        id: 'identity',
        title: 'Thông tin Định danh & Cấp trực thuộc',
        fields: [
          {
            name: 'displayName',
            label: 'Tên Khách hàng (Hiển thị)',
            type: 'text',
            placeholder: 'Ví dụ: MB Bank hoặc Công ty Cổ phần Tập đoàn...',
            required: true,
            colSpan: 'full',
          },
          {
            name: 'legalName',
            label: 'Tên Pháp lý Đầy đủ',
            type: 'text',
            placeholder: 'Tên ghi trên giấy phép đăng ký kinh doanh...',
            colSpan: 'full',
          },
          {
            name: 'parentAccountId',
            label: 'Khách hàng Cha / Đơn vị cấp trên trực thuộc',
            type: 'select',
            placeholder: 'Chọn Khách hàng Cha / Đơn vị cấp trên...',
            colSpan: 'full',
            options: [
              { label: 'Không có (Khách hàng độc lập / Cấp cao nhất)', value: 'NONE' },
              ...allAccounts
                .filter((a) => a.id !== currentAccountId)
                .map((a) => ({
                  label: `${a.accountNumber} - ${a.displayName}`,
                  value: a.id,
                })),
            ],
          },
        ],
      },
      {
        id: 'legal_classification',
        title: 'Phân loại & Thông tin Pháp lý',
        fields: [
          {
            name: 'accountType',
            label: 'Loại hình Khách hàng',
            type: 'select',
            required: true,
            options: [
              { label: 'Doanh nghiệp', value: 'ORGANIZATION' },
              { label: 'Cá nhân', value: 'PERSON' },
              { label: 'Đối tác chiến lược', value: 'PARTNER' },
              { label: 'Đại lý ủy quyền', value: 'RESELLER' },
              { label: 'Nhà cung cấp', value: 'SUPPLIER' },
            ],
          },
          {
            name: 'lifecycleStage',
            label: 'Giai đoạn Vòng đời',
            type: 'select',
            required: true,
            options: [
              { label: 'Tiềm năng (Prospect)', value: 'PROSPECT' },
              { label: 'Đạt chuẩn (Qualified)', value: 'QUALIFIED' },
              { label: 'Khách hàng chính thức', value: 'CUSTOMER' },
              { label: 'Rời bỏ (Churned)', value: 'CHURNED' },
              { label: 'Ngừng hoạt động', value: 'INACTIVE' },
            ],
          },
          {
            name: 'taxIdentifier',
            label: 'Mã số thuế (MST)',
            type: 'text',
            placeholder: 'Mã số thuế doanh nghiệp...',
          },
          {
            name: 'registrationNumber',
            label: 'Số Giấy phép ĐKKD',
            type: 'text',
            placeholder: 'Số ĐKKD / Giấy phép...',
          },
          {
            name: 'industryCode',
            label: 'Ngành nghề / Lĩnh vực',
            type: 'text',
            placeholder: 'VD: Tài chính ngân hàng, CNTT...',
          },
          {
            name: 'website',
            label: 'Website chính thức',
            type: 'text',
            placeholder: 'https://...',
          },
        ],
      },
      {
        id: 'scale_financials',
        title: 'Chỉ số Tài chính & Quy mô',
        fields: [
          {
            name: 'revenueAmount',
            label: 'Doanh thu Hàng năm (Số tiền)',
            type: 'currency',
            placeholder: 'Ví dụ: 350000000000',
            unitSuffix: 'VNĐ',
          },
          {
            name: 'employeeCount',
            label: 'Quy mô Nhân sự (Số người)',
            type: 'number',
            placeholder: 'Ví dụ: 2500',
            unitSuffix: 'người',
          },
        ],
      },
      {
        id: 'description_marketing',
        title: 'Mô tả & Thiết lập Tiếp thị',
        fields: [
          {
            name: 'description',
            label: 'Mô tả / Ghi chú Chăm sóc',
            type: 'textarea',
            placeholder: 'Nhập thông tin mô tả chi tiết hoặc ghi chú ban đầu...',
            colSpan: 'full',
          },
          {
            name: 'doNotContact',
            label: 'Từ chối nhận cuộc gọi / email (Do Not Contact - DNC)',
            type: 'checkbox',
            colSpan: 'full',
          },
        ],
      },
    ],
  };
}
