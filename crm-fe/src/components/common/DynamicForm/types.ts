import React from 'react';

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'custom';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FormFieldSchema<TValues = Record<string, any>> {
  /** Field unique key corresponding to value key */
  name: Extract<keyof TValues, string>;
  /** Field display label */
  label: string;
  /** Field input type */
  type: FormFieldType;
  /** Placeholder text */
  placeholder?: string;
  /** Is field required */
  required?: boolean;
  /** Options for select inputs */
  options?: SelectOption[] | ((values: TValues) => SelectOption[]);
  /** Unit suffix for numbers or currency (e.g. "VNĐ", "người") */
  unitSuffix?: string;
  /** Icon displayed next to label or inside input */
  icon?: React.ReactNode;
  /** Grid column span: 1, 2, or 'full' (span all cols) */
  colSpan?: 1 | 2 | 'full';
  /** Helper description under field */
  helperText?: string;
  /** Disabled condition or static boolean */
  disabled?: boolean | ((values: TValues) => boolean);
  /** Hidden condition or static boolean */
  hidden?: boolean | ((values: TValues) => boolean);
  /** Custom renderer if type === 'custom' */
  renderCustom?: (props: {
    value: any;
    onChange: (val: any) => void;
    values: TValues;
    field: FormFieldSchema<TValues>;
  }) => React.ReactNode;
}

export interface FormSectionSchema<TValues = Record<string, any>> {
  id?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  fields: FormFieldSchema<TValues>[];
}

export interface FormSchema<TValues = Record<string, any>> {
  sections: FormSectionSchema<TValues>[];
}
