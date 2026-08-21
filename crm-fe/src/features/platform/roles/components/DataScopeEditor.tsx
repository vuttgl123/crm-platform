import React, { useState } from 'react';
import { Plus, Trash2, Shield, Building, AlertCircle } from 'lucide-react';
import { RoleDataScope } from '@/services/api/roleApi';
import { TeamItem } from '@/services/api/teamApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataScopeEditorProps {
  dataScopes: RoleDataScope[];
  isReadOnly: boolean;
  onChange: (scopes: RoleDataScope[]) => void;
  teams: TeamItem[];
}

const STANDARD_ENTITIES = [
  { code: 'ACCOUNT', label: 'Accounts & Organizations' },
  { code: 'CONTACT', label: 'Individual Contacts' },
  { code: 'LEAD', label: 'Sales Leads' },
  { code: 'OPPORTUNITY', label: 'Deals & Opportunities' },
  { code: 'QUOTE', label: 'Quotations & Proposals' },
  { code: 'ORDER', label: 'Sales Orders' },
  { code: 'CONTRACT', label: 'Commercial Contracts' },
  { code: 'SERVICE_TICKET', label: 'Support & Service Tickets' },
  { code: 'CAMPAIGN', label: 'Marketing Campaigns' },
];

export const DataScopeEditor: React.FC<DataScopeEditorProps> = ({
  dataScopes,
  isReadOnly,
  onChange,
  teams,
}) => {
  const [customEntityInput, setCustomEntityInput] = useState('');
  const [selectedEntityAdd, setSelectedEntityAdd] = useState('ACCOUNT');

  const handleAddScope = () => {
    if (isReadOnly) return;
    const entityType =
      selectedEntityAdd === 'CUSTOM'
        ? customEntityInput.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '')
        : selectedEntityAdd;

    if (!entityType) return;

    // Check if duplicate
    const exists = dataScopes.some((s) => s.entityType === entityType);
    if (exists) return;

    onChange([
      ...dataScopes,
      {
        entityType,
        type: 'OWN',
      },
    ]);

    setCustomEntityInput('');
  };

  const handleUpdateScopeType = (
    index: number,
    type: 'OWN' | 'TEAM' | 'TEAM_TREE' | 'TENANT'
  ) => {
    if (isReadOnly) return;
    const next = [...dataScopes];
    const current = next[index];

    let teamId = current.teamId;
    if (type === 'OWN' || type === 'TENANT') {
      teamId = undefined;
    } else if (!teamId && teams.length > 0) {
      teamId = teams[0].id;
    }

    next[index] = {
      ...current,
      type,
      teamId,
    };
    onChange(next);
  };

  const handleUpdateTeam = (index: number, teamId: string) => {
    if (isReadOnly) return;
    const next = [...dataScopes];
    next[index] = {
      ...next[index],
      teamId,
    };
    onChange(next);
  };

  const handleRemoveScope = (index: number) => {
    if (isReadOnly) return;
    onChange(dataScopes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-3 rounded-[4px] border border-slate-200 text-xs text-slate-600">
        <p className="font-semibold text-slate-800 mb-1">Entity-Level Data Scoping Rules</p>
        <p>
          Configure record-level row security constraints for individual CRM aggregates. If no scope is defined for an entity, users default to private ownership access.
        </p>
      </div>

      {/* Add New Scope Section */}
      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row items-end gap-2.5 bg-white p-3 border border-slate-200 rounded-[4px]">
          <div className="w-full sm:w-64 space-y-1">
            <Label className="text-[11px] font-semibold text-slate-700">Target Entity Type</Label>
            <Select
              value={selectedEntityAdd}
              onValueChange={setSelectedEntityAdd}
            >
              <SelectTrigger className="h-8 text-xs border-slate-200 rounded-[3px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[3px]">
                {STANDARD_ENTITIES.map((e) => (
                  <SelectItem key={e.code} value={e.code}>
                    {e.code} ({e.label})
                  </SelectItem>
                ))}
                <SelectItem value="CUSTOM">+ Custom Entity Schema...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedEntityAdd === 'CUSTOM' && (
            <div className="w-full sm:w-48 space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700">Custom Entity Code</Label>
              <Input
                value={customEntityInput}
                onChange={(e) =>
                  setCustomEntityInput(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '')
                  )
                }
                placeholder="e.g. INVOICE"
                className="h-8 text-xs font-mono uppercase rounded-[3px] border-slate-200"
              />
            </div>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleAddScope}
            className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1 rounded-[3px] shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Scope Grant</span>
          </Button>
        </div>
      )}

      {/* Configured Scopes List */}
      <div className="space-y-2">
        {dataScopes.length === 0 ? (
          <div className="py-10 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-[4px]">
            <Building className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
            <p className="text-xs font-medium">No granular data scoping rules configured.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Role members will operate with basic own-records permissions.</p>
          </div>
        ) : (
          dataScopes.map((scope, index) => {
            const needsTeam = scope.type === 'TEAM' || scope.type === 'TEAM_TREE';
            const missingTeam = needsTeam && (!scope.teamId || scope.teamId.trim().length === 0);

            return (
              <div
                key={`${scope.entityType}-${index}`}
                className={`p-3 rounded-[4px] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  missingTeam
                    ? 'bg-rose-50/50 border-rose-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Entity Name & Badge */}
                <div className="flex items-center gap-2.5 min-w-[200px]">
                  <div className="w-7 h-7 rounded-[3px] bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      {scope.entityType}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {STANDARD_ENTITIES.find((e) => e.code === scope.entityType)?.label ||
                        'Custom Schema Entity'}
                    </span>
                  </div>
                </div>

                {/* Scope Selectors */}
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Scope Type */}
                  <div className="w-full sm:w-44">
                    <Select
                      value={scope.type}
                      disabled={isReadOnly}
                      onValueChange={(val: any) => handleUpdateScopeType(index, val)}
                    >
                      <SelectTrigger className="h-8 text-xs border-slate-200 rounded-[3px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[3px]">
                        <SelectItem value="OWN">OWN (Creator/Owner only)</SelectItem>
                        <SelectItem value="TEAM">TEAM (Assigned Team)</SelectItem>
                        <SelectItem value="TEAM_TREE">TEAM_TREE (Team + Branches)</SelectItem>
                        <SelectItem value="TENANT">TENANT (Full Organization)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Team Picker (if TEAM or TEAM_TREE) */}
                  {needsTeam && (
                    <div className="w-full sm:w-56">
                      <Select
                        value={scope.teamId || ''}
                        disabled={isReadOnly}
                        onValueChange={(val) => handleUpdateTeam(index, val)}
                      >
                        <SelectTrigger
                          className={`h-8 text-xs rounded-[3px] bg-white ${
                            missingTeam ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
                          }`}
                        >
                          <SelectValue placeholder="Select target team..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-[3px]">
                          {teams.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} ({t.code || 'TEAM'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {missingTeam && (
                    <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Required</span>
                    </span>
                  )}
                </div>

                {/* Remove Action */}
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveScope(index)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 rounded-[3px] shrink-0 self-end md:self-center"
                    aria-label={`Remove scope for ${scope.entityType}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
