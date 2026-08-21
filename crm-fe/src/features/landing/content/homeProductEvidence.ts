export type EvidenceKind = 'real-screen' | 'illustrative-data';

export interface LandingProductAsset {
  id: string;
  src: string;
  mobileSrc?: string;
  width: number;
  height: number;
  altKey: string;
  captionKey: string;
  sourceRoute: string;
  evidenceKind: EvidenceKind;
}

export const homeProductAssets = {
  hero: {
    id: 'hero',
    src: '/landing/product/hero-opportunity-pipeline.webp',
    mobileSrc: '/landing/product/hero-opportunity-pipeline-mobile.webp',
    width: 1440,
    height: 960,
    altKey: 'landing.home.workflow.opportunityTitle',
    captionKey: 'landing.home.hero.visualCaption',
    sourceRoute: '/app/crm/opportunities',
    evidenceKind: 'illustrative-data',
  },
  lead: {
    id: 'lead',
    src: '/landing/product/lead-list.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.leadTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/crm/leads',
    evidenceKind: 'illustrative-data',
  },
  account: {
    id: 'account',
    src: '/landing/product/account-detail.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.accountTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/crm/accounts/:id',
    evidenceKind: 'illustrative-data',
  },
  opportunity: {
    id: 'opportunity',
    src: '/landing/product/opportunity-pipeline.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.opportunityTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/crm/opportunities',
    evidenceKind: 'illustrative-data',
  },
  quote: {
    id: 'quote',
    src: '/landing/product/quote-workspace.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.quoteTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/sales/quotes',
    evidenceKind: 'illustrative-data',
  },
  approval: {
    id: 'approval',
    src: '/landing/product/quote-approval.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.approvalTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/sales/quotes',
    evidenceKind: 'illustrative-data',
  },
  contract: {
    id: 'contract',
    src: '/landing/product/contract-list.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.contractTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/sales/contracts',
    evidenceKind: 'illustrative-data',
  },
} as const satisfies Record<string, LandingProductAsset>;

export type LandingProductAssetId = keyof typeof homeProductAssets;

export type HomeWorkflowStageId =
  | 'lead'
  | 'account'
  | 'opportunity'
  | 'quote'
  | 'approval'
  | 'contract';

export interface HomeWorkflowStage {
  id: HomeWorkflowStageId;
  labelKey: string;
  titleKey: string;
  descriptionKey: string;
  assetId: LandingProductAssetId;
}

export const homeWorkflowStages: readonly HomeWorkflowStage[] = [
  { id: 'lead', labelKey: 'landing.home.workflow.leadLabel', titleKey: 'landing.home.workflow.leadTitle', descriptionKey: 'landing.home.workflow.leadDescription', assetId: 'lead' },
  { id: 'account', labelKey: 'landing.home.workflow.accountLabel', titleKey: 'landing.home.workflow.accountTitle', descriptionKey: 'landing.home.workflow.accountDescription', assetId: 'account' },
  { id: 'opportunity', labelKey: 'landing.home.workflow.opportunityLabel', titleKey: 'landing.home.workflow.opportunityTitle', descriptionKey: 'landing.home.workflow.opportunityDescription', assetId: 'opportunity' },
  { id: 'quote', labelKey: 'landing.home.workflow.quoteLabel', titleKey: 'landing.home.workflow.quoteTitle', descriptionKey: 'landing.home.workflow.quoteDescription', assetId: 'quote' },
  { id: 'approval', labelKey: 'landing.home.workflow.approvalLabel', titleKey: 'landing.home.workflow.approvalTitle', descriptionKey: 'landing.home.workflow.approvalDescription', assetId: 'approval' },
  { id: 'contract', labelKey: 'landing.home.workflow.contractLabel', titleKey: 'landing.home.workflow.contractTitle', descriptionKey: 'landing.home.workflow.contractDescription', assetId: 'contract' },
];
