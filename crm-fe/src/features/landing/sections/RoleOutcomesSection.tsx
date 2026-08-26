import React, { useState } from 'react';
import { Check, BarChart3, Users, Target } from 'lucide-react';
import { EditorialSection } from '../components/EditorialSection';
import { EditorialEyebrow } from '../components/EditorialEyebrow';
import { FadeIn } from '../components/FadeIn';

interface RoleTab {
  id: string;
  label: string;
  icon: React.ElementType;
  roleTitle: string;
  description: string;
  points: string[];
  mockup: {
    title: string;
    kpis: { label: string; value: string }[];
    highlight: string;
  };
}

const roleTabs: RoleTab[] = [
  {
    id: 'executive',
    label: 'Ban lãnh đạo (C-Level)',
    icon: BarChart3,
    roleTitle: 'Kiểm soát doanh thu thực và bảo vệ biên lợi nhuận',
    description:
      'Nắm bắt bức tranh toàn cảnh về hiệu suất kinh doanh trên toàn bộ các chi nhánh, loại bỏ hoàn toàn tình trạng báo cáo cảm tính.',
    points: [
      'Dự báo doanh thu chính xác dựa trên trọng số tiến độ deal thực tế',
      'Kiểm soát 100% các trường hợp chiết khấu ngoại lệ qua ma trận phân quyền',
      'Đánh giá hiệu suất nhân sự và chi nhánh theo thời gian thực',
    ],
    mockup: {
      title: 'Bảng điều khiển Giám đốc điều hành',
      kpis: [
        { label: 'Doanh thu Q3 dự kiến', value: '18.4 tỷ ₫' },
        { label: 'Tỷ lệ đạt chỉ tiêu', value: '112% Quota' },
        { label: 'Chiết khấu TB toàn đội', value: '6.4% (An toàn)' },
      ],
      highlight: '0 deal vượt hạn mức chiết khấu chưa được phê duyệt',
    },
  },
  {
    id: 'manager',
    label: 'Trưởng phòng kinh doanh',
    icon: Users,
    roleTitle: 'Tối ưu tốc độ xử lý deal và điều phối đội ngũ',
    description:
      'Phát hiện sớm các cơ hội bị tắc nghẽn, tự động hóa phân bổ khách hàng và rút ngắn thời gian phê duyệt báo giá cho nhân viên.',
    points: [
      'Phê duyệt báo giá 1 chạm ngay trên điện thoại khi đi thị trường',
      'Tự động phân chia Lead mới công bằng theo khu vực và chuyên môn',
      'Theo dõi lịch sử tương tác và nhắc nhở nhân viên chăm sóc deal đúng hạn',
    ],
    mockup: {
      title: 'Giám sát vận hành Đội ngũ Bán hàng',
      kpis: [
        { label: 'Thời gian duyệt TB', value: '11.5 phút' },
        { label: 'Deal đang mở', value: '34 cơ hội' },
        { label: 'Tốc độ chốt trung bình', value: '18 ngày' },
      ],
      highlight: '4 báo giá đang chờ duyệt chiết khấu trong ngày',
    },
  },
  {
    id: 'sales',
    label: 'Nhân viên kinh doanh (Sales)',
    icon: Target,
    roleTitle: 'Tạo báo giá nhanh và chốt hợp đồng dễ dàng hơn',
    description:
      'Tập trung toàn bộ thời gian vào việc tư vấn khách hàng thay vì mất hàng giờ soạn file Excel và chờ sếp duyệt giá qua tin nhắn.',
    points: [
      'Tạo báo giá chuẩn xác trong 3 phút từ danh mục bảng giá có sẵn',
      'Không bao giờ quên lịch hẹn hoặc nhiệm vụ nhờ hệ thống nhắc việc tự động',
      'Theo dõi minh bạch tiến độ phê duyệt và hoa hồng của từng hợp đồng',
    ],
    mockup: {
      title: 'Giao diện làm việc của Sales Representative',
      kpis: [
        { label: 'Chỉ tiêu tháng cá nhân', value: '450 triệu ₫' },
        { label: 'Đã hoàn thành', value: '380 triệu ₫ (84%)' },
        { label: 'Deal cần tương tác hôm nay', value: '5 khách hàng' },
      ],
      highlight: 'Báo giá #BG-2026-089 đã được sếp duyệt qua app',
    },
  },
];

export const RoleOutcomesSection: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState<string>('executive');

  const activeRole = roleTabs.find((r) => r.id === activeTabId) || roleTabs[0];

  return (
    <EditorialSection id="roles">
      <FadeIn>
        <div className="max-w-2xl">
          <EditorialEyebrow>Giá trị theo vai trò</EditorialEyebrow>
          <h2 className="editorial-h2">
            Thiết kế riêng cho từng vị trí trong bộ máy thương mại
          </h2>
        </div>
      </FadeIn>

      {/* Horizontal Tabs Control */}
      <FadeIn stagger={1}>
        <div className="mt-10 sm:mt-14 flex border-b border-[#E7E5E4] overflow-x-auto gap-3 sm:gap-10">
          {roleTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`pb-4 px-2 text-[15px] sm:text-[16px] font-semibold flex items-center gap-2.5 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#1D4ED8] text-[#1C1917]'
                    : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1D4ED8]' : 'text-[#A8A29E]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* Tab Content Display */}
      <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left: 3 Benefit Bullets */}
        <div className="lg:col-span-6 space-y-6">
          <FadeIn>
            <h3 className="editorial-h3 text-[24px]">
              {activeRole.roleTitle}
            </h3>
            <p className="editorial-body text-[17px] text-[#57534E] mt-3">
              {activeRole.description}
            </p>
          </FadeIn>

          <FadeIn stagger={1}>
            <ul className="space-y-4 text-[15px] sm:text-[16px] text-[#57534E]">
              {activeRole.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#15803D] shrink-0 mt-1" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>

        {/* Right: Rich Role Mockup */}
        <div className="lg:col-span-6">
          <FadeIn stagger={2}>
            <div className="editorial-mockup bg-white p-7 space-y-5 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_16px_40px_rgba(28,25,23,0.07)]">
              <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4 text-[13px]">
                <span className="font-semibold text-[#1C1917]">{activeRole.mockup.title}</span>
                <span className="text-[12px] font-mono text-[#15803D] bg-[#F0FDF4] px-2.5 py-0.5 rounded-[4px] font-semibold">
                  Cập nhật thời gian thực
                </span>
              </div>

              {/* 3 KPI Pods */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {activeRole.mockup.kpis.map((kpi) => (
                  <div key={kpi.label} className="p-3.5 rounded-[8px] bg-[#FAFAF9] border border-[#E7E5E4]">
                    <p className="text-[11px] text-[#78716C] truncate font-medium">{kpi.label}</p>
                    <p className="font-mono text-[14px] sm:text-[15px] font-semibold text-[#1C1917] mt-1 tabular-nums">
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status Highlight Bar */}
              <div className="p-3.5 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] text-[13px] text-[#1D4ED8] font-semibold flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                <span>{activeRole.mockup.highlight}</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </EditorialSection>
  );
};

export default RoleOutcomesSection;
