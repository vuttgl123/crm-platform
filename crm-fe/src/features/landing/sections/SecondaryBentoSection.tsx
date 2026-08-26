import React, { useState } from 'react';
import { Shield, Network, Shuffle, TrendingUp, Cpu, Smartphone, ArrowRight } from 'lucide-react';
import { EditorialSection } from '../components/EditorialSection';
import { EditorialEyebrow } from '../components/EditorialEyebrow';
import { FadeIn } from '../components/FadeIn';

interface RolePerm {
  role: string;
  scope: string;
  scopeBg: string;
  scopeText: string;
  actions: string;
}

const rolePerms: Record<string, RolePerm[]> = {
  director: [
    { role: 'Giám đốc điều hành (CEO/CRO)', scope: 'Toàn bộ tập đoàn & Chi nhánh', scopeBg: 'bg-[#EFF6FF]', scopeText: 'text-[#1D4ED8]', actions: 'Xem, Duyệt ngoại lệ, Xuất báo cáo, Cấu hình' },
    { role: 'Giám đốc tài chính (CFO)', scope: 'Toàn bộ dữ liệu doanh thu & Giá vốn', scopeBg: 'bg-[#F0FDF4]', scopeText: 'text-[#15803D]', actions: 'Khóa biên lợi nhuận, Ký số hợp đồng' },
  ],
  manager: [
    { role: 'Trưởng phòng kinh doanh', scope: 'Toàn bộ nhân sự thuộc chi nhánh', scopeBg: 'bg-[#EFF6FF]', scopeText: 'text-[#1D4ED8]', actions: 'Duyệt giá (≤10%), Chia lead, Giám sát pipeline' },
    { role: 'Team Lead nhóm bán hàng', scope: 'Chỉ định 5-8 nhân viên phụ trách', scopeBg: 'bg-[#F5F5F4]', scopeText: 'text-[#57534E]', actions: 'Hỗ trợ deal, Xem tiến độ nhóm' },
  ],
  rep: [
    { role: 'Senior Account Executive', scope: 'Deal và khách hàng được phân công', scopeBg: 'bg-[#F5F5F4]', scopeText: 'text-[#57534E]', actions: 'Tạo báo giá CPQ, Cập nhật nhật ký cuộc gọi' },
    { role: 'Sales Representative', scope: 'Chỉ danh bạ cá nhân quản lý', scopeBg: 'bg-[#F5F5F4]', scopeText: 'text-[#57534E]', actions: 'Nhập lead mới, Trình duyệt chiết khấu' },
  ],
};

export const SecondaryBentoSection: React.FC = () => {
  const [selectedRoleTab, setSelectedRoleTab] = useState<'director' | 'manager' | 'rep'>('manager');
  const [selectedBranch, setSelectedBranch] = useState<'north' | 'central' | 'south'>('north');

  return (
    <EditorialSection id="features" className="w-full">
      <FadeIn>
        <div className="max-w-2xl">
          <EditorialEyebrow>Tính năng mở rộng</EditorialEyebrow>
          <h2 className="editorial-h2">
            Bộ công cụ hoàn chỉnh để vận hành đội ngũ kinh doanh
          </h2>
        </div>
      </FadeIn>

      {/* Asymmetric Bento Grid (6 cards: 2 Large + 4 Small) */}
      <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Card 1 (Large - Col 1-6) — Interactive RBAC Matrix */}
        <div className="md:col-span-6">
          <FadeIn stagger={1}>
            <div className="editorial-card p-8 sm:p-10 h-full flex flex-col justify-between space-y-8 hover:border-[#D6D3D1] transition-all duration-150">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-[8px] bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center text-[#1C1917]">
                  <Shield className="w-5 h-5 text-[#1D4ED8]" />
                </div>
                <h3 className="editorial-h3 text-[22px]">
                  Phân quyền chi tiết theo vai trò và cấp bậc
                </h3>
                <p className="editorial-body text-[16px] text-[#57534E]">
                  Quản trị quyền xem, chỉnh sửa và xuất dữ liệu chặt chẽ giữa Giám đốc, Trưởng phòng và nhân viên kinh doanh. Ngăn chặn nguy cơ lộ tệp khách hàng và thông tin giá vốn.
                </p>
              </div>

              {/* Interactive Role Switcher & Live Permissions Matrix */}
              <div className="p-5 rounded-[10px] bg-[#FAFAF9] border border-[#E7E5E4] space-y-3.5 text-[13px]">
                {/* Role Tabs */}
                <div className="flex gap-1.5 p-1 rounded-[6px] bg-[#E7E5E4]/60 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedRoleTab('director')}
                    className={`px-3 py-1 text-[12px] font-semibold rounded-[4px] transition-all whitespace-nowrap ${
                      selectedRoleTab === 'director'
                        ? 'bg-white text-[#1C1917] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    Ban Giám đốc
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRoleTab('manager')}
                    className={`px-3 py-1 text-[12px] font-semibold rounded-[4px] transition-all whitespace-nowrap ${
                      selectedRoleTab === 'manager'
                        ? 'bg-white text-[#1C1917] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    Trưởng phòng KD
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRoleTab('rep')}
                    className={`px-3 py-1 text-[12px] font-semibold rounded-[4px] transition-all whitespace-nowrap ${
                      selectedRoleTab === 'rep'
                        ? 'bg-white text-[#1C1917] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    Sales Reps
                  </button>
                </div>

                {/* Permissions List */}
                <div className="space-y-2 pt-1">
                  {rolePerms[selectedRoleTab].map((p) => (
                    <div key={p.role} className="p-2.5 rounded-[6px] bg-white border border-[#E7E5E4] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#1C1917] text-[12px]">{p.role}</span>
                        <span className={`px-2 py-0.5 rounded-[4px] font-semibold text-[11px] ${p.scopeBg} ${p.scopeText}`}>
                          {p.scope}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#78716C]">{p.actions}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Card 2 (Large - Col 7-12) — Interactive Multi-Branch Tree */}
        <div className="md:col-span-6">
          <FadeIn stagger={2}>
            <div className="editorial-card p-8 sm:p-10 h-full flex flex-col justify-between space-y-8 hover:border-[#D6D3D1] transition-all duration-150">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-[8px] bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center text-[#1C1917]">
                  <Network className="w-5 h-5 text-[#1D4ED8]" />
                </div>
                <h3 className="editorial-h3 text-[22px]">
                  Dữ liệu đa chi nhánh và tập đoàn
                </h3>
                <p className="editorial-body text-[16px] text-[#57534E]">
                  Hỗ trợ mô hình công ty mẹ - con và mạng lưới văn phòng đại diện Bắc - Trung - Nam. Dễ dàng chuyển đổi giữa chế độ xem độc lập từng đơn vị hoặc báo cáo tổng hợp toàn hệ thống.
                </p>
              </div>

              {/* Interactive Branch Selector */}
              <div className="p-5 rounded-[10px] bg-[#FAFAF9] border border-[#E7E5E4] space-y-3.5 text-[12px]">
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div
                    onClick={() => setSelectedBranch('north')}
                    className={`p-3 rounded-[6px] border transition-all cursor-pointer ${
                      selectedBranch === 'north'
                        ? 'bg-[#EFF6FF] border-[#BFDBFE] shadow-[0_1px_2px_rgba(29,78,216,0.06)]'
                        : 'bg-white border-[#E7E5E4] hover:border-[#D6D3D1]'
                    }`}
                  >
                    <p className="text-[#78716C] font-semibold">Chi nhánh Bắc</p>
                    <p className="font-mono font-semibold text-[#1C1917] tabular-nums text-[14px] mt-0.5">3.2B ₫</p>
                    <span className="text-[10px] text-[#15803D] font-medium">108% KPI</span>
                  </div>

                  <div
                    onClick={() => setSelectedBranch('central')}
                    className={`p-3 rounded-[6px] border transition-all cursor-pointer ${
                      selectedBranch === 'central'
                        ? 'bg-[#EFF6FF] border-[#BFDBFE] shadow-[0_1px_2px_rgba(29,78,216,0.06)]'
                        : 'bg-white border-[#E7E5E4] hover:border-[#D6D3D1]'
                    }`}
                  >
                    <p className="text-[#78716C] font-semibold">Chi nhánh Trung</p>
                    <p className="font-mono font-semibold text-[#1C1917] tabular-nums text-[14px] mt-0.5">1.4B ₫</p>
                    <span className="text-[10px] text-[#15803D] font-medium">96% KPI</span>
                  </div>

                  <div
                    onClick={() => setSelectedBranch('south')}
                    className={`p-3 rounded-[6px] border transition-all cursor-pointer ${
                      selectedBranch === 'south'
                        ? 'bg-[#EFF6FF] border-[#BFDBFE] shadow-[0_1px_2px_rgba(29,78,216,0.06)]'
                        : 'bg-white border-[#E7E5E4] hover:border-[#D6D3D1]'
                    }`}
                  >
                    <p className="text-[#78716C] font-semibold">Chi nhánh Nam</p>
                    <p className="font-mono font-semibold text-[#1C1917] tabular-nums text-[14px] mt-0.5">4.1B ₫</p>
                    <span className="text-[10px] text-[#15803D] font-medium">114% KPI</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white border border-[#E7E5E4] flex items-center justify-between text-[11px] text-[#57534E]">
                  <span>Tổng hợp doanh số tập đoàn:</span>
                  <span className="font-mono font-semibold text-[#1C1917] tabular-nums text-[12px]">8.700.000.000 ₫</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Card 3 (Small - Col 1-3 on md / Col 1-6 on lg:col-span-3) */}
        <div className="md:col-span-6 lg:col-span-3">
          <FadeIn stagger={1}>
            <div className="editorial-card group p-7 h-full flex flex-col justify-between space-y-6 hover:border-[#D6D3D1] hover:shadow-[0_4px_20px_rgba(28,25,23,0.03)] transition-all duration-150 cursor-pointer">
              <div className="space-y-3.5">
                <div className="w-9 h-9 rounded-[8px] bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center text-[#1C1917] group-hover:bg-[#EFF6FF] group-hover:border-[#BFDBFE] transition-colors">
                  <Shuffle className="w-4 h-4 text-[#1D4ED8]" />
                </div>
                <h3 className="editorial-h3 text-[18px] group-hover:text-[#1D4ED8] transition-colors">
                  Tự động chia Lead thông minh
                </h3>
                <p className="editorial-small text-[14px] leading-relaxed">
                  Phân bổ cơ hội mới theo khu vực địa lý, chuyên môn ngành hoặc tải công việc của từng nhân sự (Round-robin).
                </p>
              </div>
              <span className="text-[13px] font-semibold text-[#1D4ED8] inline-flex items-center gap-1">
                <span>Quy tắc tự động</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
              </span>
            </div>
          </FadeIn>
        </div>

        {/* Card 4 (Small - Col 4-6 on md / lg:col-span-3) */}
        <div className="md:col-span-6 lg:col-span-3">
          <FadeIn stagger={2}>
            <div className="editorial-card group p-7 h-full flex flex-col justify-between space-y-6 hover:border-[#D6D3D1] hover:shadow-[0_4px_20px_rgba(28,25,23,0.03)] transition-all duration-150 cursor-pointer">
              <div className="space-y-3.5">
                <div className="w-9 h-9 rounded-[8px] bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center text-[#1C1917] group-hover:bg-[#EFF6FF] group-hover:border-[#BFDBFE] transition-colors">
                  <TrendingUp className="w-4 h-4 text-[#1D4ED8]" />
                </div>
                <h3 className="editorial-h3 text-[18px] group-hover:text-[#1D4ED8] transition-colors">
                  Dự báo doanh số theo xác suất
                </h3>
                <p className="editorial-small text-[14px] leading-relaxed">
                  Tính toán doanh thu khả dụng dựa trên trọng số xác suất thắng thực tế của từng giai đoạn trong chu kỳ bán hàng.
                </p>
              </div>
              <span className="text-[13px] font-semibold text-[#1D4ED8] inline-flex items-center gap-1">
                <span>Dự báo chính xác</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
              </span>
            </div>
          </FadeIn>
        </div>

        {/* Card 5 (Small - Col 7-9 on md / lg:col-span-3) */}
        <div className="md:col-span-6 lg:col-span-3">
          <FadeIn stagger={3}>
            <div className="editorial-card group p-7 h-full flex flex-col justify-between space-y-6 hover:border-[#D6D3D1] hover:shadow-[0_4px_20px_rgba(28,25,23,0.03)] transition-all duration-150 cursor-pointer">
              <div className="space-y-3.5">
                <div className="w-9 h-9 rounded-[8px] bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center text-[#1C1917] group-hover:bg-[#EFF6FF] group-hover:border-[#BFDBFE] transition-colors">
                  <Cpu className="w-4 h-4 text-[#1D4ED8]" />
                </div>
                <h3 className="editorial-h3 text-[18px] group-hover:text-[#1D4ED8] transition-colors">
                  Tích hợp ERP &amp; Kế toán
                </h3>
                <p className="editorial-small text-[14px] leading-relaxed">
                  Đồng bộ hai chiều dữ liệu khách hàng, hóa đơn và hợp đồng với MISA, FAST, Bravo, SAP thông qua Open API.
                </p>
              </div>
              <span className="text-[13px] font-semibold text-[#1D4ED8] inline-flex items-center gap-1">
                <span>Chuẩn REST API</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
              </span>
            </div>
          </FadeIn>
        </div>

        {/* Card 6 (Small - Col 10-12 on md / lg:col-span-3) */}
        <div className="md:col-span-6 lg:col-span-3">
          <FadeIn stagger={4}>
            <div className="editorial-card group p-7 h-full flex flex-col justify-between space-y-6 hover:border-[#D6D3D1] hover:shadow-[0_4px_20px_rgba(28,25,23,0.03)] transition-all duration-150 cursor-pointer">
              <div className="space-y-3.5">
                <div className="w-9 h-9 rounded-[8px] bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center text-[#1C1917] group-hover:bg-[#EFF6FF] group-hover:border-[#BFDBFE] transition-colors">
                  <Smartphone className="w-4 h-4 text-[#1D4ED8]" />
                </div>
                <h3 className="editorial-h3 text-[18px] group-hover:text-[#1D4ED8] transition-colors">
                  Ứng dụng Mobile cho Sales
                </h3>
                <p className="editorial-small text-[14px] leading-relaxed">
                  Tra cứu lịch sử khách hàng, cập nhật nhanh biên bản họp và duyệt báo giá ngay trên điện thoại khi đi thị trường.
                </p>
              </div>
              <span className="text-[13px] font-semibold text-[#1D4ED8] inline-flex items-center gap-1">
                <span>iOS &amp; Android</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
              </span>
            </div>
          </FadeIn>
        </div>
      </div>
    </EditorialSection>
  );
};

export default SecondaryBentoSection;
