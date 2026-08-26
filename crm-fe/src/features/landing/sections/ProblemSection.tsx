import React from 'react';
import { Clock, Database, BarChart2 } from 'lucide-react';
import { EditorialSection } from '../components/EditorialSection';
import { EditorialEyebrow } from '../components/EditorialEyebrow';
import { FadeIn } from '../components/FadeIn';

const painPoints = [
  {
    step: '01',
    icon: Clock,
    title: 'Báo giá chờ duyệt thủ công qua Zalo và Excel',
    description:
      'Nhân viên tính chiết khấu thủ công và gửi file qua tin nhắn. Khi người duyệt bận họp hoặc đi công tác, báo giá bị chậm trễ khiến khách hàng tìm sang nhà cung cấp khác.',
  },
  {
    step: '02',
    icon: Database,
    title: 'Dữ liệu khách hàng phân tán theo từng nhân sự',
    description:
      'Lịch sử trao đổi, danh bạ người liên hệ và báo giá cũ lưu trên máy tính cá nhân. Khi nhân viên kinh doanh chuyển việc, công ty mất toàn bộ thông tin quan hệ khách hàng.',
  },
  {
    step: '03',
    icon: BarChart2,
    title: 'Lãnh đạo không nắm được pipeline thực tế',
    description:
      'Báo cáo doanh thu hàng tuần phụ thuộc vào cảm tính của đội ngũ. Doanh nghiệp không biết chính xác deal nào có khả năng chốt và deal nào đang bị tắc nghẽn.',
  },
];

export const ProblemSection: React.FC = () => {
  return (
    <EditorialSection id="problem" className="w-full">
      <FadeIn>
        <div className="max-w-2xl">
          <EditorialEyebrow>Vấn đề vận hành</EditorialEyebrow>
          <h2 className="editorial-h2">
            Ba rào cản phổ biến khiến doanh nghiệp B2B mất hợp đồng
          </h2>
        </div>
      </FadeIn>

      <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {painPoints.map((item, index) => {
          const Icon = item.icon;
          return (
            <FadeIn key={item.title} stagger={((index + 1) as 1 | 2 | 3)}>
              <div className="editorial-card group p-8 sm:p-10 h-full flex flex-col justify-between space-y-6 hover:border-[#D6D3D1] hover:shadow-[0_4px_24px_rgba(28,25,23,0.04)] transition-all duration-150 cursor-default">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-[8px] bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center text-[#1C1917] group-hover:scale-105 group-hover:border-[#BFDBFE] group-hover:bg-[#EFF6FF] transition-all duration-150">
                      <Icon className="w-5 h-5 text-[#1D4ED8]" />
                    </div>
                    <span className="font-mono text-[13px] font-semibold text-[#A8A29E] group-hover:text-[#1C1917] transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="editorial-h3 text-[21px] group-hover:text-[#1D4ED8] transition-colors duration-150">
                    {item.title}
                  </h3>
                </div>
                <p className="editorial-body text-[16px] text-[#57534E] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </EditorialSection>
  );
};

export default ProblemSection;
