import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { EditorialSection } from '../components/EditorialSection';
import { EditorialEyebrow } from '../components/EditorialEyebrow';
import { FadeIn } from '../components/FadeIn';

export const CoreSolutionsSection: React.FC = () => {
  // Active Kanban column
  const [activeCol, setActiveCol] = useState<number>(0);

  return (
    <EditorialSection id="solutions" className="py-24 sm:py-36 w-full">
      <div className="space-y-32 sm:space-y-44 lg:space-y-52 w-full">
        {/* ====================================================================
            BLOCK 1: Pipeline 360° (Text Left, Clean & Modern Minimalist Mockup Right)
            ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <FadeIn>
              <EditorialEyebrow>Quản trị Pipeline</EditorialEyebrow>
              <h2 className="editorial-h2">
                Theo dõi tiến độ từng deal theo thời gian thực
              </h2>
            </FadeIn>

            <FadeIn stagger={1}>
              <p className="editorial-body text-[17px] text-[#57534E]">
                Phân loại cơ hội kinh doanh theo từng giai đoạn chuẩn hóa. Giúp nhân viên biết chính xác việc cần làm tiếp theo và lãnh đạo nắm chắc doanh thu dự kiến.
              </p>
            </FadeIn>

            <FadeIn stagger={2}>
              <ul className="space-y-3.5 text-[15px] text-[#57534E]">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#15803D] shrink-0 mt-1" />
                  <span>Tùy biến các bước bán hàng theo đặc thù từng ngành hàng</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#15803D] shrink-0 mt-1" />
                  <span>Cảnh báo deal tồn đọng quá 7 ngày chưa có trao đổi mới</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#15803D] shrink-0 mt-1" />
                  <span>Tự động tính xác suất chốt dựa trên checklist hoàn thành</span>
                </li>
              </ul>
            </FadeIn>

            <FadeIn stagger={3}>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1D4ED8] hover:text-[#1E40AF] transition-colors group"
              >
                <span>Xem chi tiết tính năng pipeline</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
              </Link>
            </FadeIn>
          </div>

          {/* Right Mockup (Clean, Minimalist & Modern Pipeline Board) */}
          <div className="lg:col-span-7 w-full">
            <FadeIn stagger={2}>
              <div className="editorial-mockup bg-white p-6 sm:p-7 space-y-6">
                {/* Clean Minimalist Header */}
                <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                    <span className="text-[14px] font-semibold text-[#1C1917]">Pipeline Bán hàng</span>
                  </div>
                  <span className="font-mono text-[13px] text-[#57534E] tabular-nums">
                    Tổng 3 giai đoạn · <strong className="text-[#1C1917] font-semibold">4.50B ₫</strong>
                  </span>
                </div>

                {/* 3 Balanced Minimalist Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Column 1 */}
                  <div
                    onClick={() => setActiveCol(0)}
                    className={`p-4 rounded-[10px] border transition-all duration-150 cursor-pointer space-y-4 ${
                      activeCol === 0
                        ? 'bg-[#EFF6FF]/50 border-[#BFDBFE] shadow-[0_2px_8px_rgba(29,78,216,0.06)]'
                        : 'bg-[#FAFAF9] border-[#E7E5E4] hover:border-[#D6D3D1]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[12px] border-b border-[#E7E5E4]/80 pb-2.5">
                      <span className="font-semibold text-[#1C1917]">1. Đề xuất giá</span>
                      <span className="font-mono text-[#57534E] tabular-nums">1.25B ₫</span>
                    </div>

                    <div className="p-3.5 rounded-[8px] bg-white border border-[#E7E5E4] shadow-2xs space-y-2.5">
                      <p className="font-semibold text-[13px] text-[#1C1917]">Dược phẩm Vimed</p>
                      <p className="font-mono text-[14px] font-semibold text-[#1D4ED8] tabular-nums">
                        1.250.000.000 ₫
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-[#78716C] pt-1.5 border-t border-[#F5F5F4]">
                        <span>Tuấn N.M.</span>
                        <span className="font-semibold text-[#15803D]">75% xác suất</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div
                    onClick={() => setActiveCol(1)}
                    className={`p-4 rounded-[10px] border transition-all duration-150 cursor-pointer space-y-4 ${
                      activeCol === 1
                        ? 'bg-[#EFF6FF]/50 border-[#BFDBFE] shadow-[0_2px_8px_rgba(29,78,216,0.06)]'
                        : 'bg-[#FAFAF9] border-[#E7E5E4] hover:border-[#D6D3D1]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[12px] border-b border-[#E7E5E4]/80 pb-2.5">
                      <span className="font-semibold text-[#1C1917]">2. Đàm phán</span>
                      <span className="font-mono text-[#57534E] tabular-nums">850M ₫</span>
                    </div>

                    <div className="p-3.5 rounded-[8px] bg-white border border-[#E7E5E4] shadow-2xs space-y-2.5">
                      <p className="font-semibold text-[13px] text-[#1C1917]">Logistics Tân Cảng</p>
                      <p className="font-mono text-[14px] font-semibold text-[#1D4ED8] tabular-nums">
                        850.000.000 ₫
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-[#78716C] pt-1.5 border-t border-[#F5F5F4]">
                        <span>Lan T.H.</span>
                        <span className="font-semibold text-[#15803D]">85% xác suất</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div
                    onClick={() => setActiveCol(2)}
                    className={`p-4 rounded-[10px] border transition-all duration-150 cursor-pointer space-y-4 ${
                      activeCol === 2
                        ? 'bg-[#EFF6FF]/50 border-[#BFDBFE] shadow-[0_2px_8px_rgba(29,78,216,0.06)]'
                        : 'bg-[#FAFAF9] border-[#E7E5E4] hover:border-[#D6D3D1]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[12px] border-b border-[#E7E5E4]/80 pb-2.5">
                      <span className="font-semibold text-[#1C1917]">3. Hợp đồng</span>
                      <span className="font-mono text-[#57534E] tabular-nums">2.40B ₫</span>
                    </div>

                    <div className="p-3.5 rounded-[8px] bg-white border border-[#E7E5E4] shadow-2xs space-y-2.5">
                      <p className="font-semibold text-[13px] text-[#1C1917]">Bất động sản An Gia</p>
                      <p className="font-mono text-[14px] font-semibold text-[#1D4ED8] tabular-nums">
                        2.400.000.000 ₫
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-[#78716C] pt-1.5 border-t border-[#F5F5F4]">
                        <span>Bảo L.Q.</span>
                        <span className="font-semibold text-[#1D4ED8]">Đang ký số</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* ====================================================================
            BLOCK 2: Hợp đồng & Audit Log (Text Left, Mockup Right)
            ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <FadeIn>
              <EditorialEyebrow>Hợp đồng &amp; Audit Log</EditorialEyebrow>
              <h2 className="editorial-h2">
                Lưu trữ hợp đồng tập trung và minh bạch lịch sử giao dịch
              </h2>
            </FadeIn>

            <FadeIn stagger={1}>
              <p className="editorial-body text-[17px] text-[#57534E]">
                Toàn bộ hợp đồng, phụ lục và trạng thái ký kết được gắn liền với hồ sơ khách hàng. Mọi thay đổi dữ liệu quan trọng đều được ghi nhật ký kiểm toán không thể sửa xóa.
              </p>
            </FadeIn>

            <FadeIn stagger={2}>
              <ul className="space-y-3.5 text-[15px] text-[#57534E]">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#15803D] shrink-0 mt-1" />
                  <span>Quản lý tiến độ ký số, thời hạn hợp đồng và tự động cảnh báo tái ký</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#15803D] shrink-0 mt-1" />
                  <span>Nhật ký kiểm toán ghi lại chi tiết: ai sửa, sửa lúc nào, giá trị cũ/mới</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#15803D] shrink-0 mt-1" />
                  <span>Phân quyền xem và xuất hợp đồng theo chi nhánh và cấp bậc nhân sự</span>
                </li>
              </ul>
            </FadeIn>

            <FadeIn stagger={3}>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1D4ED8] hover:text-[#1E40AF] transition-colors group"
              >
                <span>Tìm hiểu thêm về nhật ký kiểm toán</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
              </Link>
            </FadeIn>
          </div>

          {/* Right Mockup (Audit Log Table) */}
          <div className="lg:col-span-7 w-full">
            <FadeIn stagger={2}>
              <div className="editorial-mockup bg-white p-6 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4 text-[13px]">
                  <span className="font-semibold text-[#1C1917]">Nhật ký kiểm toán &amp; Thay đổi trạng thái</span>
                  <span className="font-mono text-[12px] text-[#15803D] bg-[#F0FDF4] px-2.5 py-0.5 rounded-[4px] border border-[#DCFCE7] font-semibold">
                    Bất biến 100%
                  </span>
                </div>

                {/* Log Entries Table with Hover Details */}
                <div className="space-y-2.5 text-[12px]">
                  <div className="p-3 rounded-[6px] border border-[#E7E5E4] bg-[#FAFAF9] hover:border-[#BFDBFE] hover:bg-[#EFF6FF]/30 transition-colors flex items-center justify-between gap-3 cursor-default">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[#1C1917]">Duyệt chiết khấu hợp đồng #HD-8902</p>
                      <p className="text-[11px] text-[#78716C]">Thực hiện bởi: Trần Văn Hùng (Giám đốc kinh doanh)</p>
                    </div>
                    <span className="font-mono text-[#57534E] tabular-nums text-[11px] font-medium">14:22 · Hôm nay</span>
                  </div>

                  <div className="p-3 rounded-[6px] border border-[#E7E5E4] bg-[#FAFAF9] hover:border-[#BFDBFE] hover:bg-[#EFF6FF]/30 transition-colors flex items-center justify-between gap-3 cursor-default">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[#1C1917]">Ký số thành công qua VNPT-CA</p>
                      <p className="text-[11px] text-[#78716C]">Đại diện KH: Ông Phạm Quốc Bảo (Tổng giám đốc)</p>
                    </div>
                    <span className="font-mono text-[#57534E] tabular-nums text-[11px] font-medium">11:05 · Hôm nay</span>
                  </div>

                  <div className="p-3 rounded-[6px] border border-[#E7E5E4] bg-[#FAFAF9] hover:border-[#BFDBFE] hover:bg-[#EFF6FF]/30 transition-colors flex items-center justify-between gap-3 cursor-default">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[#1C1917]">Cập nhật giá trị deal: 1.10B ₫ &rarr; 1.25B ₫</p>
                      <p className="text-[11px] text-[#78716C]">Thực hiện bởi: Nguyễn Minh Tuấn (Senior AE)</p>
                    </div>
                    <span className="font-mono text-[#57534E] tabular-nums text-[11px] font-medium">09:40 · Hôm nay</span>
                  </div>

                  <div className="p-3 rounded-[6px] border border-[#E7E5E4] bg-[#FAFAF9] hover:border-[#BFDBFE] hover:bg-[#EFF6FF]/30 transition-colors flex items-center justify-between gap-3 cursor-default">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[#1C1917]">Tạo hồ sơ khách hàng mới (MST: 0314892019)</p>
                      <p className="text-[11px] text-[#78716C]">Tự động đồng bộ từ nguồn Web Ingestion</p>
                    </div>
                    <span className="font-mono text-[#57534E] tabular-nums text-[11px] font-medium">08:15 · Hôm nay</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </EditorialSection>
  );
};

export default CoreSolutionsSection;
