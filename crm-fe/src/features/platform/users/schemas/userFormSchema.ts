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
      title: 'Personal & Account Details',
      fields: [
        {
          name: 'email',
          label: 'Work Email Address',
          type: 'text',
          placeholder: 'alex.nguyen@enterprise.com',
          required: true,
          colSpan: 'full',
        },
        {
          name: 'displayName',
          label: 'Full Display Name',
          type: 'text',
          placeholder: 'e.g. Alex Nguyen',
          required: true,
          colSpan: 'full',
        },
        {
          name: 'familyName',
          label: 'Last Name',
          type: 'text',
          placeholder: 'Nguyen',
          colSpan: 1,
        },
        {
          name: 'givenName',
          label: 'First Name',
          type: 'text',
          placeholder: 'Alex',
          colSpan: 1,
        },
        {
          name: 'phone',
          label: 'Mobile Phone',
          type: 'text',
          placeholder: '+84 912 345 678',
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
      title: 'Department & Professional Role',
      fields: [
        {
          name: 'department',
          label: 'Department / Team Assignment',
          type: 'select',
          required: true,
          colSpan: 'full',
          options: [
            { label: 'Northern Regional Enterprise Sales', value: 'team-mb-001' },
            { label: 'Commercial Account Executive Team', value: 'team-hn-001' },
            { label: 'Customer Success & Support', value: 'team-cs-001' },
            { label: 'Executive Board & Management', value: 'team-bod-001' },
          ],
        },
        {
          name: 'jobTitle',
          label: 'Job Title',
          type: 'text',
          placeholder: 'e.g. Senior Solution Consultant',
          required: true,
          colSpan: 1,
        },
        {
          name: 'employeeCode',
          label: 'Employee ID Code',
          type: 'text',
          placeholder: 'EMP-9021',
          colSpan: 1,
        },
      ],
    },
  ],
};
