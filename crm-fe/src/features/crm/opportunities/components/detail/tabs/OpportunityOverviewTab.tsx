import React from 'react';
import { Link } from 'react-router-dom';
import {
  OpportunityResponse,
  PipelineItem,
  LeadSourceItem,
  OpportunityLostReasonItem,
} from '../../../model/opportunityTypes';
import {
  renderOpportunityStatusBadge,
  renderOpportunityStageBadge,
} from '@/config/crmStatusConfig';
import { formatDateTime, formatDate } from '@/lib/formatters';
import { useOwnerResolver } from '../../../hooks/useOwnerResolver';
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  Users,
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Ban,
} from 'lucide-react';

interface OpportunityOverviewTabProps {
  opportunity: OpportunityResponse;
  pipelines: PipelineItem[];
  leadSources: LeadSourceItem[];
  lostReasons: OpportunityLostReasonItem[];
  campaigns: { id: string; name: string }[];
  accountName?: string;
  contactName?: string;
}

export const OpportunityOverviewTab: React.FC<OpportunityOverviewTabProps> = ({
  opportunity: opp,
  pipelines,
  leadSources,
  lostReasons,
  campaigns,
  accountName,
  contactName,
}) => {
  const { resolveOwner } = useOwnerResolver();
  const ownerInfo = resolveOwner(opp.owner);

  const currentPipeline = pipelines.find((p) => p.id === opp.pipelineId);
  const currentStage = currentPipeline?.stages?.find((s) => s.id === opp.currentStageId);
  const currentSource = leadSources.find((s) => s.id === opp.sourceId);
  const currentCampaign = campaigns.find((c) => c.id === opp.campaignId);
  const currentLostReason = lostReasons.find((r) => r.id === opp.lostReasonId);

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* 2-COLUMN METADATA GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SECTION 1: IDENTITY & CLASSIFICATION */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Identity & Classification</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status:</span>
              <span>{renderOpportunityStatusBadge(opp.status)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Opportunity Type:</span>
              <span className="font-semibold text-slate-800">
                {opp.opportunityType.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Opportunity Number:</span>
              <span className="font-mono font-semibold text-slate-800">
                {opp.opportunityNumber}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: CUSTOMER & STAKEHOLDERS */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Customer Organization & Contact</span>
          </div>

          <div className="space-y-2 pt-1">
            <div>
              <span className="text-slate-400 text-[10px] block">Account Organization</span>
              {opp.accountId ? (
                <Link
                  to={`/app/crm/accounts/${opp.accountId}`}
                  className="font-semibold text-xs text-blue-600 hover:underline inline-flex items-center gap-1 pt-0.5"
                >
                  <span>{accountName || `Account: ${opp.accountId}`}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : (
                <span className="text-slate-400 italic">No account assigned</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 text-[10px] block">Primary Stakeholder</span>
              {opp.primaryContactId ? (
                <Link
                  to={`/app/crm/contacts`}
                  className="font-medium text-xs text-blue-600 hover:underline inline-flex items-center gap-1 pt-0.5"
                >
                  <span>{contactName || `Contact: ${opp.primaryContactId}`}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : (
                <span className="text-slate-400 italic">No primary contact</span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: SALES PIPELINE & STAGE */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span>Sales Pipeline & Stage</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Pipeline:</span>
              <span className="font-semibold text-slate-800">
                {currentPipeline?.name || `Pipeline: ${opp.pipelineId.slice(0, 8)}…`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Current Stage:</span>
              <span>
                {renderOpportunityStageBadge(
                  currentStage?.name || `Stage: ${opp.currentStageId.slice(0, 6)}…`,
                  currentStage?.stageCategory
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Forecast Category:</span>
              <span className="font-mono font-semibold text-slate-800">
                {currentStage?.forecastCategory || 'PIPELINE'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Probability:</span>
              <span className="font-mono font-bold text-slate-900">
                {opp.probability}%
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: COMMERCIAL & MARKETING */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Commercial Value & Marketing</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Deal Value:</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {opp.amount?.amount !== undefined
                  ? `${opp.amount.amount.toLocaleString()} ${opp.amount.currencyCode}`
                  : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Lead Source:</span>
              <span className="font-semibold text-slate-800">
                {currentSource?.name || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Campaign:</span>
              <span className="font-semibold text-slate-800">
                {currentCampaign?.name || 'Not specified'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] block">Assigned Owner</span>
              <div className="flex items-center gap-1.5 pt-0.5 text-slate-800">
                {opp.owner ? (
                  <>
                    {ownerInfo.type === 'USER' ? (
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="font-medium">{ownerInfo.label}</span>
                  </>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: TIMING & PROGRESSION */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>Timing & Progression</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Expected Close Date:</span>
              <span className="font-mono font-semibold text-slate-800">
                {opp.expectedCloseDate ? formatDate(opp.expectedCloseDate) : 'Not scheduled'}
              </span>
            </div>

            {opp.actualCloseDate && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Actual Close Date:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatDate(opp.actualCloseDate)}
                </span>
              </div>
            )}

            <div>
              <span className="text-slate-400 text-[10px] block">Next Action / Milestone</span>
              <span className="text-slate-800 font-medium block pt-0.5">
                {opp.nextStep || 'No next step defined'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 6: OUTCOME DETAILS (Terminal Records) */}
        {opp.status !== 'OPEN' && (
          <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
              {opp.status === 'WON' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : opp.status === 'LOST' ? (
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <Ban className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span>Outcome & Closure Summary</span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Closure Status:</span>
                <span>{renderOpportunityStatusBadge(opp.status)}</span>
              </div>

              {opp.status === 'LOST' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Lost Reason:</span>
                    <span className="font-bold text-rose-700">
                      {currentLostReason?.name || (opp.lostReasonId ? `Reason: ${opp.lostReasonId}` : 'Unspecified')}
                    </span>
                  </div>

                  {opp.lostReasonNotes && (
                    <div>
                      <span className="text-slate-400 text-[10px] block">Lost Reason Notes</span>
                      <p className="text-slate-700 italic pt-0.5">{opp.lostReasonNotes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 7: DESCRIPTION */}
      {opp.description && (
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
            Opportunity Description & Requirements
          </span>
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
            {opp.description}
          </p>
        </div>
      )}

      {/* SECTION 8: AUDIT METADATA */}
      <div className="p-3 rounded-[4px] bg-slate-100/80 border border-slate-200 text-[11px] text-slate-500 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Created: {formatDateTime(opp.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Updated: {formatDateTime(opp.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};
