import { FormSchema } from '@/components/common/DynamicForm';

export interface UserStep1Values {
  email: string;
  displayName: string;
  familyName: string;
  givenName: string;
  phone: string;
}

export interface UserStep2Values {
  department: string;
  jobTitle: string;
  employeeCode: string;
}

export interface UserStep3Values {
  selectedRole: string;
}

export interface UserFormValues extends UserStep1Values, UserStep2Values, UserStep3Values {}

/** Step 1 Schema: Personal & Account */
export const userStep1Schema: FormSchema<UserStep1Values> = {
  sections: [
    {
      id: 'personal_info',
      title: 'Thông tin Cá nhân & Khởi tạo Tài khoản',
      fields: [
        {
          name: 'email',
          label: 'Email Công việc',
          type: 'text',
          placeholder: 'nguyen.van.a@company.com',
          required: true,
          colSpan: 'full',
        },
        {
          name: 'displayName',
          label: 'Họ và Tên Hiển thị (Đầy đủ)',
          type: 'text',
          placeholder: 'Ví dụ: Nguyễn Văn Anh',
          required: true,
          colSpan: 'full',
        },
        {
          name: 'familyName',
          label: 'Họ & Tên lót',
          type: 'text',
          placeholder: 'Nguyễn Văn',
          colSpan: 1,
        },
        {
          name: 'givenName',
          label: 'Tên chính',
          type: 'text',
          placeholder: 'Anh',
          colSpan: 1,
        },
        {
          name: 'phone',
          label: 'Số điện thoại Di động',
          type: 'text',
          placeholder: '0912 345 678',
          colSpan: 'full',
        },
      ],
    },
  ],
};

/** Step 2 Schema: Department & Job Information */
export const userStep2Schema: FormSchema<UserStep2Values> = {
  sections: [
    {
      id: 'job_info',
      title: 'Phòng ban & Chức danh Chuyên môn',
      fields: [
        {
          name: 'department',
          label: 'Phòng ban / Nhóm Làm việc',
          type: 'select',
          required: true,
          colSpan: 'full',
          options: [
            { label: 'Khối Kinh doanh Miền Bắc', value: 'team-mb-001' },
            { label: 'Nhóm Kinh doanh Hà Nội 1', value: 'team-hn-001' },
            { label: 'Phòng Chăm sóc Khách hàng', value: 'team-cs-001' },
            { label: 'Ban Giám đốc', value: 'team-bod-001' },
          ],
        },
        {
          name: 'jobTitle',
          label: 'Chức danh Chuyên môn',
          type: 'text',
          placeholder: 'Ví dụ: Chuyên viên Tư vấn Khách hàng',
          required: true,
          colSpan: 1,
        },
        {
          name: 'employeeCode',
          label: 'Mã Số Nhân viên (Mã định danh)',
          type: 'text',
          placeholder: 'Ví dụ: EMP-202608',
          colSpan: 1,
        },
      ],
    },
  ],
};

/** Step 3 Schema: System Role Assignment */
export const userStep3Schema: FormSchema<UserStep3Values> = {
  sections: [
    {
      id: 'role_info',
      title: 'Phân bổ Vai trò & Quyền hạn Hệ thống',
      fields: [
        {
          name: 'selectedRole',
          label: 'Vai trò Phân quyền Hệ thống',
          type: 'select',
          required: true,
          colSpan: 'full',
          options: [
            { label: 'Quản trị viên Hệ thống (ADMIN)', value: 'ADMIN' },
            { label: 'Quản lý Vùng (REGIONAL_MANAGER)', value: 'REGIONAL_MANAGER' },
            { label: 'Trưởng nhóm Kinh doanh (TEAM_LEADER)', value: 'TEAM_LEADER' },
            { label: 'Nhân viên Kinh doanh (SALES_STAFF)', value: 'SALES_STAFF' },
            { label: 'Người xem Read-only (VIEWER)', value: 'VIEWER' },
          ],
        },
      ],
    },
  ],
};
