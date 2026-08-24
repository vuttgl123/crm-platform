import React from 'react';
import { Link } from 'react-router-dom';
import { AccountResponse } from '../../../model/accountTypes';
import {
  renderAccountTypeBadge,
  renderLifecycleStageBadge,
} from '@/config/crmStatusConfig';
import { formatDateTime } from '@/lib/formatters';
import { useOwnerResolver } from '../../../hooks/useOwnerResolver';
import {
  Building2,
  DollarSign,
  Globe,
  ShieldCheck,
  User,
  Users,
  Clock,
  ExternalLink,
  Ban,
} from 'lucide-react';

interface AccountOverviewTabProps {
  account: AccountResponse;
}

export const AccountOverviewTab: React.FC<AccountOverviewTabProps> = ({
  account,
}) => {
  const { resolveOwner } = useOwnerResolver();
  const ownerInfo = resolveOwner(account.owner);

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* 2-COLUMN METADATA GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SECTION 1: IDENTITY & CLASSIFICATION */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Identity & Classification</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Account Type:</span>
              <span>{renderAccountTypeBadge(account.accountType)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Lifecycle Stage:</span>
              <span>{renderLifecycleStageBadge(account.lifecycleStage)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Legal Name:</span>
              <span className="font-semibold text-slate-800">
                {account.legalName || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Industry / Sector:</span>
              <span className="font-mono font-semibold text-slate-800">
                {account.industryCode || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: OWNERSHIP & HIERARCHY */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ownership & Hierarchy</span>
          </div>

          <div className="space-y-2 pt-1">
            <div>
              <span className="text-slate-400 text-[10px] block">Assigned Owner</span>
              {account.owner ? (
                <div className="flex items-center gap-1.5 pt-0.5">
                  {ownerInfo.type === 'USER' ? (
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  ) : (
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className={ownerInfo.isCurrentUser ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}>
                      {ownerInfo.label}
                    </span>
                    {ownerInfo.subLabel && (
                      <span className="text-[10px] text-slate-400">
                        {ownerInfo.subLabel}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 italic">Unassigned</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 text-[10px] block">Parent Organization</span>
              {account.parentAccountId ? (
                <Link
                  to={`/app/crm/accounts/${account.parentAccountId}`}
                  className="font-mono text-blue-600 hover:underline inline-flex items-center gap-1 pt-0.5"
                >
                  <span>Account: {account.parentAccountId}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : (
                <span className="text-slate-600 font-medium pt-0.5 block">
                  Root Organization (No parent)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: COMMERCIAL & FINANCIAL */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Commercial & Financial</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Annual Revenue:</span>
              <span className="font-mono font-bold text-slate-900">
                {account.annualRevenue
                  ? `${account.annualRevenue.amount.toLocaleString()} ${account.annualRevenue.currencyCode}`
                  : 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Employee Count:</span>
              <span className="font-mono font-semibold text-slate-800">
                {account.employeeCount !== null && account.employeeCount !== undefined
                  ? `${account.employeeCount} employees`
                  : 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tax ID / VAT:</span>
              <span className="font-mono text-slate-800">
                {account.taxIdentifier || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Registration Number:</span>
              <span className="font-mono text-slate-800">
                {account.registrationNumber || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Website:</span>
              {account.website ? (
                <a
                  href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span className="truncate max-w-[200px]">{account.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not provided</span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: PREFERENCES & OUTREACH */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <Globe className="w-3.5 h-3.5 text-purple-600" />
            <span>Preferences & Outreach Policy</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Do Not Contact (DNC):</span>
              <span className="font-semibold">
                {account.doNotContact ? (
                  <span className="text-rose-700 font-bold inline-flex items-center gap-1">
                    <Ban className="w-3 h-3" />
                    Active Outreach Suppression
                  </span>
                ) : (
                  <span className="text-emerald-700">Standard Outreach Allowed</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Preferred Language:</span>
              <span className="font-mono font-semibold text-slate-800">
                {account.preferredLanguageCode || 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: DESCRIPTION */}
      {account.description && (
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
            Account Description & Commercial Notes
          </span>
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
            {account.description}
          </p>
        </div>
      )}

      {/* SECTION 6: AUDIT METADATA */}
      <div className="p-3 rounded-[4px] bg-slate-100/80 border border-slate-200 text-[11px] text-slate-500 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Created: {formatDateTime(account.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Updated: {formatDateTime(account.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};
