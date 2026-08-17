import { apiFetch } from './apiClient';

export type PipelineType = 'SALES' | 'RENEWAL' | 'PARTNERSHIP' | 'CUSTOM';
export type StageCategory = 'OPEN' | 'WON' | 'LOST';
export type ForecastCategory = 'OMITTED' | 'PIPELINE' | 'BEST_CASE' | 'COMMIT' | 'CLOSED';

export interface PipelineStageItem {
  id: string;
  pipelineId: string;
  stageCode: string;
  name: string;
  displayOrder: number;
  defaultProbability: number;
  stageCategory: StageCategory;
  forecastCategory: ForecastCategory;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  version: number;
}

export interface PipelineItem {
  id: string;
  pipelineCode: string;
  name: string;
  pipelineType: PipelineType;
  defaultPipeline: boolean;
  active: boolean;
  stages?: PipelineStageItem[];
  stageCount?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  version: number;
}

export const pipelineApi = {
  createPipeline: async (data: {
    pipelineCode: string;
    name: string;
    pipelineType?: PipelineType;
    defaultPipeline?: boolean;
  }): Promise<PipelineItem> => {
    return apiFetch<PipelineItem>('/crm/pipelines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPipeline: async (id: string): Promise<PipelineItem> => {
    return apiFetch<PipelineItem>(`/crm/pipelines/${id}`);
  },

  listPipelines: async (): Promise<PipelineItem[]> => {
    return apiFetch<PipelineItem[]>('/crm/pipelines');
  },

  updatePipeline: async (
    id: string,
    data: {
      version: number;
      name: string;
      pipelineType?: PipelineType;
      defaultPipeline?: boolean;
      active?: boolean;
    }
  ): Promise<PipelineItem> => {
    return apiFetch<PipelineItem>(`/crm/pipelines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  addStage: async (
    pipelineId: string,
    data: {
      stageCode: string;
      name: string;
      displayOrder?: number;
      defaultProbability?: number;
      stageCategory?: StageCategory;
      forecastCategory?: ForecastCategory;
    }
  ): Promise<PipelineStageItem> => {
    return apiFetch<PipelineStageItem>(`/crm/pipelines/${pipelineId}/stages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStage: async (
    pipelineId: string,
    stageId: string,
    data: {
      version: number;
      name: string;
      displayOrder?: number;
      defaultProbability?: number;
      stageCategory?: StageCategory;
      forecastCategory?: ForecastCategory;
      active?: boolean;
    }
  ): Promise<PipelineStageItem> => {
    return apiFetch<PipelineStageItem>(`/crm/pipelines/${pipelineId}/stages/${stageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteStage: async (pipelineId: string, stageId: string): Promise<void> => {
    return apiFetch<void>(`/crm/pipelines/${pipelineId}/stages/${stageId}`, {
      method: 'DELETE',
    });
  },
};
