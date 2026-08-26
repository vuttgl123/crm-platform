import React from 'react';
import { Link } from 'react-router-dom';
import { ContactResponse } from '@/services/api/contactApi';
import { useContactAccountQuery } from '../hooks/contactQueries';
import { renderLifecycleStageBadge } from '@/config/crmStatusConfig';
import { formatDateTime } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  ExternalLink,
  User,
  Users,
  Ban,
  Globe,
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';

interface ContactDetailsProps {
  contact: ContactResponse;
  onEdit?: () => void;
}

export const ContactDetails: React.FC<ContactDetailsProps> = ({ contact }) => {
  const { data: account, isLoading: isLoadingAccount } = useContactAccountQuery(
    contact.accountId
  );

  const hasRealNameParts = Boolean(contact.givenName || contact.familyName);
  const formalName = [
    contact.honorific,
    contact.givenName,
    contact.middleName,
    contact.familyName,
  ]
    .filter(Boolean)
    .join(' ');

  const showFormalName = hasRealNameParts && formalName && formalName !== contact.displayName;

  // Compute initials for avatar
  const initials = contact.displayName
    ? contact.displayName
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'C';

  const renderChannelInfo = () => {
    switch (contact.preferredContactChannel) {
      case 'EMAIL':
        return (
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Email</span>
          </div>
        );
      case 'PHONE':
        return (
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>Phone Call</span>
          </div>
        );
      case 'MOBILE':
      case 'SMS':
        return (
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Mobile / SMS</span>
          </div>
        );
      case 'WHATSAPP':
        return (
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </div>
        );
      default:
        return <span className="text-slate-400 font-medium">None specified</span>;
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Hero Profile Banner */}
      <div className="p-4 rounded-[4px] bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-start gap-4">
          {/* Avatar Pod */}
          <div className="w-12 h-12 rounded-[4px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-base flex items-center justify-center shadow-2xs shrink-0 tracking-wider">
            {initials}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {contact.displayName}
              </h2>
              {showFormalName && (
                <span className="text-xs text-slate-500 font-medium">
                  ({formalName})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-[2px]">
                {contact.contactNumber}
              </span>
              {renderLifecycleStageBadge(contact.lifecycleStage)}
              {contact.doNotContact ? (
                <Badge
                  variant="destructive"
                  className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-2 py-0.5 font-bold gap-1 rounded-[2px]"
                >
                  <Ban className="w-3 h-3" />
                  <span>Do Not Contact (DNC)</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 font-bold gap-1 rounded-[2px]"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Outreach Permitted</span>
                </Badge>
              )}
            </div>

            {(contact.jobTitle || contact.department) && (
              <p className="text-xs text-slate-600 font-medium pt-0.5">
                {[contact.jobTitle, contact.department].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Professional & Account Affiliation */}
      <div className="rounded-[4px] bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-2.5 bg-[#F7F8F9] border-b border-slate-200 flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Professional &amp; Account Affiliation
          </span>
        </div>
        <div className="p-4 divide-y divide-slate-100">
          <div className="py-2.5 first:pt-0 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-medium w-44 shrink-0">
              Affiliated Organization
            </span>
            <div className="text-right">
              {contact.accountId ? (
                <div className="flex items-center justify-end gap-1.5">
                  <span className="font-semibold text-slate-900">
                    {isLoadingAccount ? (
                      <span className="text-slate-400 font-normal">Loading account…</span>
                    ) : account ? (
                      account.displayName
                    ) : (
                      <span className="font-mono text-slate-600">
                        {contact.accountId.slice(0, 8)}…
                      </span>
                    )}
                  </span>
                  <Link
                    to={`/app/crm/accounts/${contact.accountId}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-0.5 font-semibold text-xs ml-1"
                  >
                    <span>View Account 360°</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <span className="text-slate-400 italic">No affiliated account</span>
              )}
            </div>
          </div>

          <div className="py-2.5 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-medium w-44 shrink-0">Job Position / Title</span>
            <span className="font-semibold text-slate-800 text-right">
              {contact.jobTitle || <span className="text-slate-400 font-normal italic">Not specified</span>}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-medium w-44 shrink-0">Department / Division</span>
            <span className="font-semibold text-slate-800 text-right">
              {contact.department || <span className="text-slate-400 font-normal italic">Not specified</span>}
            </span>
          </div>

          <div className="py-2.5 last:pb-0 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-medium w-44 shrink-0">Record Ownership</span>
            <div className="text-right">
              {contact.owner ? (
                <div className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                  {contact.owner.type === 'USER' ? (
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span>
                    {contact.owner.type === 'USER' ? 'User' : 'Team'}: {contact.owner.id.slice(0, 8)}…
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 italic">Unassigned</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Communication & Engagement Profile */}
      <div className="rounded-[4px] bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-2.5 bg-[#F7F8F9] border-b border-slate-200 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Communication &amp; Engagement Profile
          </span>
        </div>
        <div className="p-4 divide-y divide-slate-100">
          <div className="py-2.5 first:pt-0 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-medium w-44 shrink-0">Preferred Channel</span>
            <div className="text-right">{renderChannelInfo()}</div>
          </div>

          <div className="py-2.5 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-medium w-44 shrink-0">Language Preference</span>
            <span className="font-mono font-semibold text-slate-800 text-right">
              {contact.preferredLanguageCode || <span className="text-slate-400 font-normal italic">Default</span>}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-medium w-44 shrink-0">Date of Birth</span>
            <div className="text-right font-medium text-slate-800">
              {contact.dateOfBirth ? (
                <div className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{contact.dateOfBirth}</span>
                </div>
              ) : (
                <span className="text-slate-400 italic font-normal">Not recorded</span>
              )}
            </div>
          </div>

          <div className="py-2.5 last:pb-0 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-medium w-44 shrink-0">Outreach Restriction</span>
            <div className="text-right">
              {contact.doNotContact ? (
                <span className="text-rose-600 font-bold">
                  Active DNC Suppression Flagged
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">
                  Standard Commercial Outreach Allowed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Description & Background Context */}
      {contact.description && (
        <div className="rounded-[4px] bg-white border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-2.5 bg-[#F7F8F9] border-b border-slate-200 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Background Notes &amp; Context
            </span>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {contact.description}
            </p>
          </div>
        </div>
      )}

      {/* Section 4: System Record & Audit Trail */}
      <div className="p-3 rounded-[4px] bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Created: {formatDateTime(contact.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Last Updated: {formatDateTime(contact.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};
