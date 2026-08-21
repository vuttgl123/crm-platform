import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGate } from '@/components/common/PermissionGate';

interface RolesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onStatusChange: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  typeFilter: 'ALL' | 'SYSTEM' | 'CUSTOM';
  onTypeChange: (type: 'ALL' | 'SYSTEM' | 'CUSTOM') => void;
  onCreateClick: () => void;
}

export const RolesToolbar: React.FC<RolesToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  onCreateClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-[4px]">
      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search roles by code or name..."
            className="pl-8 h-8 text-xs border-slate-200 rounded-[3px] w-full"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-36">
          <Select
            value={statusFilter}
            onValueChange={(val) => onStatusChange(val as 'ALL' | 'ACTIVE' | 'INACTIVE')}
          >
            <SelectTrigger className="h-8 text-xs border-slate-200 rounded-[3px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px]">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="w-full sm:w-36">
          <Select
            value={typeFilter}
            onValueChange={(val) => onTypeChange(val as 'ALL' | 'SYSTEM' | 'CUSTOM')}
          >
            <SelectTrigger className="h-8 text-xs border-slate-200 rounded-[3px] bg-white">
              <SelectValue placeholder="Role Type" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px]">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="SYSTEM">System Built-in</SelectItem>
              <SelectItem value="CUSTOM">Custom Tenant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create Button */}
      <PermissionGate permission="platform_role.manage">
        <Button
          size="sm"
          onClick={onCreateClick}
          className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none rounded-[3px] shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Role</span>
        </Button>
      </PermissionGate>
    </div>
  );
};
