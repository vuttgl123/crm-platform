import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Kanban, 
  FileCheck2, 
  CheckCircle2
} from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';

export const CapabilityStoriesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection className="bg-white">
      <SectionHeading

        title={t('landing.home.capabilities.title')}
        description="Bộ công cụ hoàn chỉnh giúp doanh nghiệp chuẩn hóa từ giai đoạn tiếp cận đến chốt hợp đồng"
        align="left"
      />

      <div className="space-y-16 lg:space-y-24 pt-4">
        {/* Story 1: Customer 360 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#085AC0] flex items-center justify-center border border-blue-100 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#07182B] landing-display leading-tight">
              {t('landing.home.capabilities.customer360Title')}
            </h3>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              {t('landing.home.capabilities.customer360Description')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-[#07182B]">Đa liên hệ (Contacts) theo từng pháp nhân</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-[#07182B]">Dòng thời gian tương tác 360° thời gian thực</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#F8FAFD] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    TC
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#07182B]">Tập đoàn Toàn Cầu</h4>
                    <p className="text-xs text-slate-500">Mã: ACC-2026-001 • B2B Enterprise</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Khách hàng Active
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center pt-1 border-t border-slate-100">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Hợp đồng</span>
                  <span className="text-xs font-bold text-[#07182B]">4.2 Tỷ ₫</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Cơ hội mở</span>
                  <span className="text-xs font-bold text-[#085AC0]">2 Đang đàm phán</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Nhân sự liên hệ</span>
                  <span className="text-xs font-bold text-[#07182B]">5 Đầu mối</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story 2: Pipeline Control */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#085AC0] flex items-center justify-center border border-blue-100 shadow-xs">
              <Kanban className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#07182B] landing-display leading-tight">
              {t('landing.home.capabilities.pipelineTitle')}
            </h3>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              {t('landing.home.capabilities.pipelineDescription')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-[#07182B]">Phễu bán hàng đa giai đoạn trực quan</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-[#07182B]">Cảnh báo deal trễ hạn &amp; tỷ lệ Win dự báo</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1 bg-[#F8FAFD] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-3.5 shadow-sm">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    ĐÀM PHÁN (80%)
                  </span>
                  <span className="text-xs font-bold text-[#07182B]">Dự án ERP Logistics</span>
                </div>
                <p className="text-xs text-slate-500">Công ty CP Vận tải Á Châu</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#085AC0] block">1.850.000.000 ₫</span>
                <span className="text-[10px] text-emerald-600 font-bold">Dự kiến chốt T8/2026</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    ĐÁNH GIÁ (50%)
                  </span>
                  <span className="text-xs font-bold text-[#07182B]">Gói hạ tầng Cloud Server</span>
                </div>
                <p className="text-xs text-slate-500">Tập đoàn Bất động sản Phú Mỹ</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#07182B] block">920.000.000 ₫</span>
                <span className="text-[10px] text-slate-500 font-medium">Đang gửi báo giá</span>
              </div>
            </div>
          </div>
        </div>

        {/* Story 3: Commerce & Automation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#085AC0] flex items-center justify-center border border-blue-100 shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#07182B] landing-display leading-tight">
              {t('landing.home.capabilities.automationTitle')}
            </h3>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              {t('landing.home.capabilities.automationDescription')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-[#07182B]">Báo giá tự động áp dụng chiết khấu</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-[#07182B]">Chuyển đổi 1-click sang Đơn hàng &amp; Hợp đồng</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#F8FAFD] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-[#07182B]">Luồng phê duyệt Báo giá #QT-2026-88</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ĐÃ PHÊ DUYỆT
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Hạng mục: CRM Cloud License (50 Users)</span>
                  <span className="font-bold text-[#07182B]">600.000.000 ₫</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Chiết khấu hợp đồng (10%)</span>
                  <span className="font-semibold text-rose-600">-60.000.000 ₫</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#085AC0] pt-2 border-t border-slate-100">
                  <span>Tổng giá trị đơn hàng:</span>
                  <span>540.000.000 ₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
};

export default CapabilityStoriesSection;
