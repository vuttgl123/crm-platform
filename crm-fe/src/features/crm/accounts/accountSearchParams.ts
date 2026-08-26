import {
  AccountType,
  AccountLifecycleStage,
  AccountOwnershipFilter,
  AccountEditorMode,
  AccountDetailTab,
  AccountUrlState,
} from './model/accountTypes';

const VALID_ACCOUNT_TYPES: AccountType[] = [
  'ORGANIZATION',
  'PERSON',
  'PARTNER',
  'RESELLER',
  'SUPPLIER',
];

const VALID_LIFECYCLE_STAGES: AccountLifecycleStage[] = [
  'PROSPECT',
  'QUALIFIED',
  'CUSTOMER',
  'CHURNED',
  'INACTIVE',
];

const VALID_OWNERSHIP: AccountOwnershipFilter[] = ['ALL', 'MINE', 'TEAM'];
const VALID_MODES: AccountEditorMode[] = ['create', 'edit', 'subsidiary'];
const VALID_TABS: AccountDetailTab[] = [
  'overview',
  'addresses',
  'channels',
  'relationships',
  'subsidiaries',
  'notes',
];
const VALID_PAGE_SIZES = [10, 20, 50, 100];

export function parseAccountSearchParams(searchParams: URLSearchParams): AccountUrlState {
  const q = searchParams.get('q')?.trim() || '';

  const rawAccountType = searchParams.get('accountType')?.toUpperCase();
  const accountType = (VALID_ACCOUNT_TYPES.includes(rawAccountType as any)
    ? rawAccountType
    : 'ALL') as AccountType | 'ALL';

  const rawLifecycle = searchParams.get('lifecycleStage')?.toUpperCase();
  const lifecycleStage = (VALID_LIFECYCLE_STAGES.includes(rawLifecycle as any)
    ? rawLifecycle
    : 'ALL') as AccountLifecycleStage | 'ALL';

  const rawOwnership = searchParams.get('ownership')?.toUpperCase();
  const ownership = (VALID_OWNERSHIP.includes(rawOwnership as any)
    ? rawOwnership
    : 'ALL') as AccountOwnershipFilter;

  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawSize = parseInt(searchParams.get('size') || '20', 10);
  const size = VALID_PAGE_SIZES.includes(rawSize) ? rawSize : 20;

  const rawAccount = searchParams.get('account')?.trim();
  const account = rawAccount ? rawAccount : undefined;

  const rawMode = searchParams.get('mode')?.toLowerCase();
  const mode = VALID_MODES.includes(rawMode as any)
    ? (rawMode as AccountEditorMode)
    : undefined;

  const rawParentId = searchParams.get('parentId')?.trim();
  const parentId = rawParentId ? rawParentId : undefined;

  const rawView = searchParams.get('view')?.toLowerCase();
  const viewMode = rawView === 'flat' ? 'flat' : 'tree';

  return {
    q,
    accountType,
    lifecycleStage,
    ownership,
    viewMode,
    page,
    size,
    account,
    mode,
    parentId,
  };
}

export function serializeAccountSearchParams(
  state: Partial<AccountUrlState>,
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

  if ('accountType' in state) {
    if (state.accountType && state.accountType !== 'ALL') {
      params.set('accountType', state.accountType);
    } else {
      params.delete('accountType');
    }
  }

  if ('lifecycleStage' in state) {
    if (state.lifecycleStage && state.lifecycleStage !== 'ALL') {
      params.set('lifecycleStage', state.lifecycleStage);
    } else {
      params.delete('lifecycleStage');
    }
  }

  if ('ownership' in state) {
    if (state.ownership && state.ownership !== 'ALL') {
      params.set('ownership', state.ownership.toLowerCase());
    } else {
      params.delete('ownership');
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

  if ('account' in state) {
    if (state.account) {
      params.set('account', state.account);
    } else {
      params.delete('account');
    }
  }

  if ('mode' in state) {
    if (state.mode) {
      params.set('mode', state.mode);
    } else {
      params.delete('mode');
    }
  }

  if ('viewMode' in state) {
    if (state.viewMode && state.viewMode === 'flat') {
      params.set('view', 'flat');
    } else {
      params.delete('view');
    }
  }

  if ('parentId' in state) {
    if (state.parentId) {
      params.set('parentId', state.parentId);
    } else {
      params.delete('parentId');
    }
  }

  return params;
}

export function parseAccountDetailTab(searchParams: URLSearchParams): AccountDetailTab {
  const rawTab = searchParams.get('tab')?.toLowerCase();
  return (VALID_TABS.includes(rawTab as any) ? rawTab : 'overview') as AccountDetailTab;
}
