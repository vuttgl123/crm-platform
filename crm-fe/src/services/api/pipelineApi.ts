import { apiFetch } from './apiClient';
import type { ForecastCategory } from './forecastApi';

export type { ForecastCategory };
export type PipelineType = 'SALES' | 'RENEWAL' | 'PARTNERSHIP' | 'CUSTOM';
export type StageCategory = 'OPEN' | 'WON' | 'LOST';

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
  /**
   * GET /api/pipelines - List all sales pipelines
   */
  listPipelines: async (): Promise<PipelineItem[]> => {
    return apiFetch<PipelineItem[]>('/pipelines');
  },

  /**
   * GET /api/pipelines/default - Get default sales pipeline
   */
  getDefaultPipeline: async (): Promise<PipelineItem> => {
    return apiFetch<PipelineItem>('/pipelines/default');
  },

  /**
   * GET /api/pipelines/{id} - Get pipeline details with ordered stages
   */
  getPipeline: async (id: string): Promise<PipelineItem> => {
    return apiFetch<PipelineItem>(`/pipelines/${id}`);
  },

  /**
   * POST /api/pipelines - Create new sales pipeline
   */
  createPipeline: async (data: {
    pipelineCode: string;
    name: string;
    pipelineType?: PipelineType;
    defaultPipeline?: boolean;
  }): Promise<PipelineItem> => {
    return apiFetch<PipelineItem>('/pipelines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /api/pipelines/{id} - Update pipeline info
   */
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
    return apiFetch<PipelineItem>(`/pipelines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /api/pipelines/{id} - Delete custom pipeline
   */
  deletePipeline: async (id: string): Promise<void> => {
    return apiFetch<void>(`/pipelines/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * POST /api/pipelines/{id}/stages - Add new stage
   */
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
    return apiFetch<PipelineStageItem>(`/pipelines/${pipelineId}/stages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /api/pipelines/{id}/stages/{stageId} - Update stage
   */
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
    return apiFetch<PipelineStageItem>(`/pipelines/${pipelineId}/stages/${stageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /api/pipelines/{id}/stages/{stageId} - Delete stage
   */
  deleteStage: async (pipelineId: string, stageId: string): Promise<void> => {
    return apiFetch<void>(`/pipelines/${pipelineId}/stages/${stageId}`, {
      method: 'DELETE',
    });
  },

  /**
   * PUT /api/pipelines/{id}/stages/reorder - Reorder stages
   */
  reorderStages: async (pipelineId: string, orderedStageIds: string[]): Promise<void> => {
    return apiFetch<void>(`/pipelines/${pipelineId}/stages/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ orderedStageIds }),
    });
  },
};
