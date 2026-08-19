import React, { useState, useEffect, useRef } from 'react';
import { activityApi } from '@/services/api/activityApi';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Phone,
  PhoneOff,
  PhoneForwarded,
  CheckCircle2,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export type CallOutcome =
  | 'CONNECTED_SUCCESS'
  | 'NO_ANSWER'
  | 'BUSY'
  | 'CALLBACK_REQUESTED'
  | 'WRONG_NUMBER';

export type CallSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

interface QuickCallLogModalProps {
  open: boolean;
  onClose: () => void;
  targetName: string;
  targetPhone: string;
  entityType: 'ACCOUNT' | 'CONTACT' | 'LEAD';
  entityId: string;
  onCallLogged?: () => void;
}

export const QuickCallLogModal: React.FC<QuickCallLogModalProps> = ({
  open,
  onClose,
  targetName,
  targetPhone,
  entityType: _entityType,
  entityId: _entityId,
  onCallLogged,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isCalling, setIsCalling] = useState(true);
  const [outcome, setOutcome] = useState<CallOutcome>('CONNECTED_SUCCESS');
  const [sentiment, setSentiment] = useState<CallSentiment>('POSITIVE');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      setSeconds(0);
      setIsCalling(true);
      setSubject(`Cuộc gọi tư vấn: ${targetName}`);
      setNotes('');
      setOutcome('CONNECTED_SUCCESS');
      setSentiment('POSITIVE');

      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, targetName]);

  const handleEndCall = () => {
    setIsCalling(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveLog = async () => {
    setIsSaving(true);
    try {
      const outcomeLabels: Record<CallOutcome, string> = {
        CONNECTED_SUCCESS: 'Đã trao đổi thành công',
        NO_ANSWER: 'Không bắt máy',
        BUSY: 'Máy bận',
        CALLBACK_REQUESTED: 'Hẹn gọi lại sau',
        WRONG_NUMBER: 'Sai số / Nhầm đối tượng',
      };

      const fullDescription = `[Thời lượng: ${formatTimer(seconds)}] [Kết quả: ${outcomeLabels[outcome]}] [Thái độ: ${sentiment}]\n${notes}`;

      await activityApi.create({
        type: 'CALL',
        subject: subject || `Cuộc gọi tới ${targetName}`,
        description: fullDescription,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        dueDate: new Date().toISOString(),
      });

      toast.success(`Đã lưu nhật ký cuộc gọi (${formatTimer(seconds)}) vào Timeline thành công!`);
      onCallLogged?.();
      onClose();
    } catch {
      toast.error('Không thể lưu nhật ký cuộc gọi');
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden font-sans">
        {/* Calling Header Banner */}
        <div className={`p-5 text-white transition-colors ${isCalling ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-900'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg ${isCalling ? 'bg-emerald-500 animate-bounce' : 'bg-slate-800'}`}>
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">{targetName}</h3>
                <div className="text-xs text-blue-100 font-mono mt-0.5">{targetPhone}</div>
              </div>
            </div>

            {/* Timer Counter */}
            <div className="text-right">
              <div className="font-mono text-2xl font-black tracking-wider">
                {formatTimer(seconds)}
              </div>
              <div className="text-[10px] text-blue-200 uppercase font-semibold">
                {isCalling ? 'Đang gọi...' : 'Đã kết thúc'}
              </div>
            </div>
          </div>

          {isCalling && (
            <div className="mt-4 pt-3 border-t border-white/20 flex justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndCall}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5 h-8 px-4 shadow-sm"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Gác máy (Dừng đếm giờ)</span>
              </Button>
            </div>
          )}
        </div>

        {/* Log Form Details */}
        <div className="p-5 space-y-4 text-xs">
          {/* Outcome Selector */}
          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700 text-xs">Kết quả cuộc gọi:</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOutcome('CONNECTED_SUCCESS')}
                className={`p-2 rounded-lg border text-left font-medium flex items-center gap-1.5 transition-all ${
                  outcome === 'CONNECTED_SUCCESS'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Thành công</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('CALLBACK_REQUESTED')}
                className={`p-2 rounded-lg border text-left font-medium flex items-center gap-1.5 transition-all ${
                  outcome === 'CALLBACK_REQUESTED'
                    ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <PhoneForwarded className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Hẹn gọi lại sau</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('NO_ANSWER')}
                className={`p-2 rounded-lg border text-left font-medium flex items-center gap-1.5 transition-all ${
                  outcome === 'NO_ANSWER'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Không bắt máy</span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('BUSY')}
                className={`p-2 rounded-lg border text-left font-medium flex items-center gap-1.5 transition-all ${
                  outcome === 'BUSY'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 font-bold shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <PhoneOff className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Máy bận / Thuê bao</span>
              </button>
            </div>
          </div>

          {/* Sentiment / Customer Attitude */}
          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700 text-xs">Thái độ khách hàng:</Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSentiment('POSITIVE')}
                className={`flex-1 p-2 rounded-lg border text-center font-medium flex items-center justify-center gap-1.5 transition-all ${
                  sentiment === 'POSITIVE'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Smile className="w-4 h-4 text-emerald-600" />
                <span>Tích cực</span>
              </button>
              <button
                type="button"
                onClick={() => setSentiment('NEUTRAL')}
                className={`flex-1 p-2 rounded-lg border text-center font-medium flex items-center justify-center gap-1.5 transition-all ${
                  sentiment === 'NEUTRAL'
                    ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Meh className="w-4 h-4 text-blue-600" />
                <span>Bình thường</span>
              </button>
              <button
                type="button"
                onClick={() => setSentiment('NEGATIVE')}
                className={`flex-1 p-2 rounded-lg border text-center font-medium flex items-center justify-center gap-1.5 transition-all ${
                  sentiment === 'NEGATIVE'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Frown className="w-4 h-4 text-rose-600" />
                <span>Không hài lòng</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="font-bold text-slate-700 text-xs">Nội dung tóm tắt &amp; Bước tiếp theo:</Label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú nhanh: Khách hàng quan tâm gói Enterprise, hẹn gửi bảng báo giá chi tiết qua Zalo/Email trong hôm nay..."
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden resize-none bg-slate-50/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={handleSaveLog}
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-xs px-4"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Lưu vào Timeline</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
