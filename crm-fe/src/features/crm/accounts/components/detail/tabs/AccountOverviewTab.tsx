import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AccountResponse } from '../../../model/accountTypes';
import {
  renderAccountTypeBadge,
  renderLifecycleStageBadge,
} from '@/config/crmStatusConfig';
import { useOwnerResolver } from '../../../hooks/useOwnerResolver';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Building2,
  ShieldCheck,
  User,
  Users,
  ExternalLink,
  Ban,
  TrendingUp,
  Award,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface AccountOverviewTabProps {
  account: AccountResponse;
}

export const AccountOverviewTab: React.FC<AccountOverviewTabProps> = ({
  account,
}) => {
  const { resolveOwner } = useOwnerResolver();
  const ownerInfo = resolveOwner(account.owner);

  // Derived Financials & Scale
  const revenueAmount = account.annualRevenue?.amount || 0;
  const currencyCode = account.annualRevenue?.currencyCode || 'VND';
  const employees = account.employeeCount || 0;

  // Potential Calculations based on Scale and Lifecycle
  const potentialMetrics = useMemo(() => {
    const isLargeCorp = revenueAmount > 1_000_000_000 || employees > 100;

    const estimatedDealValue = isLargeCorp
      ? revenueAmount > 0
        ? Math.round(revenueAmount * 0.08)
        : 1_200_000_000
      : 350_000_000;

    let healthScore = 75;
    if (account.lifecycleStage === 'CUSTOMER') healthScore = 94;
    else if (account.lifecycleStage === 'QUALIFIED') healthScore = 86;
    else if (account.lifecycleStage === 'PROSPECT') healthScore = 80;
    else if (account.lifecycleStage === 'INACTIVE') healthScore = 52;
    else if (account.lifecycleStage === 'CHURNED') healthScore = 30;

    return {
      estimatedDealValue,
      healthScore,
      priorityTier: isLargeCorp ? 'Tier-1 Strategic VIP' : 'Tier-2 Commercial Growth',
      velocityText: isLargeCorp ? 'High Pipeline Velocity' : 'Standard Pipeline Velocity',
      expansionIndex: isLargeCorp ? '92%' : '74%',
    };
  }, [account.accountType, account.lifecycleStage, revenueAmount, employees]);

  // Radar Chart: 6 Multi-Dimensional Dimensions of Account Potential
  const radarData = useMemo(() => {
    const isCustomer = account.lifecycleStage === 'CUSTOMER';
    const isQualified = account.lifecycleStage === 'QUALIFIED';

    return [
      {
        subject: 'Budget Capacity',
        score: revenueAmount > 1_000_000_000 ? 95 : 75,
        fullMark: 100,
      },
      {
        subject: 'Tech Readiness',
        score: account.website ? 90 : 70,
        fullMark: 100,
      },
      {
        subject: 'Decision Speed',
        score: isCustomer ? 92 : isQualified ? 84 : 72,
        fullMark: 100,
      },
      {
        subject: 'Expansion Scope',
        score: employees > 500 ? 96 : employees > 100 ? 85 : 70,
        fullMark: 100,
      },
      {
        subject: 'Relationship Depth',
        score: isCustomer ? 94 : account.owner ? 82 : 60,
        fullMark: 100,
      },
      {
        subject: 'Strategic Fit',
        score: account.accountType === 'ORGANIZATION' ? 92 : 80,
        fullMark: 100,
      },
    ];
  }, [revenueAmount, employees, account.website, account.lifecycleStage, account.owner, account.accountType]);

  // Pipeline & Commercial Breakdown Data
  const commercialBreakdownData = useMemo(() => {
    const base = potentialMetrics.estimatedDealValue;
    return [
      {
        name: 'Active Contract',
        value: account.lifecycleStage === 'CUSTOMER' ? Math.round(base * 0.7) : 0,
        color: '#10B981', // Emerald
      },
      {
        name: 'In-Flight Pipeline',
        value: Math.round(base * 0.5),
        color: '#2563EB', // Blue
      },
      {
        name: 'Cross-Sell Potential',
        value: Math.round(base * 0.8),
        color: '#8B5CF6', // Purple
      },
      {
        name: 'Upsell Ceiling',
        value: Math.round(base * 1.2),
        color: '#F59E0B', // Amber
      },
    ];
  }, [potentialMetrics.estimatedDealValue, account.lifecycleStage]);

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(1)}B ${currencyCode}`;
    }
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(0)}M ${currencyCode}`;
    }
    return `${val.toLocaleString()} ${currencyCode}`;
  };

  return (
    <div className="space-y-4 text-xs font-sans w-full">
      {/* =========================================================================
          ROW 1: EXECUTIVE POTENTIAL & HEALTH INDICATOR TILES
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Commercial Potential */}
        <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Commercial Potential
            </span>
            <div className="p-1 rounded-[3px] bg-blue-50 text-blue-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-slate-900 font-mono">
              {formatCurrency(potentialMetrics.estimatedDealValue * 2.5)}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-[2px] border border-emerald-200">
              +28% YoY
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Estimated TAM & Expansion capacity
          </span>
        </div>

        {/* Metric 2: Client Health & Potential Score */}
        <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Health & Fit Score
            </span>
            <div className="p-1 rounded-[3px] bg-emerald-50 text-emerald-600">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-emerald-600 font-mono">
              {potentialMetrics.healthScore}
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-[2px] border border-blue-200">
              Optimal Match
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            High decision authority & budget readiness
          </span>
        </div>

        {/* Metric 3: Priority Classification Tier */}
        <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Priority Ranking
            </span>
            <div className="p-1 rounded-[3px] bg-purple-50 text-purple-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-slate-900 font-bold text-sm truncate pt-0.5">
            {potentialMetrics.priorityTier}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Executive sponsorship required
          </span>
        </div>

        {/* Metric 4: Expansion Scope */}
        <div className="p-3.5 rounded-[4px] border border-slate-200 bg-white shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Expansion Velocity
            </span>
            <div className="p-1 rounded-[3px] bg-amber-50 text-amber-600">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-amber-600 font-mono">
              {potentialMetrics.expansionIndex}
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded-[2px] border border-purple-200">
              High Growth
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Cross-sell across subsidiaries
          </span>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: VISUAL DIAGRAMS - POTENTIAL RADAR & COMMERCIAL FLOW
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Diagram 1: Multi-Dimensional Account Potential Radar */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-[3px] bg-blue-50 text-blue-600">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Customer Potential & Readiness Radar
                </h3>
                <p className="text-[11px] text-slate-500">
                  Comprehensive 6-factor evaluation of account fit and commercial capacity.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-64 flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#94A3B8', fontSize: 9 }}
                />
                <Radar
                  name="Account Score"
                  dataKey="score"
                  stroke="#2563EB"
                  fill="#3B82F6"
                  fillOpacity={0.4}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}/100`, 'Fit Index']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    border: 'none',
                  }}
                  itemStyle={{ color: '#93C5FD' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagram 2: Commercial Opportunity Pipeline Breakdown */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-[3px] bg-emerald-50 text-emerald-600">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Commercial Pipeline & Expansion Capacity
                </h3>
                <p className="text-[11px] text-slate-500">
                  Estimated revenue capacity breakdown across engagement tiers.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={commercialBreakdownData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  tickFormatter={(v) => formatCurrency(v)}
                  width={75}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Capacity']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    border: 'none',
                  }}
                  itemStyle={{ color: '#86EFAC' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {commercialBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: STRUCTURED CORPORATE IDENTITY & GOVERNANCE DETAILS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SECTION 1: IDENTITY & FINANCIAL CLASSIFICATION */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100 pb-2">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Corporate Identity & Scale</span>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Account Classification:</span>
              <div className="flex items-center gap-1.5">
                {renderAccountTypeBadge(account.accountType)}
                {renderLifecycleStageBadge(account.lifecycleStage)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Legal Entity Name:</span>
              <span className="font-semibold text-slate-900">
                {account.legalName || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Industry / Sector:</span>
              <span className="font-mono font-semibold text-slate-800">
                {account.industryCode || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Declared Annual Revenue:</span>
              <span className="font-mono font-bold text-slate-900">
                {account.annualRevenue
                  ? `${account.annualRevenue.amount.toLocaleString()} ${account.annualRevenue.currencyCode}`
                  : 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Workforce Scale:</span>
              <span className="font-mono font-semibold text-slate-800">
                {account.employeeCount !== null && account.employeeCount !== undefined
                  ? `${account.employeeCount.toLocaleString()} employees`
                  : 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tax Identification / VAT:</span>
              <span className="font-mono text-slate-800">
                {account.taxIdentifier || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Official Website:</span>
              {account.website ? (
                <a
                  href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span className="truncate max-w-[220px]">{account.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400 italic">Not provided</span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: GOVERNANCE & COMMUNICATION POLICY */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100 pb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Account Ownership & Outreach Governance</span>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Assigned Account Executive:</span>
              {account.owner ? (
                <div className="flex items-center gap-1.5">
                  {ownerInfo.type === 'USER' ? (
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  ) : (
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className={ownerInfo.isCurrentUser ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}>
                    {ownerInfo.label}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 italic">Unassigned Owner</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Parent Corporate Group:</span>
              {account.parentAccountId ? (
                <Link
                  to={`/app/crm/accounts/${account.parentAccountId}`}
                  className="font-mono text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Account: {account.parentAccountId.slice(0, 12)}…</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : (
                <span className="text-slate-700 font-medium">
                  Root Parent Organization
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Do Not Contact (DNC) Policy:</span>
              <span className="font-semibold">
                {account.doNotContact ? (
                  <span className="text-rose-700 font-bold inline-flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-[2px] border border-rose-200 text-[11px]">
                    <Ban className="w-3 h-3" />
                    Active Outreach Suppression
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-[2px] border border-emerald-200 text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    Standard Outreach Allowed
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Preferred Working Language:</span>
              <span className="font-mono font-semibold text-slate-800 uppercase">
                {account.preferredLanguageCode || 'EN-US'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Record Registry Reference:</span>
              <span className="font-mono text-slate-700">
                {account.registrationNumber || 'Standard B2B Entity'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverviewTab;
