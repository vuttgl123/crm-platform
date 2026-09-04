import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Phone, Mail, Loader2, AlertCircle } from 'lucide-react';
import { EditorialSection } from '../components/EditorialSection';
import { FadeIn } from '../components/FadeIn';

const demoSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ và tên đầy đủ'),
  workEmail: z.string().email('Vui lòng nhập địa chỉ email công ty hợp lệ'),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không đúng định dạng Việt Nam'),
  companyName: z.string().min(2, 'Vui lòng nhập tên công ty hoặc tổ chức'),
  companySize: z.enum(['under_15', '15_to_50', '50_to_150', 'above_150'], {
    errorMap: () => ({ message: 'Vui lòng chọn quy mô đội ngũ' }),
  }),
  industry: z.enum(
    ['manufacturing', 'pharma', 'realestate', 'logistics', 'tech_services', 'other'],
    { errorMap: () => ({ message: 'Vui lòng chọn ngành nghề kinh doanh' }) }
  ),
  primaryNeed: z.enum(
    ['pipeline_360', 'cpq_approval', 'contracts_audit', 'all_features'],
    { errorMap: () => ({ message: 'Vui lòng chọn nhu cầu trọng tâm' }) }
  ),
  message: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

type DemoFormData = z.infer<typeof demoSchema>;

export const DemoCtaSection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'success'>('idle');
  const [submittedData, setSubmittedData] = useState<DemoFormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      companySize: '15_to_50',
      industry: 'manufacturing',
      primaryNeed: 'all_features',
    },
  });

  // Automatically capture UTM parameters from URL
  useEffect(() => {
    const source = searchParams.get('utm_source') || '';
    const medium = searchParams.get('utm_medium') || '';
    const campaign = searchParams.get('utm_campaign') || '';

    if (source) setValue('utm_source', source);
    if (medium) setValue('utm_medium', medium);
    if (campaign) setValue('utm_campaign', campaign);
  }, [searchParams, setValue]);

  const onSubmit = async (data: DemoFormData) => {
    setStatus('submitting');
    try {
      // Simulate real API submission
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmittedData(data);
      setStatus('success');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <EditorialSection id="demo" isDark className="py-24 sm:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Value Proposition & Timeline */}
        <div className="lg:col-span-5 space-y-8">
          <FadeIn>
            <p className="text-[12px] uppercase tracking-[0.08em] font-semibold text-[#A8A29E] flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-[#BFDBFE] inline-block shrink-0" />
              Tư vấn &amp; Trải nghiệm thực tế
            </p>
            <h2 className="editorial-h2 text-white">
              Đặt lịch tư vấn giải pháp và trải nghiệm demo 1:1
            </h2>
            <p className="editorial-body text-[#A8A29E] text-[17px] mt-4">
              Trải nghiệm trực tiếp luồng quản trị pipeline và ma trận duyệt báo giá CPQ được cấu hình riêng theo quy trình của doanh nghiệp bạn.
            </p>
          </FadeIn>

          {/* 3-Step Consultation Timeline */}
          <FadeIn stagger={1}>
            <div className="space-y-6 pt-4 border-t border-[#292524]">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#292524] border border-[#44403C] flex items-center justify-center text-white text-[13px] font-mono font-semibold shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-[16px] font-semibold text-white">Khảo sát hiện trạng (15 phút)</h4>
                  <p className="text-[14px] text-[#A8A29E] leading-relaxed">
                    Trao đổi nhanh về quy trình bán hàng, cơ cấu đội ngũ và những điểm nghẽn duyệt giá hiện tại.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#292524] border border-[#44403C] flex items-center justify-center text-white text-[13px] font-mono font-semibold shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-[16px] font-semibold text-white">Demo theo quy trình của bạn</h4>
                  <p className="text-[14px] text-[#A8A29E] leading-relaxed">
                    Trình diễn cách VUM CRM giải quyết bài toán quản trị giá, phân quyền và kiểm toán dữ liệu.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#292524] border border-[#44403C] flex items-center justify-center text-white text-[13px] font-mono font-semibold shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-[16px] font-semibold text-white">Kế hoạch triển khai &amp; Thử nghiệm</h4>
                  <p className="text-[14px] text-[#A8A29E] leading-relaxed">
                    Nhận tài liệu đề xuất giải pháp, báo giá chi tiết và lộ trình thử nghiệm 14 ngày miễn phí.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Contact Details */}
          <FadeIn stagger={2}>
            <div className="pt-6 border-t border-[#292524] flex flex-col sm:flex-row gap-6 text-[14px] text-[#A8A29E]">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#BFDBFE]" />
                <span className="text-white font-mono font-semibold tabular-nums">0909.123.456</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#BFDBFE]" />
                <span className="text-white font-medium">sales@vumcrm.vn</span>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Right Column: Elevated White Form (Radius 12px) */}
        <div className="lg:col-span-7">
          <FadeIn stagger={1}>
            <div className="rounded-[12px] bg-white border border-[#E7E5E4] p-8 sm:p-12 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_24px_56px_rgba(28,25,23,0.12)] text-[#1C1917]">
              {status === 'success' && submittedData ? (
                /* Success Confirmation Screen */
                <div className="py-8 text-left space-y-6">
                  <div className="w-14 h-14 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#15803D]">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="editorial-h3 text-[24px]">
                      Đăng ký tư vấn thành công!
                    </h3>
                    <p className="editorial-body text-[16px] mt-2">
                      Cảm ơn <strong>{submittedData.fullName}</strong>. Chuyên gia giải pháp của chúng tôi sẽ liên hệ với bạn qua số điện thoại <strong>{submittedData.phone}</strong> hoặc email <strong>{submittedData.workEmail}</strong> trong vòng 1 ngày làm việc.
                    </p>
                  </div>

                  <div className="p-4 rounded-[8px] bg-[#FAFAF9] border border-[#E7E5E4] text-[14px] space-y-1.5 text-[#57534E]">
                    <p><strong>Doanh nghiệp:</strong> {submittedData.companyName}</p>
                    <p><strong>Nhu cầu trọng tâm:</strong> Đã ghi nhận để chuẩn bị kịch bản demo riêng</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="editorial-btn-secondary text-[14px] h-10 px-5"
                  >
                    Đăng ký lịch hẹn khác
                  </button>
                </div>
              ) : (
                /* Main Form */
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="border-b border-[#E7E5E4] pb-4">
                    <h3 className="font-semibold text-[19px] text-[#1C1917]">
                      Điền thông tin đặt lịch Demo
                    </h3>
                    <p className="text-[13px] text-[#78716C] mt-1">
                      Cam kết bảo mật thông tin và không gửi email quảng cáo.
                    </p>
                  </div>

                  {status === 'error' && (
                    <div className="p-3.5 rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-[13px] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Có lỗi xảy ra trong quá trình gửi. Vui lòng liên hệ hotline 0909.123.456 để được hỗ trợ ngay.</span>
                    </div>
                  )}

                  {/* 2 Cols: Họ tên & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-[#1C1917]">
                        Họ và tên <span className="text-[#B91C1C]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        {...register('fullName')}
                        className="w-full h-11 px-3.5 rounded-[8px] border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                      />
                      {errors.fullName && (
                        <p className="text-[12px] text-[#B91C1C]">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-[#1C1917]">
                        Email công ty <span className="text-[#B91C1C]">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="a.nguyen@company.com"
                        {...register('workEmail')}
                        className="w-full h-11 px-3.5 rounded-[8px] border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                      />
                      {errors.workEmail && (
                        <p className="text-[12px] text-[#B91C1C]">{errors.workEmail.message}</p>
                      )}
                    </div>
                  </div>

                  {/* 2 Cols: Số điện thoại & Tên công ty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-[#1C1917]">
                        Số điện thoại <span className="text-[#B91C1C]">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="0912 345 678"
                        {...register('phone')}
                        className="w-full h-11 px-3.5 rounded-[8px] border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                      />
                      {errors.phone && (
                        <p className="text-[12px] text-[#B91C1C]">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-[#1C1917]">
                        Tên doanh nghiệp <span className="text-[#B91C1C]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Công ty CP ABC Việt Nam"
                        {...register('companyName')}
                        className="w-full h-11 px-3.5 rounded-[8px] border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                      />
                      {errors.companyName && (
                        <p className="text-[12px] text-[#B91C1C]">{errors.companyName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* 2 Cols: Quy mô đội sales & Ngành nghề */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-[#1C1917]">
                        Quy mô đội ngũ sales
                      </label>
                      <select
                        {...register('companySize')}
                        className="w-full h-11 px-3.5 rounded-[8px] border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                      >
                        <option value="under_15">Dưới 15 nhân sự</option>
                        <option value="15_to_50">15 – 50 nhân sự</option>
                        <option value="50_to_150">50 – 150 nhân sự</option>
                        <option value="above_150">Trên 150 nhân sự</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-[#1C1917]">
                        Ngành nghề kinh doanh
                      </label>
                      <select
                        {...register('industry')}
                        className="w-full h-11 px-3.5 rounded-[8px] border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                      >
                        <option value="manufacturing">Sản xuất &amp; Phân phối</option>
                        <option value="pharma">Dược phẩm &amp; Y tế</option>
                        <option value="realestate">Bất động sản &amp; Xây dựng</option>
                        <option value="logistics">Logistics &amp; Vận tải</option>
                        <option value="tech_services">Công nghệ &amp; Dịch vụ B2B</option>
                        <option value="other">Ngành nghề khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Nhu cầu trọng tâm */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-[#1C1917]">
                      Nhu cầu trọng tâm cần giải quyết
                    </label>
                    <select
                      {...register('primaryNeed')}
                      className="w-full h-11 px-3.5 rounded-[8px] border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                    >
                      <option value="all_features">Tất cả: Pipeline 360° + Báo giá CPQ + Quản trị</option>
                      <option value="cpq_approval">Tự động hóa báo giá &amp; Duyệt chiết khấu nhanh</option>
                      <option value="pipeline_360">Quản trị Pipeline &amp; Tập trung dữ liệu khách hàng</option>
                      <option value="contracts_audit">Kho hợp đồng &amp; Nhật ký kiểm toán phân quyền</option>
                    </select>
                  </div>

                  {/* Lời nhắn bổ sung */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-[#1C1917]">
                      Ghi chú hoặc yêu cầu riêng (không bắt buộc)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ví dụ: Cần tích hợp với phần mềm kế toán MISA, triển khai cho 3 chi nhánh..."
                      {...register('message')}
                      className="w-full p-3.5 rounded-[8px] border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Hidden UTM inputs */}
                  <input type="hidden" {...register('utm_source')} />
                  <input type="hidden" {...register('utm_medium')} />
                  <input type="hidden" {...register('utm_campaign')} />

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="editorial-btn-primary w-full h-12 text-[15px] font-semibold gap-2 disabled:opacity-70 shadow-[0_1px_2px_rgba(29,78,216,0.3)]"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang gửi thông tin...</span>
                        </>
                      ) : (
                        <>
                          <span>Xác nhận đăng ký Demo 1:1</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </EditorialSection>
  );
};

export default DemoCtaSection;
