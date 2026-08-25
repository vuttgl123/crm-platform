import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { OrderTabKey, OrderUrlFilters } from '../model/orderUrlState';
import type { OrderStatus } from '@/services/api/orderApi';

interface OrderFilterBarProps {
  filters: OrderUrlFilters;
  onFilterChange: (filters: Partial<OrderUrlFilters>) => void;
  onReset: () => void;
}

export const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="space-y-3 font-sans w-full">
      {/* 1. Operational Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <Tabs
          value={filters.tab}
          onValueChange={(val) => onFilterChange({ tab: val as OrderTabKey, page: 0 })}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-slate-100 p-0.5 rounded-[4px] h-8">
            <TabsTrigger
              value="all"
              className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-slate-900"
            >
              All Orders
            </TabsTrigger>
            <TabsTrigger
              value="needs_processing"
              className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-blue-700"
            >
              Needs Processing
            </TabsTrigger>
            <TabsTrigger
              value="in_fulfillment"
              className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-amber-700"
            >
              In Fulfillment
            </TabsTrigger>
            <TabsTrigger
              value="fulfilled"
              className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-emerald-700"
            >
              Fulfilled
            </TabsTrigger>
            <TabsTrigger
              value="closed_cancelled"
              className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-slate-700"
            >
              Closed / Cancelled
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 2. Search & Select Filters */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by order # or customer reference..."
              value={filters.q}
              onChange={(e) => onFilterChange({ q: e.target.value, page: 0 })}
              className="pl-8 h-8 text-xs rounded-[3px] bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>

          {/* Status Dropdown */}
          <Select
            value={filters.status || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({
                status: val === 'ALL' ? undefined : (val as OrderStatus),
                page: 0,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs font-medium rounded-[3px] w-[140px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px]">
              <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="DRAFT" className="text-xs">Draft</SelectItem>
              <SelectItem value="CONFIRMED" className="text-xs">Confirmed</SelectItem>
              <SelectItem value="PROCESSING" className="text-xs">Processing</SelectItem>
              <SelectItem value="PARTIALLY_FULFILLED" className="text-xs">Partially Fulfilled</SelectItem>
              <SelectItem value="FULFILLED" className="text-xs">Fulfilled</SelectItem>
              <SelectItem value="CLOSED_PARTIAL" className="text-xs">Closed Partial</SelectItem>
              <SelectItem value="CANCELLED" className="text-xs">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Currency Dropdown */}
          <Select
            value={filters.currencyCode || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({
                currencyCode: val === 'ALL' ? undefined : val,
                page: 0,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs font-medium rounded-[3px] w-[100px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px]">
              <SelectItem value="ALL" className="text-xs">All Currencies</SelectItem>
              <SelectItem value="USD" className="text-xs">USD ($)</SelectItem>
              <SelectItem value="EUR" className="text-xs">EUR (€)</SelectItem>
              <SelectItem value="VND" className="text-xs">VND (₫)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-8 text-xs font-semibold rounded-[3px] text-slate-600 gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  );
};
