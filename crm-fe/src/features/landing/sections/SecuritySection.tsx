import React from 'react';
import { Lock, Server, History, ShieldCheck, AlertCircle } from 'lucide-react';
import { EditorialSection } from '../components/EditorialSection';
import { FadeIn } from '../components/FadeIn';

const securityBlocks = [
  {
    icon: Lock,
    title: 'Phân quyền chi tiết (RBAC)',
    description:
      'Kiểm soát nghiêm ngặt quyền xem, sửa, xóa và xuất danh bạ khách hàng đến từng trường thông tin theo đúng cấp bậc.',
  },
  {
    icon: Server,
    title: 'Phân vùng dữ liệu chi nhánh',
    description:
      'Dữ liệu của các chi nhánh và công ty con được cô lập hoàn toàn, hỗ trợ chế độ tổng hợp báo cáo cấp tập đoàn an toàn.',
  },
  {
    icon: History,
    title: 'Nhật ký kiểm toán bất biến',
    description:
      'Lưu trữ toàn bộ lịch sử chỉnh sửa giá, hợp đồng, điều chỉnh chiết khấu và phiên truy cập của từng tài khoản nhân sự.',
  },
  {
    icon: ShieldCheck,
    title: 'Mã hóa & Sao lưu tự động',
    description:
      'Mã hóa dữ liệu chuẩn AES-256 ở trạng thái lưu trữ và TLS 1.3 khi truyền tải. Tự động sao lưu định kỳ hàng ngày.',
  },
];

export const SecuritySection: React.FC = () => {
  return (
    <EditorialSection id="security" isDark className="py-20 sm:py-28 w-full">
      <FadeIn>
        <div className="max-w-2xl">
          <p className="text-[12px] uppercase tracking-[0.08em] font-semibold text-[#A8A29E] flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 bg-[#BFDBFE] inline-block shrink-0" />
            An toàn &amp; Quản trị dữ liệu
          </p>
          <h2 className="editorial-h2 text-white">
            Bảo mật cấp doanh nghiệp và kiểm soát dữ liệu tuyệt đối
          </h2>
          <p className="editorial-body text-[#A8A29E] text-[17px] mt-3">
            Chúng tôi hiểu rằng dữ liệu khách hàng và biểu giá là tài sản sống còn của doanh nghiệp B2B.
          </p>
        </div>
      </FadeIn>

      {/* 4 Security Pods with Hover Illumination */}
      <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityBlocks.map((block, index) => {
          const Icon = block.icon;
          return (
            <FadeIn key={block.title} stagger={((index + 1) as 1 | 2 | 3 | 4)}>
              <div className="group p-7 rounded-[12px] border border-[#292524] bg-[#292524]/40 hover:border-[#57534E] hover:bg-[#292524]/70 transition-all duration-150 space-y-4 h-full flex flex-col justify-between cursor-default">
                <div className="space-y-3.5">
                  <div className="w-9 h-9 rounded-[8px] bg-[#1C1917] border border-[#44403C] group-hover:border-[#BFDBFE] flex items-center justify-center text-[#FAFAF9] transition-colors">
                    <Icon className="w-4 h-4 text-[#BFDBFE]" />
                  </div>
                  <h3 className="font-semibold text-[18px] text-white group-hover:text-[#BFDBFE] transition-colors">
                    {block.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-[#A8A29E]">
                    {block.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>

      {/* Centered Frameless Compliance Roadmap Notice */}
      <FadeIn stagger={3}>
        <div className="mt-14 pt-2 flex items-center justify-center text-center max-w-4xl mx-auto">
          <p className="text-[13px] sm:text-[14px] text-[#A8A29E] leading-relaxed flex flex-wrap items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#BFDBFE] shrink-0 inline" />
            <span>
              <strong className="text-white font-semibold">Lộ trình chứng chỉ:</strong> Hệ thống tuân thủ kiến trúc an toàn quốc tế, đang trong lộ trình hoàn thiện đánh giá chứng chỉ ISO 27001 &amp; SOC 2 Type II trong năm 2026.
            </span>
          </p>
        </div>
      </FadeIn>
    </EditorialSection>
  );
};

export default SecuritySection;
