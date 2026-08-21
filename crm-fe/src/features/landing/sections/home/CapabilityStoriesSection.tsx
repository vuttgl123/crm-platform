import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Kanban, Zap, CheckCircle2, Clock } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';

export const CapabilityStoriesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection className="bg-white">
      <SectionHeading
        eyebrow={t('landing.home.capabilities.eyebrow')}
        title={t('landing.home.capabilities.title')}
        align="left"
      />

      <div className="space-y-16 lg:space-y-24">
        {/* Story 1: Customer 360 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#085AC0] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#07182B] landing-display">
              {t('landing.home.capabilities.customer360Title')}
            </h3>
            <p className="text-base text-[#52647A] leading-relaxed">
              {t('landing.home.capabilities.customer360Description')}
            </p>
            <ul className="space-y-2.5 pt-2 text-sm text-[#07182B]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Liên kết đa người liên hệ (Contacts) thuộc cùng một pháp nhân (Account)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dòng thời gian hoạt động: cuộc gọi, email, lịch họp và ghi chú</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 bg-[#F5F8FC] border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#085AC0] flex items-center justify-center font-bold text-sm">
                    TC
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#07182B]">Tập đoàn Toàn Cầu</h4>
                    <p className="text-xs text-[#52647A]">MST: 0108992831 · Hà Nội</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  KHÁCH HÀNG
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#52647A]">
                <span>3 Người liên hệ chính</span>
                <span>2 Báo giá đang hiệu lực</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 text-xs">
              <span className="font-bold text-[#07182B] block">Dòng sự kiện gần nhất</span>
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[#52647A]">
                  <span>Họp rà soát hợp đồng triển khai Q3</span>
                  <span className="text-[11px]">Hôm nay, 09:30</span>
                </div>
                <div className="flex items-center justify-between text-[#52647A]">
                  <span>Gửi báo giá phiên bản v2.1</span>
                  <span className="text-[11px]">Hôm qua</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story 2: Sales Pipeline (Reversed Desktop Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Kanban className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#07182B] landing-display">
              {t('landing.home.capabilities.pipelineTitle')}
            </h3>
            <p className="text-base text-[#52647A] leading-relaxed">
              {t('landing.home.capabilities.pipelineDescription')}
            </p>
            <ul className="space-y-2.5 pt-2 text-sm text-[#07182B]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Theo dõi cơ hội theo giai đoạn chuẩn hóa và xác suất thành công</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cảnh báo cơ hội trễ hạn hoặc thiếu hành động tiếp theo</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 lg:order-1 bg-[#F5F8FC] border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-[#52647A] pb-2 border-b border-slate-200">
              <span>TIỀM NĂNG</span>
              <span>ĐÀM PHÁN</span>
              <span>CHỐT THÀNH CÔNG</span>
            </div>
            <div className="space-y-2 pt-1">
              <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#07182B]">Dự án ERP &amp; CRM tích hợp</p>
                  <p className="text-[11px] text-[#52647A]">Logistics VN</p>
                </div>
                <span className="text-xs font-bold text-[#085AC0]">450.000.000 đ</span>
              </div>
              <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#07182B]">Hạ tầng CRM 50 Chi nhánh</p>
                  <p className="text-[11px] text-[#52647A]">Chuỗi F&B Toàn Quốc</p>
                </div>
                <span className="text-xs font-bold text-[#085AC0]">820.000.000 đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Story 3: Automation & Process */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#07182B] landing-display">
              {t('landing.home.capabilities.automationTitle')}
            </h3>
            <p className="text-base text-[#52647A] leading-relaxed">
              {t('landing.home.capabilities.automationDescription')}
            </p>
            <ul className="space-y-2.5 pt-2 text-sm text-[#07182B]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tự động phân bổ khách hàng tiềm năng cho phụ trách theo vùng</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Nhắc việc chăm sóc định kỳ trước hạn hợp đồng</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 bg-[#F5F8FC] border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#085AC0]" />
                <span className="text-xs font-bold text-[#07182B]">Quy trình tự động hóa đã kích hoạt</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-[#07182B] font-medium">Phân công Lead miền Nam cho Team Lead SG</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">TỰ ĐỘNG</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-[#07182B] font-medium">Nhắc hạn tái ký trước 30 ngày cho Account Manager</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">LẬP LỊCH</span>
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
