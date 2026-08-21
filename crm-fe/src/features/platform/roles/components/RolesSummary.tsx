import React from 'react';
import { Shield, ShieldCheck, Key, Layers } from 'lucide-react';
import { RoleSummaryStats } from '../model/roleTypes';

interface RolesSummaryProps {
  stats: RoleSummaryStats;
  loading?: boolean;
}

export const RolesSummary: React.FC<RolesSummaryProps> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-[3px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Roles</span>
          <span className="text-base font-black text-slate-900 font-mono tabular-nums leading-tight block mt-0.5">
            {loading ? '—' : stats.totalRoles}
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[4px] p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-[3px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Roles</span>
          <span className="text-base font-black text-emerald-600 font-mono tabular-nums leading-tight block mt-0.5">
            {loading ? '—' : stats.activeRoles}
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[4px] p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-[3px] bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Custom Roles</span>
          <span className="text-base font-black text-indigo-600 font-mono tabular-nums leading-tight block mt-0.5">
            {loading ? '—' : stats.customRoles}
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[4px] p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-[3px] bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <Key className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">System Permissions</span>
          <span className="text-base font-black text-purple-600 font-mono tabular-nums leading-tight block mt-0.5">
            {loading ? '—' : stats.totalPermissions}
          </span>
        </div>
      </div>
    </div>
  );
};
