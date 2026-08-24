import {
  LeadRating,
  LeadUrlState,
  LeadOwnershipFilter,
  LeadConversionFilter,
  LeadEditorMode,
} from './model/leadTypes';

const VALID_RATINGS: LeadRating[] = ['HOT', 'WARM', 'COLD'];
const VALID_OWNERSHIP: LeadOwnershipFilter[] = ['ALL', 'MINE', 'TEAM'];
const VALID_CONVERSION: LeadConversionFilter[] = ['ALL', 'ACTIVE', 'CONVERTED'];
const VALID_MODES: LeadEditorMode[] = ['view', 'create', 'edit'];
const VALID_PAGE_SIZES = [10, 20, 50, 100];

export function parseLeadSearchParams(searchParams: URLSearchParams): LeadUrlState {
  const q = searchParams.get('q')?.trim() || '';
  const statusId = searchParams.get('statusId')?.trim() || '';
  const sourceId = searchParams.get('sourceId')?.trim() || '';

  const rawRating = searchParams.get('rating')?.toUpperCase();
  const rating = (VALID_RATINGS.includes(rawRating as any) ? rawRating : 'ALL') as
    | LeadRating
    | 'ALL';

  const rawOwnership = searchParams.get('ownership')?.toUpperCase();
  const ownership = (VALID_OWNERSHIP.includes(rawOwnership as any)
    ? rawOwnership
    : 'ALL') as LeadOwnershipFilter;

  const rawConversion = searchParams.get('conversion')?.toUpperCase();
  const conversion = (VALID_CONVERSION.includes(rawConversion as any)
    ? rawConversion
    : 'ALL') as LeadConversionFilter;

  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawSize = parseInt(searchParams.get('size') || '20', 10);
  const size = VALID_PAGE_SIZES.includes(rawSize) ? rawSize : 20;

  const rawLead = searchParams.get('lead')?.trim();
  const lead = rawLead ? rawLead : undefined;

  const rawMode = searchParams.get('mode')?.toLowerCase();
  const mode = VALID_MODES.includes(rawMode as any)
    ? (rawMode as LeadEditorMode)
    : undefined;

  return {
    q,
    statusId,
    sourceId,
    rating,
    ownership,
    conversion,
    page,
    size,
    lead,
    mode,
  };
}

export function serializeLeadSearchParams(
  state: Partial<LeadUrlState>,
  currentParams?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(currentParams?.toString() || '');

  if ('q' in state) {
    if (state.q && state.q.trim()) {
      params.set('q', state.q.trim());
    } else {
      params.delete('q');
    }
  }

  if ('statusId' in state) {
    if (state.statusId && state.statusId !== 'ALL') {
      params.set('statusId', state.statusId);
    } else {
      params.delete('statusId');
    }
  }

  if ('sourceId' in state) {
    if (state.sourceId && state.sourceId !== 'ALL') {
      params.set('sourceId', state.sourceId);
    } else {
      params.delete('sourceId');
    }
  }

  if ('rating' in state) {
    if (state.rating && state.rating !== 'ALL') {
      params.set('rating', state.rating);
    } else {
      params.delete('rating');
    }
  }

  if ('ownership' in state) {
    if (state.ownership && state.ownership !== 'ALL') {
      params.set('ownership', state.ownership.toLowerCase());
    } else {
      params.delete('ownership');
    }
  }

  if ('conversion' in state) {
    if (state.conversion && state.conversion !== 'ALL') {
      params.set('conversion', state.conversion.toLowerCase());
    } else {
      params.delete('conversion');
    }
  }

  if ('page' in state) {
    if (state.page && state.page > 1) {
      params.set('page', state.page.toString());
    } else {
      params.delete('page');
    }
  }

  if ('size' in state) {
    if (state.size && state.size !== 20) {
      params.set('size', state.size.toString());
    } else {
      params.delete('size');
    }
  }

  if ('lead' in state) {
    if (state.lead) {
      params.set('lead', state.lead);
    } else {
      params.delete('lead');
    }
  }

  if ('mode' in state) {
    if (state.mode) {
      params.set('mode', state.mode);
    } else {
      params.delete('mode');
    }
  }

  return params;
}
