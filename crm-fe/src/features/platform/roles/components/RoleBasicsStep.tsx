import React from 'react';
import { RoleDraft, RoleEditorMode } from '../model/roleTypes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  Lock,
  Shield,
  Key,
  Database,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface RoleBasicsStepProps {
  draft: RoleDraft;
  mode: RoleEditorMode;
  onChange: (updates: Partial<RoleDraft>) => void;
  errors?: Record<string, string>;
}

export const RoleBasicsStep: React.FC<RoleBasicsStepProps> = ({
  draft,
  mode,
  onChange,
  errors = {},
}) => {
  const isReadOnly = mode === 'view' || draft.system;
  const isCodeReadOnly = isReadOnly || mode === 'edit';

  return (
    <div className="space-y-4 w-full">
      {draft.cloneSourceName && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-[4px] text-xs text-blue-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Cloning baseline configuration from role:</span>
          <span className="font-bold">{draft.cloneSourceName}</span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 space-y-4 shadow-2xs">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Role Identification &amp; Metadata</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Define the primary identifier, display label, and functional scope for this access profile.
          </p>
        </div>

        {/* 2-Column Grid for Code & Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role Code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <span>Role Identifier Code</span>
                <span className="text-rose-500">*</span>
                {isCodeReadOnly && <Lock className="w-3 h-3 text-slate-400 ml-1" />}
              </Label>
              <span className="text-[10px] text-slate-500 font-mono">UPPERCASE_SNAKE_CASE</span>
            </div>
            <Input
              value={draft.roleCode}
              disabled={isCodeReadOnly}
              onChange={(e) =>
                onChange({
                  roleCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
                })
              }
              placeholder="e.g. SALES_MANAGER_NORTH"
              className={`h-8.5 text-xs font-mono rounded-[3px] ${
                errors.roleCode ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-slate-200'
              }`}
            />
            {errors.roleCode ? (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.roleCode}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Immutable system reference key for RBAC checks.
              </p>
            )}
          </div>

          {/* Role Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <span>Role Display Name</span>
              <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={draft.name}
              disabled={isReadOnly}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. Regional Sales Director (North)"
              className={`h-8.5 text-xs rounded-[3px] ${
                errors.name ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-slate-200'
              }`}
            />
            {errors.name ? (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.name}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Human-readable title displayed in rosters and user assignment dialogs.
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-800">Operational Purpose &amp; Responsibilities</Label>
          <Textarea
            value={draft.description}
            disabled={isReadOnly}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe the organizational duties, security boundary, and governance scope of this role..."
            rows={3}
            className="text-xs border-slate-200 rounded-[3px] resize-none"
          />
        </div>

        {/* Status (Edit mode) */}
        {mode === 'edit' && !draft.system && (
          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            <Label className="text-xs font-semibold text-slate-800">Operational Status</Label>
            <div className="w-60">
              <Select
                value={draft.status}
                disabled={isReadOnly}
                onValueChange={(val: 'ACTIVE' | 'INACTIVE') => onChange({ status: val })}
              >
                <SelectTrigger className="h-8.5 text-xs border-slate-200 rounded-[3px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ACTIVE">ACTIVE (Operational)</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE (Revoked Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {draft.status === 'INACTIVE' && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-[3px] border border-amber-200 mt-1">
                Warning: Inactive roles revoke effective privileges for all assigned members immediately upon subsequent requests.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Governance & Configuration Overview Card */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>Access Control Architecture</span>
          </span>
          <Badge variant="outline" className="text-[10px] font-mono bg-slate-50 text-slate-600">
            RBAC + ABAC Scoping
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-2.5 rounded-[3px] bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Key className="w-3.5 h-3.5 text-purple-600" />
              <span>Step 2: Capabilities</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Select granular API &amp; UI capabilities across CRM, Sales, Service, Platform, Audit, and Privacy modules.
            </p>
          </div>

          <div className="p-2.5 rounded-[3px] bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Step 3: Data Scopes</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Enforce row-level access boundaries (<span className="font-mono font-semibold">OWN</span>, <span className="font-mono font-semibold">TEAM</span>, <span className="font-mono font-semibold">TEAM_TREE</span>, or <span className="font-mono font-semibold">TENANT</span>) per entity aggregate.
            </p>
          </div>

          <div className="p-2.5 rounded-[3px] bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Step 4: Governance</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Review computed diffs, verify privileged permission assignments, and audit security impact prior to activation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
