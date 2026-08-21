import React, { useState, useEffect, useCallback } from 'react';
import {
  catalogApi,
  PriceBookItem,
} from '@/services/api/catalogApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardFilterBar } from '@/components/common/StandardFilterBar';
import {
  BookOpen,
  Plus,
  RefreshCw,
  Edit,
  Loader2,
  Calendar,
  DollarSign,
  Star,
} from 'lucide-react';

export const PriceBooksPage: React.FC = () => {
  const [priceBooks, setPriceBooks] = useState<PriceBookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPriceBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await catalogApi.listPriceBooks({ search: searchQuery });
      setPriceBooks(res);
    } catch {
      toast.error('Unable to load price books');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPriceBooks();
  }, [fetchPriceBooks]);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Price Books &amp; Pricing Policies"
        subtitle="Manage multi-tier pricing strategies by customer segment, partner channel &amp; effective dates"
        icon={BookOpen}
        badgeCount={priceBooks.length}
        badgeLabel="price books"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPriceBooks}
              disabled={loading}
              className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={() => toast.info('Custom Partner & Segment Price Book creator coming soon')}
              className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none h-8 rounded-[3px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Price Book</span>
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-[4px] border border-slate-200 px-4 py-3 flex items-center justify-between shadow-none">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Price Books</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{priceBooks.length}</h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-emerald-100 px-4 py-3 flex items-center justify-between shadow-none">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Standard Price Book</p>
            <h3 className="text-xl font-black text-emerald-600 mt-0.5">1 Standard (VND)</h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Star className="w-4.5 h-4.5 fill-emerald-500 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white rounded-[4px] border border-purple-100 px-4 py-3 flex items-center justify-between shadow-none">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Default Currency</p>
            <h3 className="text-xl font-black text-purple-600 mt-0.5">VND (Vietnam Dong)</h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search price book by name or code..."
      />

      {/* Table */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading price books...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Price Book Code &amp; Name</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Currency</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Effective Date</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Entries Count</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceBooks.map((pb) => (
                  <TableRow key={pb.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {pb.code}
                        </span>
                        {pb.isStandard && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                            STANDARD
                          </Badge>
                        )}
                      </div>
                      <div className="font-semibold text-slate-900 mt-1">{pb.name}</div>
                    </TableCell>

                    <TableCell className="py-2 px-3 font-semibold text-slate-700">
                      {pb.currency}
                    </TableCell>

                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pb.validFrom}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2 px-3">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold text-[11px]">
                        {pb.entriesCount} Items
                      </Badge>
                    </TableCell>

                    <TableCell className="py-2 px-3">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-[11px]">
                        ACTIVE
                      </Badge>
                    </TableCell>

                    <TableCell className="py-2 px-3 text-right pr-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PriceBooksPage;
