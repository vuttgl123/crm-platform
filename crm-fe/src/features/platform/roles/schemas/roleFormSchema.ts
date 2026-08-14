import { FormSchema } from '@/components/common/DynamicForm';

export interface RoleFormValues {
  roleCode: string;
  roleName: string;
  roleDesc: string;
  roleScope: 'OWN' | 'TEAM' | 'TEAM_TREE' | 'TENANT';
}

export interface EditRoleFormValues {
  roleName: string;
  status: 'ACTIVE' | 'INACTIVE';
  roleDesc: string;
  roleScope: 'OWN' | 'TEAM' | 'TEAM_TREE' | 'TENANT';
}

/** Schema for Creating New Role Metadata */
export const createRoleFormSchema: FormSchema<RoleFormValues> = {
  sections: [
    {
      id: 'role_info',
      title: 'Thông tin Định danh & Phạm vi Vai trò',
      fields: [
        {
          name: 'roleCode',
          label: 'Mã Vai trò (Role Code)',
          type: 'text',
          placeholder: 'VD: SALES_STAFF, AUDITOR',
          required: true,
          colSpan: 1,
        },
        {
          name: 'roleName',
          label: 'Tên Hiển thị Vai trò',
          type: 'text',
          placeholder: 'VD: Nhân viên Kinh doanh',
          required: true,
          colSpan: 1,
        },
        {
          name: 'roleDesc',
          label: 'Mô tả Chức năng & Quyền hạn',
          type: 'text',
          placeholder: 'Mô tả phạm vi vai trò trong hệ thống...',
          colSpan: 'full',
        },
        {
          name: 'roleScope',
          label: 'Phạm vi Truy cập Dữ liệu',
          type: 'select',
          required: true,
          colSpan: 'full',
          options: [
            { label: 'Cá nhân - Dữ liệu trực tiếp phụ trách', value: 'OWN' },
            { label: 'Phòng ban - Dữ liệu thuộc nhóm trực thuộc', value: 'TEAM' },
            { label: 'Phòng ban & Chi nhánh - Cả đơn vị cấp dưới', value: 'TEAM_TREE' },
            { label: 'Toàn hệ thống - Toàn bộ tập đoàn', value: 'TENANT' },
          ],
        },
      ],
    },
  ],
};

/** Schema for Editing Role Metadata */
export const editRoleFormSchema: FormSchema<EditRoleFormValues> = {
  sections: [
    {
      id: 'edit_role_info',
      title: 'Chỉnh sửa Thông tin & Phạm vi Dữ liệu',
      fields: [
        {
          name: 'roleName',
          label: 'Tên Hiển thị Vai trò',
          type: 'text',
          placeholder: 'Tên vai trò...',
          required: true,
          colSpan: 1,
        },
        {
          name: 'status',
          label: 'Trạng thái Hoạt động',
          type: 'select',
          required: true,
          colSpan: 1,
          options: [
            { label: 'Đang hoạt động', value: 'ACTIVE' },
            { label: 'Tạm ngưng', value: 'INACTIVE' },
          ],
        },
        {
          name: 'roleDesc',
          label: 'Mô tả Chức năng & Quyền hạn',
          type: 'text',
          placeholder: 'Nhập mô tả phạm vi vai trò...',
          colSpan: 'full',
        },
        {
          name: 'roleScope',
          label: 'Phạm vi Truy cập Dữ liệu',
          type: 'select',
          required: true,
          colSpan: 'full',
          options: [
            { label: 'Cá nhân - Dữ liệu trực tiếp phụ trách', value: 'OWN' },
            { label: 'Phòng ban - Dữ liệu thuộc nhóm trực thuộc', value: 'TEAM' },
            { label: 'Phòng ban & Chi nhánh - Cả đơn vị cấp dưới', value: 'TEAM_TREE' },
            { label: 'Toàn hệ thống - Toàn bộ tập đoàn', value: 'TENANT' },
          ],
        },
      ],
    },
  ],
};
