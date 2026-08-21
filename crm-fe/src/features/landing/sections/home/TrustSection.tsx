import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, History, Database } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { SpotlightCard } from '../../components/SpotlightCard';

const trustPillars = [
  {
    icon: Lock,
    title: 'Phân quyền dữ liệu 4 cấp (RBAC)',
    description: 'Bảo mật chặt chẽ theo TENANT, TEAM_TREE, TEAM và OWN. Đảm bảo nhân sự chỉ tiếp cận đúng phạm vi dữ liệu được ủy quyền.',
    badge: 'Enterprise Security',
  },
  {
    icon: ShieldCheck,
    title: 'Nhật ký kiểm toán toàn diện',
    description: 'Truy vết 100% lịch sử chỉnh sửa, xuất dữ liệu và thay đổi trạng thái deal theo thời gian thực không thể chỉnh sửa.',
    badge: '100% Audit Trails',
  },
  {
    icon: History,
    title: 'Bảo vệ quyền riêng tư & DSR',
    description: 'Tuân thủ chính sách bảo vệ dữ liệu, hỗ trợ yêu cầu DSR của chủ thể và thiết lập thời hạn lưu giữ an toàn.',
    badge: 'Data Compliance',
  },
  {
    icon: Database,
    title: 'Tích hợp & Đồng bộ mở rộng',
    description: 'Kết nối linh hoạt với ERP, phần mềm kế toán và hệ sinh thái nội bộ qua Webhooks và REST API chuẩn hóa.',
    badge: 'High Reliability',
  },
];

export const TrustSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection className="bg-white py-20 lg:py-28">
      <SectionHeading

        title={t('landing.home.trust.title')}
        description="Nền tảng được thiết kế cho các tổ chức B2B đòi hỏi tính bảo mật, kiểm toán và tuân thủ cao"
        align="left"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {trustPillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <SpotlightCard
              key={index}
              spotlightColor="rgba(8, 90, 192, 0.12)"
              className="rounded-3xl p-7 flex flex-col justify-between space-y-4 hover:shadow-xl transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#085AC0] flex items-center justify-center font-bold border border-blue-100 group-hover:bg-[#085AC0] group-hover:text-white transition-colors duration-300 shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold text-[#085AC0] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80 uppercase">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-[#07182B] landing-display leading-snug">
                  {pillar.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </LandingSection>
  );
};

export default TrustSection;
