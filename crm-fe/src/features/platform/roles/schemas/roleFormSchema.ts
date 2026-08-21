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
      title: 'Role Identity & Data Access Scope',
      fields: [
        {
          name: 'roleCode',
          label: 'Role Identifier Code',
          type: 'text',
          placeholder: 'e.g. SALES_STAFF, AUDITOR',
          required: true,
          colSpan: 1,
        },
        {
          name: 'roleName',
          label: 'Role Display Name',
          type: 'text',
          placeholder: 'e.g. Sales Executive',
          required: true,
          colSpan: 1,
        },
        {
          name: 'roleDesc',
          label: 'Description & Scope of Duty',
          type: 'text',
          placeholder: 'Functional description and operational responsibilities...',
          colSpan: 'full',
        },
        {
          name: 'roleScope',
          label: 'Data Access Scope Level',
          type: 'select',
          required: true,
          colSpan: 'full',
          options: [
            { label: 'INDIVIDUAL (OWN) - Owned records only', value: 'OWN' },
            { label: 'TEAM (DEPARTMENT) - Direct unit member records', value: 'TEAM' },
            { label: 'HIERARCHY (TEAM_TREE) - Department and all child sub-units', value: 'TEAM_TREE' },
            { label: 'TENANT (ENTERPRISE) - All organization records across tenant', value: 'TENANT' },
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
      title: 'Edit Role Metadata & Scope',
      fields: [
        {
          name: 'roleName',
          label: 'Role Display Name',
          type: 'text',
          placeholder: 'e.g. Sales Executive',
          required: true,
          colSpan: 1,
        },
        {
          name: 'status',
          label: 'Operational Status',
          type: 'select',
          required: true,
          colSpan: 1,
          options: [
            { label: 'ACTIVE', value: 'ACTIVE' },
            { label: 'INACTIVE', value: 'INACTIVE' },
          ],
        },
        {
          name: 'roleDesc',
          label: 'Description & Scope of Duty',
          type: 'text',
          placeholder: 'Describe role duties...',
          colSpan: 'full',
        },
        {
          name: 'roleScope',
          label: 'Data Access Scope Level',
          type: 'select',
          required: true,
          colSpan: 'full',
          options: [
            { label: 'INDIVIDUAL (OWN) - Owned records only', value: 'OWN' },
            { label: 'TEAM (DEPARTMENT) - Direct unit member records', value: 'TEAM' },
            { label: 'HIERARCHY (TEAM_TREE) - Department and all child sub-units', value: 'TEAM_TREE' },
            { label: 'TENANT (ENTERPRISE) - All organization records across tenant', value: 'TENANT' },
          ],
        },
      ],
    },
  ],
};
