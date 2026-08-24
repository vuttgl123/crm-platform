import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeadStatusConfigMap } from '@/config/crmStatusConfig';
import { formatDateTime } from '@/lib/formatters';
import {
  LeadResponse,
  LeadStatusItem,
  LeadSourceItem,
  LeadRating,
} from '../model/leadTypes';
import { useLeadDetailQuery } from '../hooks/leadQueries';
import {
  Building2,
  PhoneCall,
  User,
  Users,
  Globe,
  Clock,
  ShieldCheck,
  Target,
  Sparkles,
  UserCheck,
  CheckCircle2,
  Edit,
  Flame,
  Sun,
  Snowflake,
  ExternalLink,
  Mail,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface LeadDetailSheetProps {
  isOpen: boolean;
  leadId?: string | null;
  tenantId?: string;
  statuses: LeadStatusItem[];
  sources: LeadSourceItem[];
  canWrite: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCalculateScore: (lead: LeadResponse) => void;
  onAutoAssign: (lead: LeadResponse) => void;
  onConvert: (lead: LeadResponse) => void;
}

export const LeadDetailSheet: React.FC<LeadDetailSheetProps> = ({
  isOpen,
  leadId,
  tenantId = 'default',
  statuses,
  sources,
  canWrite,
  onClose,
  onEdit,
  onCalculateScore,
  onAutoAssign,
  onConvert,
}) => {
  const {
    data: lead,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeadDetailQuery(leadId, tenantId, isOpen);

  const statusMap = React.useMemo(() => {
    return new Map(statuses.map((s) => [s.id, s]));
  }, [statuses]);

  const sourceMap = React.useMemo(() => {
    return new Map(sources.map((src) => [src.id, src.name]));
  }, [sources]);

  const renderStatusBadge = (statusId: string) => {
    const status = statusMap.get(statusId);
    if (!status) {
      return (
        <Badge variant="outline" className="text-xs font-mono text-slate-500 rounded-[3px]">
          {statusId.slice(0, 8)}…
        </Badge>
      );
    }

    const config = LeadStatusConfigMap[status.statusCode];
    if (config) {
      return (
        <Badge className={`text-xs rounded-[3px] uppercase tracking-wider px-2 py-0.5 ${config.className}`}>
          {status.name}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-xs font-semibold text-slate-700 border-slate-200 rounded-[3px]">
        {status.name}
      </Badge>
    );
  };

  const renderRatingBadge = (rating?: LeadRating | null) => {
    if (!rating) return null;

    switch (rating) {
      case 'HOT':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-[2px]">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>HOT</span>
          </span>
        );
      case 'WARM':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-[2px]">
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>WARM</span>
          </span>
        );
      case 'COLD':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-[2px]">
            <Snowflake className="w-3.5 h-3.5 text-slate-400" />
            <span>COLD</span>
          </span>
        );
    }
  };

  const fullNameParts = lead
    ? [lead.honorific, lead.givenName, lead.familyName].filter(Boolean).join(' ')
    : '';

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl p-0 flex flex-col bg-[#F7F8F9] z-50 border-l border-slate-200 font-sans"
      >
        {/* Sheet Header */}
        <SheetHeader className="px-6 py-4 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-slate-900">
                  {lead?.displayName || 'Lead Profile'}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 mt-0.5">
                  Canonical lead record details and qualification history
                </SheetDescription>
              </div>
            </div>

            {/* Quick Actions in Header */}
            {lead && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCalculateScore(lead)}
                  className="h-8 px-2.5 text-xs font-semibold rounded-[3px] border-slate-200 text-slate-700 gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Score</span>
                </Button>

                {canWrite && (
                  <Button
                    size="sm"
                    onClick={onEdit}
                    className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1 shadow-none"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </SheetHeader>

        {/* Sheet Body Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Loading lead details…</span>
            </div>
          )}

          {isError && (
            <div className="py-12 p-6 bg-white rounded-[4px] border border-rose-200 text-center space-y-3 shadow-2xs">
              <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">Could not load lead</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {(error as any)?.message || 'The lead record could not be retrieved from the server.'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-[3px]">
                  Retry
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="rounded-[3px]">
                  Close
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !isError && lead && (
            <div className="space-y-4 text-xs">
              {/* TOP IDENTITY HERO */}
              <div className="p-4 rounded-[4px] bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-slate-900">{lead.displayName}</h2>
                    {fullNameParts && (
                      <p className="text-xs text-slate-500 font-medium">
                        Formal Name: <span className="text-slate-800">{fullNameParts}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-[2px]">
                        {lead.leadNumber}
                      </span>
                      {renderStatusBadge(lead.statusId)}
                      {renderRatingBadge(lead.rating)}
                      {lead.convertedAt && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] rounded-[2px]"
                        >
                          CONVERTED
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Workflow Action Buttons */}
                  {canWrite && !lead.convertedAt && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAutoAssign(lead)}
                        className="h-8 px-2.5 text-xs font-semibold text-slate-700 rounded-[3px] border-slate-200 gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Auto-assign</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onConvert(lead)}
                        className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[3px] gap-1.5 shadow-none"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Converted</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2-COLUMN METADATA GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SECTION 1: CONTACT INFORMATION */}
                <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Contact Channels</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Email Address</span>
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{lead.email}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Phone Number</span>
                      {lead.phoneE164 ? (
                        <a
                          href={`tel:${lead.phoneE164}`}
                          className="font-mono font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{lead.phoneE164}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Website</span>
                      {lead.website ? (
                        <a
                          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{lead.website}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: COMPANY & POSITION */}
                <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Company & Position</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Company Name</span>
                      <span className="font-semibold text-slate-900 block">
                        {lead.companyName || lead.accountName || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Job Title</span>
                      <span className="font-medium text-slate-800 block">
                        {lead.jobTitle || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Country / Language</span>
                      <span className="font-medium text-slate-700 block">
                        {lead.countryCode ? `Country: ${lead.countryCode}` : 'No country'} |{' '}
                        {lead.preferredLanguageCode ? `Lang: ${lead.preferredLanguageCode}` : 'No lang'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: QUALIFICATION & VALUE */}
                <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                    <Globe className="w-3.5 h-3.5 text-purple-600" />
                    <span>Pipeline & Commercial</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Estimated Value:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {lead.estimatedValue
                          ? `${lead.estimatedValue.amount.toLocaleString()} ${lead.estimatedValue.currencyCode}`
                          : 'Not set'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lead Source:</span>
                      <span className="font-semibold text-slate-800">
                        {lead.sourceId ? sourceMap.get(lead.sourceId) || lead.sourceId : 'Not specified'}
                      </span>
                    </div>

                    {lead.disqualificationReason && (
                      <div>
                        <span className="text-slate-400 text-[10px] block">Disqualification Reason</span>
                        <p className="text-rose-700 font-medium">{lead.disqualificationReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 4: OWNERSHIP */}
                <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ownership Assignment</span>
                  </div>
                  <div className="pt-1">
                    {lead.owner ? (
                      <div className="flex items-center gap-2">
                        {lead.owner.type === 'USER' ? (
                          <User className="w-4 h-4 text-slate-500" />
                        ) : (
                          <Users className="w-4 h-4 text-slate-500" />
                        )}
                        <div>
                          <span className="font-medium text-slate-800">
                            {lead.owner.type === 'USER' ? 'User' : 'Team'} Owner
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 block">
                            {lead.owner.id}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Unassigned</p>
                    )}
                  </div>
                </div>
              </div>

              {/* NOTES */}
              {lead.qualificationNotes && (
                <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
                    Qualification Notes
                  </span>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {lead.qualificationNotes}
                  </p>
                </div>
              )}

              {/* CONVERSION DETAILS */}
              {lead.convertedAt && (
                <div className="p-4 rounded-[4px] bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Conversion Record</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-900 pt-1">
                    <div>
                      <span className="text-emerald-600 text-[10px] block">Converted At</span>
                      <span>{formatDateTime(lead.convertedAt)}</span>
                    </div>
                    {lead.convertedBy && (
                      <div>
                        <span className="text-emerald-600 text-[10px] block">Converted By</span>
                        <span className="font-mono">{lead.convertedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AUDIT METADATA */}
              <div className="p-3 rounded-[4px] bg-slate-100/80 border border-slate-200 text-[11px] text-slate-500 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Created: {formatDateTime(lead.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Updated: {formatDateTime(lead.updatedAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
