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
} from 'lucide-react';

interface ContactDetailsProps {
  contact: ContactResponse;
}

export const ContactDetails: React.FC<ContactDetailsProps> = ({ contact }) => {
  const { data: account, isLoading: isLoadingAccount } = useContactAccountQuery(
    contact.accountId
  );

  const fullNameParts = [
    contact.honorific,
    contact.givenName,
    contact.middleName,
    contact.familyName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Top Banner / Identity summary */}
      <div className="p-4 rounded-[4px] bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              {contact.displayName}
            </h2>
            {fullNameParts && (
              <p className="text-xs text-slate-500 font-medium">
                Formal Name: <span className="text-slate-800">{fullNameParts}</span>
              </p>
            )}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-[2px]">
                {contact.contactNumber}
              </span>
              {renderLifecycleStageBadge(contact.lifecycleStage)}
              {contact.doNotContact && (
                <Badge
                  variant="destructive"
                  className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-2 py-0.5 font-bold gap-1 rounded-[2px]"
                >
                  <Ban className="w-3 h-3" />
                  <span>Do Not Contact (DNC)</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Sections: 2 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Section 1: Linked Account */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Account Association</span>
          </div>
          {contact.accountId ? (
            <div className="space-y-1.5 pt-1">
              <div className="font-semibold text-slate-900">
                {isLoadingAccount ? (
                  <span className="text-slate-400">Loading account…</span>
                ) : account ? (
                  account.displayName
                ) : (
                  <span className="text-slate-500">
                    Linked account ID: {contact.accountId.slice(0, 8)}…
                  </span>
                )}
              </div>
              <Link
                to={`/app/crm/accounts/${contact.accountId}`}
                className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 font-medium text-xs pt-1"
              >
                <span>View Account 360°</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <p className="text-slate-400 italic pt-1">No linked account</p>
          )}
        </div>

        {/* Section 2: Business Role */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Business Role</span>
          </div>
          <div className="space-y-1 pt-1">
            <div>
              <span className="text-slate-400 text-[10px] block">Job Title</span>
              <span className="font-medium text-slate-800">
                {contact.jobTitle || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Department</span>
              <span className="font-medium text-slate-800">
                {contact.department || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Ownership */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ownership</span>
          </div>
          {contact.owner ? (
            <div className="flex items-center gap-2 pt-1">
              {contact.owner.type === 'USER' ? (
                <User className="w-4 h-4 text-slate-500" />
              ) : (
                <Users className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <span className="font-medium text-slate-800">
                  {contact.owner.type === 'USER' ? 'User' : 'Team'} Owner
                </span>
                <span className="font-mono text-[10px] text-slate-400 block">
                  {contact.owner.id}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 italic pt-1">Unassigned</p>
          )}
        </div>

        {/* Section 4: Contact Preferences */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <Globe className="w-3.5 h-3.5 text-purple-600" />
            <span>Preferences & Metadata</span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Preferred Channel:</span>
              <span className="font-semibold text-slate-800">
                {contact.preferredContactChannel || 'None specified'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Preferred Language:</span>
              <span className="font-mono text-slate-800 font-semibold">
                {contact.preferredLanguageCode || '—'}
              </span>
            </div>
            {contact.dateOfBirth && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Date of Birth:</span>
                <span className="font-mono text-slate-800">
                  {contact.dateOfBirth}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 5: Description / Notes */}
      {contact.description && (
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
            Description & Notes
          </span>
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
            {contact.description}
          </p>
        </div>
      )}

      {/* Audit Metadata Footer */}
      <div className="p-3 rounded-[4px] bg-slate-100/80 border border-slate-200 text-[11px] text-slate-500 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Created: {formatDateTime(contact.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Updated: {formatDateTime(contact.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};
