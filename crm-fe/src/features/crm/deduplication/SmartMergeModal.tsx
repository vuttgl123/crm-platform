import React, { useState, useEffect } from 'react';
import {
  deduplicationApi,
  DuplicateMatchGroup,
} from '@/services/api/deduplicationApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  GitMerge,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartMergeModalProps {
  open: boolean;
  onClose: () => void;
  onMerged?: () => void;
}

export const SmartMergeModal: React.FC<SmartMergeModalProps> = ({
  open,
  onClose,
  onMerged,
}) => {
  const [loading, setLoading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateMatchGroup[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0);
  const [primaryRecordId, setPrimaryRecordId] = useState<string>('');
  const [secondaryRecordId, setSecondaryRecordId] = useState<string>('');

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const data = await deduplicationApi.scanDuplicates();
      setDuplicateGroups(data);
      if (data.length > 0 && data[0].accounts.length >= 2) {
        setPrimaryRecordId(data[0].accounts[0].id);
        setSecondaryRecordId(data[0].accounts[1].id);
      }
    } catch {
      toast.error('Không thể quét dữ liệu trùng lặp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDuplicates();
    }
  }, [open]);

  if (!open) return null;

  const currentGroup = duplicateGroups[selectedGroupIndex];
  const primaryAccount = currentGroup?.accounts.find((a) => a.id === primaryRecordId) || currentGroup?.accounts[0];
  const secondaryAccount = currentGroup?.accounts.find((a) => a.id === secondaryRecordId) || currentGroup?.accounts[1];

  const handleExecuteMerge = async () => {
    if (!primaryAccount || !secondaryAccount) return;
    if (!window.confirm(`Xác nhận gộp bản ghi "${secondaryAccount.displayName}" vào bản ghi chính "${primaryAccount.displayName}"? Toàn bộ lịch sử giao dịch sẽ được chuyển sang bản ghi chính.`)) {
      return;
    }

    setIsMerging(true);
    try {
      await deduplicationApi.mergeAccounts({
        targetAccountId: primaryAccount.id,
        sourceAccountId: secondaryAccount.id,
      });
      toast.success(`Đã hợp nhất thành công dữ liệu vào "${primaryAccount.displayName}"!`);
      onMerged?.();
      onClose();
    } catch {
      toast.error('Không thể thực hiện hợp nhất dữ liệu');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-2xl font-sans">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs">
              <GitMerge className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">
                Trợ lý Phát hiện & Hợp nhất Khách hàng Trùng lặp (Smart Deduplication & Merge)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Tự động phát hiện các bản ghi trùng Mã số thuế, SĐT, Email và hợp nhất lịch sử tương tác
              </DialogDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDuplicates}
            disabled={loading}
            className="h-8 text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Quét lại</span>
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs font-semibold">Đang rà soát toàn bộ cơ sở dữ liệu để tìm bản ghi trùng lặp...</p>
            </div>
          ) : duplicateGroups.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">Cơ sở dữ liệu hoàn toàn sạch sẽ</h4>
              <p className="text-xs text-slate-400">Không tìm thấy bản ghi khách hàng nào bị trùng lặp thông tin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicateGroups.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {duplicateGroups.map((grp, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant={selectedGroupIndex === idx ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedGroupIndex(idx);
                        if (grp.accounts.length >= 2) {
                          setPrimaryRecordId(grp.accounts[0].id);
                          setSecondaryRecordId(grp.accounts[1].id);
                        }
                      }}
                      className="text-xs h-7.5 gap-1.5"
                    >
                      <span>Cặp trùng #{idx + 1}</span>
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">{grp.confidenceScore}%</Badge>
                    </Button>
                  ))}
                </div>
              )}

              {/* Match Warning Banner */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
                      <span>Phát hiện: {currentGroup.matchReason}</span>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-mono font-bold">
                        Khớp {currentGroup.confidenceScore}% ({currentGroup.matchValue})
                      </Badge>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Tìm thấy {currentGroup.accounts.length} bản ghi có dấu hiệu trùng lặp trong hệ thống.
                    </p>
                  </div>
                </div>
              </div>

              {/* Side-by-side Diff Table */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Đối chiếu Dữ liệu Song song (Side-by-Side Comparison):
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Master / Target Record */}
                  <div className="border-2 border-blue-500 rounded-xl p-4 bg-blue-50/20 space-y-3 relative">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                      <Badge className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5">
                        Bản ghi Chính (Master Record)
                      </Badge>
                      <span className="text-[11px] font-mono text-blue-700 font-bold">
                        {primaryAccount?.accountNumber}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Tên hiển thị:</span>
                        <div className="font-bold text-slate-900">{primaryAccount?.displayName}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Tên pháp lý:</span>
                        <div className="font-semibold text-slate-800">{primaryAccount?.legalName || '---'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 text-[11px]">Mã số thuế:</span>
                          <div className="font-mono font-bold text-slate-800">{primaryAccount?.taxIdentifier || '---'}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">Giai đoạn:</span>
                          <div className="font-semibold text-slate-800">{primaryAccount?.lifecycleStage}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 text-[11px]">Số điện thoại:</span>
                          <div className="font-mono text-slate-800">{primaryAccount?.phone || '024 7300 7300'}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">Email liên hệ:</span>
                          <div className="font-mono text-slate-800">{primaryAccount?.email || 'fpt@fpt.com.vn'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Duplicate / Source Record */}
                  <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/70 space-y-3 relative opacity-90">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-xs">
                        Bản ghi Phụ sẽ gộp &amp; xóa
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        {secondaryAccount?.accountNumber}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Tên hiển thị:</span>
                        <div className="font-bold text-slate-700">{secondaryAccount?.displayName}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Tên pháp lý:</span>
                        <div className="font-semibold text-slate-700">{secondaryAccount?.legalName || '---'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 text-[11px]">Mã số thuế:</span>
                          <div className="font-mono font-bold text-slate-700">{secondaryAccount?.taxIdentifier || '---'}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">Giai đoạn:</span>
                          <div className="font-semibold text-slate-700">{secondaryAccount?.lifecycleStage}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 text-[11px]">Số điện thoại:</span>
                          <div className="font-mono text-slate-700">{secondaryAccount?.phone || '024 7300 7300'}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">Email liên hệ:</span>
                          <div className="font-mono text-slate-700">{secondaryAccount?.email || 'info@fpt-software.com'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Safety Notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  Quy tắc Bảo toàn Dữ liệu Giao dịch:
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Khi thực hiện hợp nhất: Toàn bộ Người liên hệ (Contacts), Cơ hội bán hàng (Opportunities), Báo giá, Đơn hàng, Hợp đồng, Phiếu hỗ trợ và Nhật ký tương tác từ bản ghi phụ sẽ được tự động liên kết sang bản ghi chính trước khi gỡ bỏ bản ghi phụ.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-9 text-xs"
                >
                  Hủy bỏ
                </Button>
                <Button
                  size="sm"
                  disabled={isMerging || !primaryAccount || !secondaryAccount}
                  onClick={handleExecuteMerge}
                  className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 px-4 shadow-sm"
                >
                  {isMerging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitMerge className="w-3.5 h-3.5" />}
                  <span>Thực hiện Hợp nhất Bản ghi</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
