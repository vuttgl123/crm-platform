import type { ComponentType } from 'react';
import { MockPipelineBoard } from './MockPipelineBoard';
import { MockLeadTable } from './MockLeadTable';
import { MockAccountRecord } from './MockAccountRecord';
import { MockQuoteEditor } from './MockQuoteEditor';
import { MockApprovalFlow } from './MockApprovalFlow';
import { MockContractList } from './MockContractList';

export type MockScreenId =
  | 'pipeline'
  | 'leads'
  | 'account'
  | 'quote'
  | 'approval'
  | 'contract';

/**
 * Typed as a total Record, so adding a MockScreenId without adding its
 * component is a compile error rather than a blank panel in the browser.
 * With the repository's no-test rule in force, this is the one genuine
 * compile-time test available for the mockup set.
 */
export const mockScreens: Record<MockScreenId, ComponentType> = {
  pipeline: MockPipelineBoard,
  leads: MockLeadTable,
  account: MockAccountRecord,
  quote: MockQuoteEditor,
  approval: MockApprovalFlow,
  contract: MockContractList,
};

export { MockWindow } from './MockWindow';
export { HeroCockpitPreview } from './HeroCockpitPreview';
export {
  MockPipelineBoard,
  MockLeadTable,
  MockAccountRecord,
  MockQuoteEditor,
  MockApprovalFlow,
  MockContractList,
};

