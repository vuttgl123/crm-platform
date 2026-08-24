import { OpportunityStatus, OpportunityType, OpportunityOwnerType, OpportunityViewMode } from './opportunityTypes';

export interface OpportunityParsedSearchParams {
  view: OpportunityViewMode;
  q: string;
  accountId?: string;
  pipelineId?: string;
  stageId?: string;
  status?: OpportunityStatus;
  opportunityType?: OpportunityType;
  ownerType?: OpportunityOwnerType;
  ownerId?: string;
  page: number; // 0-indexed for backend, parsed from 1-indexed URL
  size: number;
}

export function parseOpportunitySearchParams(searchParams: URLSearchParams): OpportunityParsedSearchParams {
  const viewRaw = searchParams.get('view');
  const view: OpportunityViewMode = viewRaw === 'pipeline' ? 'pipeline' : 'list';

  const q = searchParams.get('q') || '';
  const accountId = searchParams.get('accountId') || undefined;
  const pipelineId = searchParams.get('pipelineId') || undefined;
  const stageId = searchParams.get('stageId') || undefined;

  const statusRaw = searchParams.get('status');
  const status: OpportunityStatus | undefined =
    statusRaw && ['OPEN', 'WON', 'LOST', 'CANCELLED'].includes(statusRaw)
      ? (statusRaw as OpportunityStatus)
      : undefined;

  const typeRaw = searchParams.get('type') || searchParams.get('opportunityType');
  const opportunityType: OpportunityType | undefined =
    typeRaw && ['NEW_BUSINESS', 'UPSELL', 'CROSS_SELL', 'RENEWAL', 'PARTNERSHIP', 'OTHER'].includes(typeRaw)
      ? (typeRaw as OpportunityType)
      : undefined;

  const ownerTypeRaw = searchParams.get('ownerType');
  const ownerType: OpportunityOwnerType | undefined =
    ownerTypeRaw && ['USER', 'TEAM'].includes(ownerTypeRaw)
      ? (ownerTypeRaw as OpportunityOwnerType)
      : undefined;

  const ownerId = searchParams.get('ownerId') || undefined;

  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isFinite(urlPage) && urlPage > 0 ? urlPage - 1 : 0;

  const urlSize = parseInt(searchParams.get('size') || '20', 10);
  const size = [20, 50, 100].includes(urlSize) ? urlSize : 20;

  return {
    view,
    q,
    accountId,
    pipelineId,
    stageId,
    status,
    opportunityType,
    ownerType: ownerType && ownerId ? ownerType : undefined,
    ownerId: ownerType && ownerId ? ownerId : undefined,
    page,
    size,
  };
}

export function serializeOpportunitySearchParams(params: Partial<OpportunityParsedSearchParams>): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.view && params.view !== 'list') {
    searchParams.set('view', params.view);
  }

  if (params.q?.trim()) {
    searchParams.set('q', params.q.trim());
  }

  if (params.accountId) {
    searchParams.set('accountId', params.accountId);
  }

  if (params.pipelineId) {
    searchParams.set('pipelineId', params.pipelineId);
  }

  if (params.stageId && params.view !== 'pipeline') {
    searchParams.set('stageId', params.stageId);
  }

  if (params.status && params.view !== 'pipeline') {
    searchParams.set('status', params.status);
  }

  if (params.opportunityType) {
    searchParams.set('type', params.opportunityType);
  }

  if (params.ownerType && params.ownerId) {
    searchParams.set('ownerType', params.ownerType);
    searchParams.set('ownerId', params.ownerId);
  }

  if (params.view !== 'pipeline') {
    const displayPage = (params.page ?? 0) + 1;
    if (displayPage > 1) {
      searchParams.set('page', displayPage.toString());
    }

    if (params.size && params.size !== 20) {
      searchParams.set('size', params.size.toString());
    }
  }

  return searchParams;
}
