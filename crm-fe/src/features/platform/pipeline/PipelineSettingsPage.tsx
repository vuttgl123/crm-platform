import React, { useState, useEffect, useCallback } from 'react';
import {
  pipelineApi,
  PipelineItem,
  StageCategory,
  ForecastCategory,
} from '@/services/api/pipelineApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Workflow,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Percent,
  XCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export const PipelineSettingsPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<PipelineItem[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Stage Modal state
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [stageCode, setStageCode] = useState('');
  const [stageName, setStageName] = useState('');
  const [probability, setProbability] = useState(50);
  const [stageCategory, setStageCategory] = useState<StageCategory>('OPEN');
  const [forecastCategory, setForecastCategory] = useState<ForecastCategory>('PIPELINE');

  const fetchPipelines = useCallback(async () => {
    setLoading(true);
    try {
      const list = await pipelineApi.listPipelines();
      if (list && list.length > 0) {
        setPipelines(list);
        if (!selectedPipeline) {
          const detail = await pipelineApi.getPipeline(list[0].id);
          setSelectedPipeline(detail);
        } else {
          const detail = await pipelineApi.getPipeline(selectedPipeline.id);
          setSelectedPipeline(detail);
        }
      } else {
        // Fallback default pipeline
        const defaultPip: PipelineItem = {
          id: 'pipe-default',
          pipelineCode: 'SALES_ENTERPRISE',
          name: 'Quy trình Bán hàng Doanh nghiệp (Enterprise Sales Pipeline)',
          pipelineType: 'SALES',
          defaultPipeline: true,
          active: true,
          version: 1,
          stages: [
            {
              id: 'stg-1',
              pipelineId: 'pipe-default',
              stageCode: 'PROSPECTING',
              name: '1. Khám phá Nhu cầu (Prospecting)',
              displayOrder: 1,
              defaultProbability: 20,
              stageCategory: 'OPEN',
              forecastCategory: 'PIPELINE',
              active: true,
              version: 1,
            },
            {
              id: 'stg-2',
              pipelineId: 'pipe-default',
              stageCode: 'QUALIFIED',
              name: '2. Thẩm định Tiềm năng (Qualified)',
              displayOrder: 2,
              defaultProbability: 40,
              stageCategory: 'OPEN',
              forecastCategory: 'PIPELINE',
              active: true,
              version: 1,
            },
            {
              id: 'stg-3',
              pipelineId: 'pipe-default',
              stageCode: 'PROPOSAL',
              name: '3. Đề xuất Báo giá & Giải pháp (Proposal)',
              displayOrder: 3,
              defaultProbability: 60,
              stageCategory: 'OPEN',
              forecastCategory: 'BEST_CASE',
              active: true,
              version: 1,
            },
            {
              id: 'stg-4',
              pipelineId: 'pipe-default',
              stageCode: 'NEGOTIATION',
              name: '4. Đàm phán Điều khoản & Pháp lý (Negotiation)',
              displayOrder: 4,
              defaultProbability: 80,
              stageCategory: 'OPEN',
              forecastCategory: 'COMMIT',
              active: true,
              version: 1,
            },
            {
              id: 'stg-5',
              pipelineId: 'pipe-default',
              stageCode: 'CLOSED_WON',
              name: '5. Ký kết Thành công (Closed Won)',
              displayOrder: 5,
              defaultProbability: 100,
              stageCategory: 'WON',
              forecastCategory: 'CLOSED',
              active: true,
              version: 1,
            },
            {
              id: 'stg-6',
              pipelineId: 'pipe-default',
              stageCode: 'CLOSED_LOST',
              name: '6. Thất bại / Hủy bỏ (Closed Lost)',
              displayOrder: 6,
              defaultProbability: 0,
              stageCategory: 'LOST',
              forecastCategory: 'OMITTED',
              active: true,
              version: 1,
            },
          ],
        };
        setPipelines([defaultPip]);
        setSelectedPipeline(defaultPip);
      }
    } catch {
      toast.error('Không thể tải cấu hình phễu bán hàng');
    } finally {
      setLoading(false);
    }
  }, [selectedPipeline]);

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleSelectPipeline = async (pipe: PipelineItem) => {
    setLoading(true);
    try {
      const detail = await pipelineApi.getPipeline(pipe.id).catch(() => pipe);
      setSelectedPipeline(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPipeline || !stageName.trim() || !stageCode.trim()) return;

    setSaving(true);
    try {
      await pipelineApi.addStage(selectedPipeline.id, {
        stageCode: stageCode.trim().toUpperCase(),
        name: stageName.trim(),
        defaultProbability: Number(probability),
        stageCategory,
        forecastCategory,
        displayOrder: (selectedPipeline.stages?.length || 0) + 1,
      });
      toast.success('Đã thêm giai đoạn phễu mới thành công!');
      setShowAddStageModal(false);
      setStageCode('');
      setStageName('');
      fetchPipelines();
    } catch {
      toast.error('Không thể tạo giai đoạn mới');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!selectedPipeline) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa giai đoạn này khỏi phễu?')) return;

    try {
      await pipelineApi.deleteStage(selectedPipeline.id, stageId);
      toast.success('Đã xóa giai đoạn khỏi phễu');
      fetchPipelines();
    } catch {
      toast.error('Không thể xóa giai đoạn');
    }
  };

  const getStageCategoryBadge = (cat: StageCategory) => {
    switch (cat) {
      case 'WON':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">Thành công (Won)</Badge>;
      case 'LOST':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">Thất bại (Lost)</Badge>;
      default:
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">Đang mở (Open)</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans w-full max-w-[1400px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Workflow className="w-3.5 h-3.5" />
              Cấu hình Quy trình Bán hàng
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Quản trị Phễu Bán hàng &amp; Giai đoạn (Sales Pipelines)
          </h1>
          <p className="text-xs text-slate-500">
            Tùy biến các bước tiến trình chốt deal, tỷ lệ xác suất thành công (%) và phân loại dự báo doanh thu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPipelines}
            disabled={loading}
            className="h-9 px-3 text-xs font-semibold border-slate-200 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowAddStageModal(true)}
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Giai đoạn Mới</span>
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Pipeline Selector */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Danh sách Quy trình ({pipelines.length})
          </div>

          <div className="space-y-2">
            {pipelines.map((pipe) => (
              <button
                key={pipe.id}
                onClick={() => handleSelectPipeline(pipe)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selectedPipeline?.id === pipe.id
                    ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-xs text-slate-900 line-clamp-1">{pipe.name}</span>
                  {pipe.defaultPipeline && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-100 text-blue-700 font-bold border-blue-200">
                      Mặc định
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                  <span>Mã: {pipe.pipelineCode}</span>
                  <span>•</span>
                  <span>{pipe.stages?.length || 0} bước</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Area: Stage Progression Visual Builder */}
        <div className="lg:col-span-3 space-y-4">
          {selectedPipeline && (
            <Card className="border border-slate-200 shadow-2xs rounded-2xl bg-white overflow-hidden">
              <CardHeader className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {selectedPipeline.name}
                    <Badge variant="outline" className="text-xs font-mono font-normal border-slate-200">
                      {selectedPipeline.pipelineCode}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Kéo thả hoặc thay đổi thứ tự và tỷ lệ % chốt deal của từng giai đoạn trong quy trình
                  </CardDescription>
                </div>

                <Button
                  size="sm"
                  onClick={() => setShowAddStageModal(true)}
                  className="h-8 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Bước</span>
                </Button>
              </CardHeader>

              <CardContent className="p-5 space-y-3">
                {selectedPipeline.stages && selectedPipeline.stages.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPipeline.stages
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((stage, idx) => (
                        <div
                          key={stage.id}
                          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center shrink-0 border border-blue-200">
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-slate-900">{stage.name}</span>
                                {getStageCategoryBadge(stage.stageCategory)}
                                <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200">
                                  Dự báo: {stage.forecastCategory}
                                </Badge>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                                Mã bước: {stage.stageCode}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            {/* Win Probability Pill */}
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-slate-800">
                              <Percent className="w-3.5 h-3.5 text-blue-600" />
                              <span>Xác suất: <strong>{stage.defaultProbability}%</strong></span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteStage(stage.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Xóa bước này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Workflow className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">Quy trình này chưa có giai đoạn nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Add Stage */}
      {showAddStageModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Thêm Giai đoạn mới vào Phễu</h3>
              <button onClick={() => setShowAddStageModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStage} className="space-y-3.5 text-xs">
              <div>
                <Label className="font-semibold text-slate-700">Mã Giai đoạn (Stage Code) <span className="text-rose-500">*</span></Label>
                <Input
                  required
                  placeholder="VD: DEMO_PRESENTATION"
                  value={stageCode}
                  onChange={(e) => setStageCode(e.target.value)}
                  className="h-8 text-xs font-mono uppercase mt-1"
                />
              </div>

              <div>
                <Label className="font-semibold text-slate-700">Tên hiển thị Giai đoạn <span className="text-rose-500">*</span></Label>
                <Input
                  required
                  placeholder="VD: Trình diễn Demo sản phẩm"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Xác suất chốt deal mặc định (%)</span>
                  <span className="font-bold text-blue-600">{probability}%</span>
                </Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={probability}
                  onChange={(e) => setProbability(Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-semibold text-slate-700">Phân loại Giai đoạn</Label>
                  <select
                    value={stageCategory}
                    onChange={(e) => setStageCategory(e.target.value as StageCategory)}
                    className="w-full h-8 text-xs px-2 bg-white border border-slate-200 rounded-lg mt-1"
                  >
                    <option value="OPEN">Đang mở (Open)</option>
                    <option value="WON">Chốt thành công (Won)</option>
                    <option value="LOST">Thất bại / Hủy (Lost)</option>
                  </select>
                </div>

                <div>
                  <Label className="font-semibold text-slate-700">Dự báo Doanh thu</Label>
                  <select
                    value={forecastCategory}
                    onChange={(e) => setForecastCategory(e.target.value as ForecastCategory)}
                    className="w-full h-8 text-xs px-2 bg-white border border-slate-200 rounded-lg mt-1"
                  >
                    <option value="PIPELINE">Pipeline</option>
                    <option value="BEST_CASE">Best Case</option>
                    <option value="COMMIT">Commit</option>
                    <option value="CLOSED">Closed</option>
                    <option value="OMITTED">Omitted</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddStageModal(false)}
                  className="h-8 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  size="sm"
                  className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Lưu Giai đoạn</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
