import {
  ContactLifecycleStage,
  ContactUrlState,
  ContactOwnershipFilter,
  ContactEditorMode,
} from './model/contactTypes';

const VALID_STAGES: ContactLifecycleStage[] = [
  'PROSPECT',
  'QUALIFIED',
  'CUSTOMER',
  'CHURNED',
  'INACTIVE',
];

const VALID_OWNERSHIP: ContactOwnershipFilter[] = ['ALL', 'MINE', 'TEAM'];
const VALID_MODES: ContactEditorMode[] = ['view', 'create', 'edit'];
const VALID_PAGE_SIZES = [10, 20, 50, 100];

export function parseContactSearchParams(searchParams: URLSearchParams): ContactUrlState {
  const q = searchParams.get('q')?.trim() || '';

  const rawStage = searchParams.get('stage')?.toUpperCase();
  const stage = (VALID_STAGES.includes(rawStage as any) ? rawStage : 'ALL') as
    | ContactLifecycleStage
    | 'ALL';

  const rawOwnership = searchParams.get('ownership')?.toUpperCase();
  const ownership = (VALID_OWNERSHIP.includes(rawOwnership as any)
    ? rawOwnership
    : 'ALL') as ContactOwnershipFilter;

  const rawAccount = searchParams.get('account')?.trim();
  const account = rawAccount ? rawAccount : undefined;

  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawSize = parseInt(searchParams.get('size') || '20', 10);
  const size = VALID_PAGE_SIZES.includes(rawSize) ? rawSize : 20;

  const rawContact = searchParams.get('contact')?.trim();
  const contact = rawContact ? rawContact : undefined;

  const rawMode = searchParams.get('mode')?.toLowerCase();
  const mode = VALID_MODES.includes(rawMode as any)
    ? (rawMode as ContactEditorMode)
    : undefined;

  return {
    q,
    stage,
    ownership,
    account,
    page,
    size,
    contact,
    mode,
  };
}

export function serializeContactSearchParams(
  state: Partial<ContactUrlState>,
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

  if ('stage' in state) {
    if (state.stage && state.stage !== 'ALL') {
      params.set('stage', state.stage);
    } else {
      params.delete('stage');
    }
  }

  if ('ownership' in state) {
    if (state.ownership && state.ownership !== 'ALL') {
      params.set('ownership', state.ownership.toLowerCase());
    } else {
      params.delete('ownership');
    }
  }

  if ('account' in state) {
    if (state.account) {
      params.set('account', state.account);
    } else {
      params.delete('account');
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

  if ('contact' in state) {
    if (state.contact) {
      params.set('contact', state.contact);
    } else {
      params.delete('contact');
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
