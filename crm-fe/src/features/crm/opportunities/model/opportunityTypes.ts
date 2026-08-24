import {
  OpportunityStatus,
  OpportunityType,
  OpportunityOwnerType,
  OpportunityOwner,
  OpportunityAmount,
  OpportunitySummaryResponse,
  OpportunityResponse,
  OpportunityTransitionAction,
  OpportunityTransitionRequest,
  OpportunityStageHistoryEntry,
  OpportunityStageHistoryEventType,
  OpportunityStakeholderRole,
  OpportunityStakeholderInfluence,
  OpportunityStakeholderResponse,
  CreateOpportunityStakeholderRequest,
  UpdateOpportunityStakeholderRequest,
  OpportunityNoteResponse,
  CreateOpportunityNoteRequest,
  UpdateOpportunityNoteRequest,
  NoteVisibility,
  OpportunitySearchParams,
} from '@/services/api/opportunityApi';
import { PipelineItem, PipelineStageItem } from '@/services/api/pipelineApi';
import { LeadSourceItem, OpportunityLostReasonItem } from '@/services/api/salesConfigApi';

export type OpportunityViewMode = 'list' | 'pipeline';

export type {
  OpportunityStatus,
  OpportunityType,
  OpportunityOwnerType,
  OpportunityOwner,
  OpportunityAmount,
  OpportunitySummaryResponse,
  OpportunityResponse,
  OpportunityTransitionAction,
  OpportunityTransitionRequest,
  OpportunityStageHistoryEntry,
  OpportunityStageHistoryEventType,
  OpportunityStakeholderRole,
  OpportunityStakeholderInfluence,
  OpportunityStakeholderResponse,
  CreateOpportunityStakeholderRequest,
  UpdateOpportunityStakeholderRequest,
  OpportunityNoteResponse,
  CreateOpportunityNoteRequest,
  UpdateOpportunityNoteRequest,
  NoteVisibility,
  OpportunitySearchParams,
  PipelineItem,
  PipelineStageItem,
  LeadSourceItem,
  OpportunityLostReasonItem,
};

export interface OpportunityFormValues {
  name: string;
  accountId: string;
  pipelineId: string;
  currentStageId: string;
  owner: OpportunityOwner | null;
  sourceId: string | null;
  primaryContactId: string | null;
  opportunityType: OpportunityType;
  amount: OpportunityAmount;
  probability: number;
  expectedCloseDate: string | null;
  nextStep: string | null;
  description: string | null;
  campaignId: string | null;
}

export type OpportunityEditorMode = 'create' | 'edit';
