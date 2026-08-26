import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Minus,
  ArrowRight,
} from 'lucide-react';
import { RoleDiffResult, ExtendedPermission, RoleDraft } from '../model/roleTypes';
import { TeamItem } from '@/services/api/teamApi';
import { Badge } from '@/components/ui/badge';

interface RoleChangeReviewProps {
  diff: RoleDiffResult;
  draft: RoleDraft;
  catalog: ExtendedPermission[];
  teams: TeamItem[];
}

export const RoleChangeReview: React.FC<RoleChangeReviewProps> = ({
  diff,
  draft,
  catalog = [],
  teams = [],
}) => {
  const permMap = useMemo(() => {
    const map = new Map<string, ExtendedPermission>();
    (catalog || []).forEach((p) => map.set(p.permissionCode, p));
    return map;
  }, [catalog]);

  const teamMap = useMemo(() => {
    const map = new Map<string, string>();
    (teams || []).forEach((t) => map.set(t.id, t.name));
    return map;
  }, [teams]);

  return (
    <div className="space-y-4">
      {/* Risk Callouts / Alerts */}
      {diff.riskWarnings.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-[4px] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Governance &amp; Security Impact Warnings</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-800/90 pl-1">
            {diff.riskWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Metadata Changes */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 space-y-2">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
          Role Summary
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Role Code</span>
            <span className="font-mono font-bold text-slate-900">{draft.roleCode}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Role Name</span>
            <div className="flex items-center gap-1 font-semibold text-slate-900">
              {diff.metadata.nameChanged ? (
                <>
                  <span className="line-through text-slate-400">{diff.metadata.oldName}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-blue-600 font-bold">{diff.metadata.newName}</span>
                </>
              ) : (
                <span>{draft.name}</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Operational Status</span>
            <div className="flex items-center gap-1">
              {diff.metadata.statusChanged ? (
                <>
                  <Badge variant="outline" className="text-[10px]">
                    {diff.metadata.oldStatus}
                  </Badge>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      diff.metadata.newStatus === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    {diff.metadata.newStatus}
                  </Badge>
                </>
              ) : (
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    draft.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}
                >
                  {draft.status}
                </Badge>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Total Permissions</span>
            <span className="font-mono font-bold text-blue-600">
              {draft.permissionCodes.length} active grant(s)
            </span>
          </div>
        </div>
      </div>

      {/* Permission Changes */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Permissions Differential
          </span>
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="text-emerald-600">+{diff.permissions.added.length} added</span>
            <span className="text-rose-600">-{diff.permissions.removed.length} removed</span>
          </div>
        </div>

        {/* Added Permissions */}
        {diff.permissions.added.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <Plus className="w-3 h-3" />
              <span>Granted Permissions ({diff.permissions.added.length}):</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {diff.permissions.added.map((code) => {
                const perm = permMap.get(code);
                return (
                  <div
                    key={code}
                    className="p-1.5 bg-emerald-50/60 border border-emerald-200 rounded-[3px] flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-[11px] font-bold text-emerald-900 truncate">
                      {code}
                    </span>
                    {perm?.riskLevel === 'PRIVILEGED' && (
                      <Badge
                        variant="outline"
                        className="bg-rose-100 text-rose-700 border-rose-300 text-[9px] font-bold px-1 py-0 rounded-[2px]"
                      >
                        PRIVILEGED
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Removed Permissions */}
        {diff.permissions.removed.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
              <Minus className="w-3 h-3" />
              <span>Revoked Permissions ({diff.permissions.removed.length}):</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {diff.permissions.removed.map((code) => (
                <div
                  key={code}
                  className="p-1.5 bg-rose-50/60 border border-rose-200 rounded-[3px] flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-[11px] font-bold text-rose-900 line-through truncate">
                    {code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {diff.permissions.added.length === 0 && diff.permissions.removed.length === 0 && (
          <p className="text-xs text-slate-500 italic">No permission changes in this revision.</p>
        )}
      </div>

      {/* Data Scope Changes */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 space-y-2">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
          Configured Data Scopes ({draft.dataScopes.length})
        </span>

        {draft.dataScopes.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No explicit data scopes assigned.</p>
        ) : (
          <div className="space-y-1.5">
            {draft.dataScopes.map((scope, idx) => {
              const teamName = scope.teamId ? teamMap.get(scope.teamId) || scope.teamId : undefined;
              return (
                <div
                  key={idx}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-[3px] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{scope.entityType}</span>
                    <span className="text-slate-400">→</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 font-bold text-[10px] rounded-[2px]">
                      {scope.type}
                    </Badge>
                  </div>
                  {teamName && (
                    <span className="text-[11px] text-slate-600 font-medium">Team: {teamName}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
