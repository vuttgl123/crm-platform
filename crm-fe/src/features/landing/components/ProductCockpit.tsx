import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Kanban, 
  FileText, 
  CheckCircle2,
  Clock,
  Lock
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { renderLifecycleStageBadge } from '@/config/crmStatusConfig';
import { previewPipelineItems } from '../content/productPreviewContent';
import { CockpitTabId } from '../types/landing';

export const ProductCockpit: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<CockpitTabId>('pipeline');

  return (
    <div className="bg-white border border-[#DCE5F0] rounded-2xl shadow-xl overflow-hidden">
      {/* Top Cockpit Chrome Bar */}
      <div className="bg-[#07182B] px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          <span className="text-xs font-semibold text-slate-300 ml-2 tracking-wide">
            VUM CRM Cockpit
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
          {t('landing.common.illustrativeData')}
        </span>
      </div>

      {/* Cockpit Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as CockpitTabId)}
        className="w-full"
      >
        <div className="border-b border-[#DCE5F0] bg-slate-50/70 px-4 sm:px-6 pt-3">
          <TabsList className="bg-slate-200/70 p-1 h-auto rounded-lg gap-1">
            <TabsTrigger
              id="landing-cockpit-tab-pipeline"
              value="pipeline"
              className="text-xs sm:text-sm font-semibold py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#085AC0] data-[state=active]:shadow-sm"
            >
              <Kanban className="w-4 h-4 mr-1.5" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger
              id="landing-cockpit-tab-customer360"
              value="customer360"
              className="text-xs sm:text-sm font-semibold py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#085AC0] data-[state=active]:shadow-sm"
            >
              <Users className="w-4 h-4 mr-1.5" />
              Customer 360°
            </TabsTrigger>
            <TabsTrigger
              id="landing-cockpit-tab-governance"
              value="governance"
              className="text-xs sm:text-sm font-semibold py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#085AC0] data-[state=active]:shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              {t('landing.home.trust.eyebrow')}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Pipeline */}
        <TabsContent
          id="landing-cockpit-panel-pipeline"
          value="pipeline"
          className="p-5 sm:p-6 space-y-4 m-0 focus-visible:outline-none"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#07182B]">
                {t('landing.home.capabilities.pipelineTitle')}
              </h3>
              <p className="text-xs text-[#52647A] mt-0.5">
                {t('landing.home.capabilities.pipelineDescription')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {previewPipelineItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    {renderLifecycleStageBadge(item.stage)}
                    <span className="text-sm font-bold text-[#07182B]">
                      {t(item.labelKey)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#085AC0] bg-[#EAF2FC] px-3 py-1.5 rounded-lg shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#085AC0]" />
                  <span>{t(item.nextActionKey)}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Customer 360 */}
        <TabsContent
          id="landing-cockpit-panel-customer360"
          value="customer360"
          className="p-5 sm:p-6 space-y-4 m-0 focus-visible:outline-none"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#07182B]">
                {t('landing.home.capabilities.customer360Title')}
              </h3>
              <p className="text-xs text-[#52647A] mt-0.5">
                {t('landing.home.capabilities.customer360Description')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#085AC0]" />
                <span className="text-xs font-bold text-[#07182B]">Hồ sơ Tổ chức & Pháp nhân</span>
              </div>
              <p className="text-xs text-[#52647A] leading-relaxed">
                Mã số thuế, địa chỉ, người đại diện và lịch sử giao dịch liên kết trực tiếp.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#085AC0]" />
                <span className="text-xs font-bold text-[#07182B]">Báo giá &amp; Hợp đồng</span>
              </div>
              <p className="text-xs text-[#52647A] leading-relaxed">
                Lưu trữ phiên bản, trạng thái duyệt và liên kết đơn hàng trong cùng hồ sơ.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Governance */}
        <TabsContent
          id="landing-cockpit-panel-governance"
          value="governance"
          className="p-5 sm:p-6 space-y-4 m-0 focus-visible:outline-none"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#07182B]">
                {t('landing.home.trust.title')}
              </h3>
              <p className="text-xs text-[#52647A] mt-0.5">
                {t('landing.home.trust.eyebrow')}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { icon: Lock, title: '5 Vai trò RBAC chuẩn hóa', desc: 'Admin, Quản lý vùng, Trưởng nhóm, Nhân viên và Chỉ xem' },
              { icon: ShieldCheck, title: '4 Cấp độ phạm vi dữ liệu', desc: 'Toàn tổ chức (TENANT), Nhánh nhóm (TEAM_TREE), Trong nhóm (TEAM), Cá nhân (OWN)' },
              { icon: CheckCircle2, title: 'Audit Trail & Truy vết', desc: 'Ghi nhận chi tiết lịch sử thao tác và truy cập theo thời gian thực' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Icon className="w-4 h-4 text-[#085AC0] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[#07182B]">{item.title}</p>
                    <p className="text-xs text-[#52647A]">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductCockpit;
