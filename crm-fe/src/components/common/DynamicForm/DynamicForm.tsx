import React from 'react';
import { FormSchema, FormFieldSchema, SelectOption } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Checkbox } from '@/components/ui/checkbox';
import { BusinessNumberInput } from '@/components/ui/BusinessNumberInput';

export interface DynamicFormProps<TValues extends Record<string, any>> {
  schema: FormSchema<TValues>;
  values: TValues;
  onChange: (field: Extract<keyof TValues, string>, value: any) => void;
  formId?: string;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  disabled?: boolean;
}

export function DynamicForm<TValues extends Record<string, any>>({
  schema,
  values,
  onChange,
  formId,
  onSubmit,
  className = '',
  disabled = false,
}: DynamicFormProps<TValues>) {
  const renderField = (field: FormFieldSchema<TValues>) => {
    const isHidden = typeof field.hidden === 'function' ? field.hidden(values) : Boolean(field.hidden);
    if (isHidden) return null;

    const isDisabled = disabled || (typeof field.disabled === 'function' ? field.disabled(values) : Boolean(field.disabled));
    const value = values[field.name];

    // Determine grid column span styling
    let spanClass = 'col-span-1';
    if (field.colSpan === 2) spanClass = 'col-span-1 md:col-span-2';
    if (field.colSpan === 'full') spanClass = 'col-span-full';

    return (
      <div key={field.name} className={`space-y-1.5 ${spanClass}`}>
        {field.type !== 'checkbox' && (
          <Label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            {field.icon && <span className="text-slate-500 shrink-0">{field.icon}</span>}
            <span>{field.label}</span>
            {field.required && <span className="text-red-500 font-bold ml-0.5">*</span>}
          </Label>
        )}

        {/* Custom Field Render */}
        {field.type === 'custom' && field.renderCustom && (
          field.renderCustom({
            value,
            onChange: (val) => onChange(field.name, val),
            values,
            field,
          })
        )}

        {/* Text Input */}
        {field.type === 'text' && (
          <Input
            value={value ?? ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            className="text-xs bg-white border-slate-200"
            required={field.required}
          />
        )}

        {/* Textarea */}
        {field.type === 'textarea' && (
          <textarea
            value={value ?? ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            rows={3}
            className="w-full rounded-md border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            required={field.required}
          />
        )}

        {/* Select Dropdown with SearchableSelect */}
        {field.type === 'select' && (
          <SearchableSelect
            options={(() => {
              const optionsList: SelectOption[] = typeof field.options === 'function'
                ? field.options(values)
                : field.options || [];
              return optionsList.map((opt) => ({
                value: opt.value,
                label: opt.label,
                disabled: opt.disabled,
              }));
            })()}
            value={value !== undefined && value !== null ? String(value) : undefined}
            onValueChange={(val) => onChange(field.name, val)}
            placeholder={field.placeholder || `Chọn ${field.label.toLowerCase()}...`}
            searchPlaceholder={`Tìm kiếm ${field.label.toLowerCase()}...`}
            disabled={isDisabled}
          />
        )}

        {/* Currency or Number Input using BusinessNumberInput */}
        {(field.type === 'currency' || field.type === 'number') && (
          <BusinessNumberInput
            id={`field-${field.name}`}
            label=""
            value={value !== undefined && value !== null ? String(value) : ''}
            onChange={(val) => onChange(field.name, val)}
            placeholder={field.placeholder}
            unitSuffix={field.unitSuffix || (field.type === 'currency' ? 'VNĐ' : 'người')}
            disabled={isDisabled}
            icon={field.icon}
          />
        )}

        {/* Checkbox */}
        {field.type === 'checkbox' && (
          <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1">
            <Checkbox
              id={`chk-${field.name}`}
              checked={Boolean(value)}
              onCheckedChange={(checked) => onChange(field.name, Boolean(checked))}
              disabled={isDisabled}
            />
            <Label htmlFor={`chk-${field.name}`} className="text-xs font-semibold cursor-pointer text-slate-800">
              {field.label}
            </Label>
          </div>
        )}

        {field.helperText && (
          <p className="text-[11px] text-slate-500 mt-0.5">{field.helperText}</p>
        )}
      </div>
    );
  };

  const content = (
    <div className={`space-y-6 ${className}`}>
      {schema.sections.map((section, idx) => (
        <div key={section.id || idx} className="space-y-3">
          {section.title && (
            <div className="border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                {section.icon && <span className="text-blue-600">{section.icon}</span>}
                <span>{section.title}</span>
              </h4>
              {section.description && (
                <p className="text-[11px] text-slate-500 mt-0.5">{section.description}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map(renderField)}
          </div>
        </div>
      ))}
    </div>
  );

  if (onSubmit || formId) {
    return (
      <form id={formId} onSubmit={onSubmit}>
        {content}
      </form>
    );
  }

  return content;
}
