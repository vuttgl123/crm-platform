import React, { useState } from 'react';
import { 
  Building2,
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  GitFork, 
  FileCheck2, 
  Lock
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SpotlightCard } from './SpotlightCard';

export const InteractiveSolutionShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('regional');

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        {/* Tab Selection Navigation */}
        <div className="flex justify-center">
          <TabsList className="bg-slate-200/90 p-1.5 h-auto rounded-2xl gap-2 max-w-2xl w-full grid grid-cols-3 shadow-inner">
            <TabsTrigger
              value="regional"
              className="text-xs sm:text-sm font-bold py-3 px-3 data-[state=active]:bg-white data-[state=active]:text-[#085AC0] data-[state=active]:shadow-md rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Mô hình</span> Đa Chi Nhánh
            </TabsTrigger>
            <TabsTrigger
              value="b2b"
              className="text-xs sm:text-sm font-bold py-3 px-3 data-[state=active]:bg-white data-[state=active]:text-[#085AC0] data-[state=active]:shadow-md rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Giao dịch</span> B2B Chu Kỳ Dài
            </TabsTrigger>
            <TabsTrigger
              value="governed"
              className="text-xs sm:text-sm font-bold py-3 px-3 data-[state=active]:bg-white data-[state=active]:text-[#085AC0] data-[state=active]:shadow-md rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Kiểm toán</span> &amp; Bảo Mật
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Regional Branch Model */}
        <TabsContent value="regional" className="m-0 focus-visible:outline-none">
          <SpotlightCard
            spotlightColor="rgba(8, 90, 192, 0.15)"
            className="rounded-3xl p-6 sm:p-10 border border-slate-200/90 bg-white shadow-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Context & Capabilities */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#085AC0] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    Mô hình đa vùng miền &amp; chi nhánh
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#07182B] landing-display leading-tight">
                    Quản Lý Doanh Thu Phân Tầng Toàn Quốc
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Phân định ranh giới xem và thao tác dữ liệu giữa các văn phòng đại diện Bắc - Trung - Nam mà không lo rò rỉ thông tin khách hàng nội bộ.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Sơ đồ cây đội nhóm (TEAM_TREE) tự động kế thừa phân quyền theo cấp bậc</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Tự động phân bổ Lead theo tỉnh thành và ranh giới địa lý kinh doanh</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Báo cáo doanh thu so sánh tức thì giữa các vùng miền thời gian thực</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild className="h-11 px-6 bg-[#085AC0] hover:bg-[#06499D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md">
                    <a href="#demo" className="flex items-center gap-2">
                      <span>Tư vấn mô hình chi nhánh</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Right Column: Visual Interactive Graphic with Real Photo */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl group">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                    alt="Multi-Branch Team Collaboration"
                    className="w-full h-48 sm:h-56 object-cover filter brightness-85 group-hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090F1A] via-[#090F1A]/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-left text-xs text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitFork className="w-4 h-4 text-blue-400" />
                        <span className="font-bold">Cây phân cấp dữ liệu (TEAM_TREE)</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        100% Cô lập
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                      <span>• Chi nhánh HN: 5.8 Tỷ ₫</span>
                      <span>• Chi nhánh HCM: 7.4 Tỷ ₫</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </TabsContent>

        {/* Tab 2: High-Value B2B Pipeline */}
        <TabsContent value="b2b" className="m-0 focus-visible:outline-none">
          <SpotlightCard
            spotlightColor="rgba(8, 90, 192, 0.15)"
            className="rounded-3xl p-6 sm:p-10 border border-slate-200/90 bg-white shadow-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#085AC0] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    Giao dịch giá trị lớn &amp; Chu kỳ dài
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#07182B] landing-display leading-tight">
                    Tăng Tốc Chu Kỳ Chốt Deal B2B
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Chuẩn hóa mọi nấc thang đàm phán từ tiếp cận ban đầu, thẩm định nhu cầu, phát hành báo giá nhiều phiên bản đến ký kết đơn hàng thương mại.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Báo giá thông minh hỗ trợ chiết khấu phân cấp, tự động tính tổng tiền và thuế</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Chuyển đổi 1-click từ Báo giá được duyệt sang Hợp đồng và Đơn hàng</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Cảnh báo deal tồn đọng quá 15 ngày tại một giai đoạn đàm phán</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild className="h-11 px-6 bg-[#085AC0] hover:bg-[#06499D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md">
                    <a href="#demo" className="flex items-center gap-2">
                      <span>Khám phá quy trình báo giá</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Right Column: Real Photo & Funnel Overlay */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl group">
                  <img
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80"
                    alt="B2B Enterprise Deal Room"
                    className="w-full h-48 sm:h-56 object-cover filter brightness-85 group-hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090F1A] via-[#090F1A]/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-left text-xs text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-blue-400" />
                        <span className="font-bold">Luồng chốt deal tốc độ 3.2x</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                        Won Rate: 84%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                      <span>• Đàm phán (85%)</span>
                      <span className="text-emerald-400 font-bold">• Ký hợp đồng (100%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </TabsContent>

        {/* Tab 3: Strict Audit & Governance */}
        <TabsContent value="governed" className="m-0 focus-visible:outline-none">
          <SpotlightCard
            spotlightColor="rgba(8, 90, 192, 0.15)"
            className="rounded-3xl p-6 sm:p-10 border border-slate-200/90 bg-white shadow-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#085AC0] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    Bảo mật &amp; Kiểm toán nội bộ
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#07182B] landing-display leading-tight">
                    Bảo Vệ Tài Sản Dữ Liệu Khách Hàng
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Lưu vết 100% mọi thao tác chỉnh sửa, xuất dữ liệu và truy cập, tuân thủ nghiêm ngặt các quy định an toàn thông tin và DSR dành cho doanh nghiệp lớn.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Phân quyền chi tiết tới từng nút thao tác (Thêm, Sửa, Xóa, Xuất file Excel)</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ghi nhận nhật ký kiểm toán không thể xóa sửa với mã hash bất biến</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Thu hồi quyền truy cập tức thì ngay khi nhân sự rời khỏi tổ chức</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild className="h-11 px-6 bg-[#085AC0] hover:bg-[#06499D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md">
                    <a href="#demo" className="flex items-center gap-2">
                      <span>Tư vấn chuẩn bảo mật</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Right Column: Real Server Photo & Audit Log */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl group">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80"
                    alt="Enterprise Cloud Data Center"
                    className="w-full h-48 sm:h-56 object-cover filter brightness-85 group-hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090F1A] via-[#090F1A]/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-left text-xs text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold">DSR Audit Stream (Thời gian thực)</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Tamper-Proof
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                      <span>• [DEAL.WON] hoang.nam@vum.vn • IP: 118.70.12.84</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveSolutionShowcase;
