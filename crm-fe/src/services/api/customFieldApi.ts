import { apiFetch } from './apiClient';

export type CustomFieldDataType =
  | 'TEXT'
  | 'LONG_TEXT'
  | 'INTEGER'
  | 'DECIMAL'
  | 'BOOLEAN'
  | 'DATE'
  | 'DATETIME'
  | 'EMAIL'
  | 'PHONE'
  | 'URL'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'JSON';

export interface CustomFieldDefinitionItem {
  id: string;
  entityType: string;
  fieldKey: string;
  fieldLabel: string;
  dataType: CustomFieldDataType;
  required: boolean;
  defaultValue?: string;
  optionsJson?: string;
  displayOrder: number;
  active: boolean;
  version: number;
}

export interface CustomFieldValueItem {
  fieldId: string;
  fieldKey: string;
  fieldLabel: string;
  dataType: CustomFieldDataType;
  valueJson: string;
  searchText?: string;
  updatedAt: string;
  updatedBy?: string;
  version: number;
}

export interface EntityCustomFieldsResponse {
  entityType: string;
  entityId: string;
  values: CustomFieldValueItem[];
}

export const customFieldApi = {
  createDefinition: async (data: {
    entityType: string;
    fieldKey: string;
    fieldLabel: string;
    dataType: CustomFieldDataType;
    required?: boolean;
    defaultValue?: string;
    optionsJson?: string;
    displayOrder?: number;
  }): Promise<CustomFieldDefinitionItem> => {
    return apiFetch<CustomFieldDefinitionItem>('/crm/custom-fields/definitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getDefinition: async (id: string): Promise<CustomFieldDefinitionItem> => {
    return apiFetch<CustomFieldDefinitionItem>(`/crm/custom-fields/definitions/${id}`);
  },

  listDefinitions: async (params?: { entityType?: string; active?: boolean }): Promise<CustomFieldDefinitionItem[]> => {
    const query = new URLSearchParams();
    if (params?.entityType) query.set('entityType', params.entityType);
    if (params?.active !== undefined) query.set('active', String(params.active));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<CustomFieldDefinitionItem[]>(`/crm/custom-fields/definitions${qs}`);
  },

  updateDefinition: async (
    id: string,
    data: {
      version: number;
      fieldLabel: string;
      required: boolean;
      defaultValue?: string;
      optionsJson?: string;
      displayOrder: number;
      active: boolean;
    }
  ): Promise<CustomFieldDefinitionItem> => {
    return apiFetch<CustomFieldDefinitionItem>(`/crm/custom-fields/definitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getEntityValues: async (entityType: string, entityId: string): Promise<EntityCustomFieldsResponse> => {
    return apiFetch<EntityCustomFieldsResponse>(`/crm/custom-fields/values/${entityType}/${entityId}`);
  },

  setEntityValues: async (
    entityType: string,
    entityId: string,
    values: { fieldId: string; valueJson: string }[]
  ): Promise<EntityCustomFieldsResponse> => {
    return apiFetch<EntityCustomFieldsResponse>(`/crm/custom-fields/values/${entityType}/${entityId}`, {
      method: 'PUT',
      body: JSON.stringify({ values }),
    });
  },
};
