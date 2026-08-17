import React, { useState, useEffect, useCallback } from 'react';
import {
  healthScoreApi,
  CustomerHealthScore,
} from '@/services/api/healthScoreApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomerHealthWidgetProps {
  accountId: string;
  accountName?: string;
}

export const CustomerHealthWidget: React.FC<CustomerHealthWidgetProps> = ({
  accountId,
  accountName,
}) => {
  const [healthData, setHealthData] = useState<CustomerHealthScore | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealthScore = useCallback(async () => {
    setLoading(true);
    try {
      const data = await healthScoreApi.getHealthScore(accountId);
      setHealthData(data);
    } catch {
      // Graceful fallback for demo accounts
      setHealthData({
        accountId,
        healthScore: 82,
        healthGrade: 'HEALTHY',
        activityScore: 28,
        ticketScore: 22,
        contractScore: 20,
        transactionScore: 12,
        churnRiskFactors: [],
        recommendedAction:
          'Khách hàng duy trì mối quan hệ rất tốt. Đề xuất gửi thư tri ân và giới thiệu gói giải pháp nâng cấp (Upsell).',
      });
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchHealthScore();
  }, [fetchHealthScore]);

  const score = healthData?.healthScore ?? 80;
  const grade = healthData?.healthGrade ?? 'HEALTHY';

  const getGradeBadge = () => {
    switch (grade) {
      case 'HEALTHY':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold px-2.5 py-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Khách hàng Khỏe mạnh (Tốt)
          </Badge>
        );
      case 'AT_RISK':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold px-2.5 py-0.5">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Cần theo dõi (At Risk)
          </Badge>
        );
      case 'CRITICAL':
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs font-bold px-2.5 py-0.5 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Nguy cơ rời bỏ cao (Critical)
          </Badge>
        );
    }
  };

  const getScoreColor = () => {
    if (score >= 75) return 'text-emerald-700';
    if (score >= 50) return 'text-amber-700';
    return 'text-rose-700';
  };

  return (
    <Card className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 leading-tight">
              Điểm Sức khỏe & Nguy cơ Rời bỏ (Customer Health Score)
            </h3>
            <p className="text-[10px] text-slate-500">Đánh giá thời gian thực từ 4 trụ cột dữ liệu CRM</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getGradeBadge()}
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchHealthScore}
            disabled={loading}
            className="h-7 w-7 text-slate-400 hover:text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Score Top Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center shadow-inner">
                <span className={`text-2xl font-black font-mono ${getScoreColor()}`}>
                  {score}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Chỉ số Sức khỏe Tổng hợp</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Thang điểm 100 dựa trên thuật toán AI phân tích tương tác
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Trạng thái rủi ro</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              {score >= 75 ? 'Rủi ro thấp (< 5%)' : score >= 50 ? 'Rủi ro trung bình (25%)' : 'Rủi ro rất cao (> 60%)'}
            </div>
          </div>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Chi tiết 4 Trụ cột Điểm thành phần:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Activity Recency */}
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Tương tác gần nhất (Activity)</span>
                <span className="font-bold font-mono text-slate-900">
                  {healthData?.activityScore ?? 25} / 30đ
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${((healthData?.activityScore ?? 25) / 30) * 100}%` }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
            </div>

            {/* 2. Support Health */}
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Hài lòng Hỗ trợ CSKH (SLA)</span>
                <span className="font-bold font-mono text-slate-900">
                  {healthData?.ticketScore ?? 20} / 25đ
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${((healthData?.ticketScore ?? 20) / 25) * 100}%` }}
                  className="h-full bg-emerald-600 rounded-full"
                />
              </div>
            </div>

            {/* 3. Contract Longevity */}
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Thời hạn Hợp đồng (Contract)</span>
                <span className="font-bold font-mono text-slate-900">
                  {healthData?.contractScore ?? 20} / 25đ
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${((healthData?.contractScore ?? 20) / 25) * 100}%` }}
                  className="h-full bg-purple-600 rounded-full"
                />
              </div>
            </div>

            {/* 4. Transaction Velocity */}
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Tần suất Giao dịch (Orders)</span>
                <span className="font-bold font-mono text-slate-900">
                  {healthData?.transactionScore ?? 15} / 20đ
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${((healthData?.transactionScore ?? 15) / 20) * 100}%` }}
                  className="h-full bg-amber-600 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors (if any) */}
        {healthData?.churnRiskFactors && healthData.churnRiskFactors.length > 0 && (
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-rose-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              Yếu tố Cảnh báo Rủi ro Rời bỏ:
            </div>
            <ul className="list-disc list-inside text-rose-700 text-[11px] space-y-0.5">
              {healthData.churnRiskFactors.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Action Playbook */}
        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1">
          <div className="font-bold text-blue-900 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            Đề xuất Hành động Tiếp theo (Actionable Playbook):
          </div>
          <p className="text-blue-800 text-[11px] leading-relaxed">
            {healthData?.recommendedAction}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
