import React from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ActivityLink,
  ActivityRelatedType,
  CreateActivityLinkRequest,
} from '../../../model/activityTypes';
import { accountApi } from '@/services/api/accountApi';
import { contactApi } from '@/services/api/contactApi';
import { leadApi } from '@/services/api/leadApi';
import { opportunityApi } from '@/services/api/opportunityApi';
import {
  Building2,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

interface ActivityRelatedRecordsTabProps {
  activityId: string;
  links: ActivityLink[];
  canWrite: boolean;
  onAddLink: (payload: CreateActivityLinkRequest) => Promise<void>;
  onRemoveLink: (linkId: string) => Promise<void>;
  isLoading: boolean;
}

export const ActivityRelatedRecordsTab: React.FC<ActivityRelatedRecordsTabProps> = ({
  links,
  canWrite,
  onAddLink,
  onRemoveLink,
  isLoading,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [targetType, setTargetType] = React.useState<ActivityRelatedType>('ACCOUNT');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [options, setOptions] = React.useState<{ id: string; displayName: string; displayCode?: string }[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<{ id: string; displayName: string } | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isModalOpen) {
      setSearchQuery('');
      setSelectedItem(null);
      setOptions([]);
      return;
    }

    let isCurrent = true;
    setIsSearching(true);

    const runSearch = async () => {
      try {
        if (targetType === 'ACCOUNT') {
          const res = await accountApi.search({ q: searchQuery, size: 20 });
          if (isCurrent) {
            setOptions(
              (res.items || []).map((acc) => ({
                id: acc.id,
                displayName: acc.displayName,
                displayCode: acc.accountNumber,
              }))
            );
          }
        } else if (targetType === 'CONTACT') {
          const res = await contactApi.search({ q: searchQuery, size: 20 });
          if (isCurrent) {
            setOptions(
              (res.items || []).map((c) => ({
                id: c.id,
                displayName: c.displayName,
                displayCode: c.contactNumber,
              }))
            );
          }
        } else if (targetType === 'LEAD') {
          const res = await leadApi.search({ q: searchQuery, size: 20 });
          if (isCurrent) {
            setOptions(
              (res.items || []).map((l) => ({
                id: l.id,
                displayName: l.displayName || l.companyName || l.leadNumber,
                displayCode: l.leadNumber,
              }))
            );
          }
        } else if (targetType === 'OPPORTUNITY') {
          const res = await opportunityApi.search({ q: searchQuery, size: 20 });
          if (isCurrent) {
            setOptions(
              (res.items || []).map((opp) => ({
                id: opp.id,
                displayName: opp.name,
                displayCode: opp.opportunityNumber,
              }))
            );
          }
        }
      } catch {
        if (isCurrent) setOptions([]);
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    };

    runSearch();
    return () => {
      isCurrent = false;
    };
  }, [isModalOpen, targetType, searchQuery]);

  const handleConfirmAdd = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await onAddLink({
        targetType,
        targetId: selectedItem.id,
      });
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRecordHref = (link: ActivityLink) => {
    if (!link.accessible || !link.targetId) return null;
    switch (link.targetType) {
      case 'ACCOUNT':
        return `/app/crm/accounts/${link.targetId}`;
      case 'CONTACT':
        return `/app/crm/contacts`;
      case 'LEAD':
        return `/app/crm/leads`;
      case 'OPPORTUNITY':
        return `/app/crm/opportunities/${link.targetId}`;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="text-xs uppercase tracking-wider">Related CRM Records</span>
          </div>

          {canWrite && (
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-7 px-2.5 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1 shadow-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Record</span>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400">Loading related records…</div>
        ) : links.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="font-semibold text-slate-700">No related records linked</p>
            <p className="text-[11px] text-slate-400">
              Link this activity to an Account, Contact, Lead, or Opportunity to maintain full CRM context.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-[3px]">
            <Table>
              <TableHeader className="bg-[#F7F8F9]">
                <TableRow>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3">
                    Target Type
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3">
                    Record Name / Identifier
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3">
                    Relationship
                  </TableHead>
                  {canWrite && (
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3 text-right">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => {
                  const href = getRecordHref(link);

                  return (
                    <TableRow key={link.id} className="hover:bg-[#F1F2F4] text-xs">
                      <TableCell className="py-2.5 px-3">
                        <Badge
                          variant="outline"
                          className="font-bold text-[10px] bg-slate-50 border-slate-200 text-slate-700 rounded-[2px]"
                        >
                          {link.targetType}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-2.5 px-3">
                        {link.accessible ? (
                          href ? (
                            <Link
                              to={href}
                              className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                              <span>{link.displayName}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-800">{link.displayName}</span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 italic">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                            <span>Restricted record</span>
                          </span>
                        )}
                        {link.displayCode && (
                          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                            {link.displayCode}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-2.5 px-3">
                        <span className="font-mono text-[10px] text-slate-500 uppercase">
                          {link.relationRole}
                        </span>
                      </TableCell>

                      {canWrite && (
                        <TableCell className="py-2.5 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveLink(link.id)}
                            className="h-7 w-7 text-slate-500 hover:text-rose-600 rounded-[2px]"
                            title="Remove link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Link Record Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-[4px] max-w-md font-sans">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Link CRM Record
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Associate this activity with a customer account, contact, lead, or opportunity.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-800">Target Type</Label>
              <Select
                value={targetType}
                onValueChange={(val) => {
                  setTargetType(val as ActivityRelatedType);
                  setSelectedItem(null);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Select target type" />
                </SelectTrigger>
                <SelectContent className="text-xs font-sans">
                  <SelectItem value="ACCOUNT">Account</SelectItem>
                  <SelectItem value="CONTACT">Contact</SelectItem>
                  <SelectItem value="LEAD">Lead</SelectItem>
                  <SelectItem value="OPPORTUNITY">Opportunity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-800">Search Record</Label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${targetType.toLowerCase()}s…`}
                  className="h-8 pl-8 text-xs bg-white border-slate-200 rounded-[3px]"
                  autoFocus
                />
              </div>
            </div>

            {/* Results selection list */}
            <div className="max-h-[160px] overflow-y-auto border border-slate-200 rounded-[3px] p-1 space-y-1">
              {isSearching ? (
                <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching…</span>
                </div>
              ) : options.length === 0 ? (
                <div className="py-4 text-center text-slate-400 italic">No records found</div>
              ) : (
                options.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[2px] text-left transition-colors ${
                        isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate pr-2">{item.displayName}</span>
                      {item.displayCode && (
                        <span className="font-mono text-[10px] text-slate-400">{item.displayCode}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-200 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="h-8 text-xs font-semibold rounded-[3px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAdd}
              disabled={!selectedItem || isSubmitting}
              className="h-8 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px]"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Linking…
                </span>
              ) : (
                <span>Link Record</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
