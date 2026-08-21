import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, TrendingUp, Users, Target } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RoleOutcomeId } from '../types/landing';
import { AnimatedCounter } from './AnimatedCounter';

export const RoleOutcomeTabs: React.FC = () => {
  const { t } = useTranslation();
  const [activeRole, setActiveRole] = useState<RoleOutcomeId>('executive');

  const roles = [
    {
      id: 'executive' as RoleOutcomeId,
      label: t('landing.home.roles.executiveLabel'),
      title: t('landing.home.roles.executiveTitle'),
      icon: TrendingUp,
      items: [
        'Dự báo doanh số đa chiều theo vùng, phòng ban và sản phẩm',
        'Kiểm soát toàn diện dòng doanh thu và rủi ro thất thoát deal',
        'Báo cáo tự động hóa thời gian thực, không cần chờ phòng ban tổng hợp',
      ],
      metric: {
        counter: <AnimatedCounter end={45} prefix="+" suffix="%" duration={1600} />,
        label: 'Tỷ lệ dự báo chính xác',
        sub: 'Ra quyết định dựa trên dữ liệu chuẩn',
      },
    },
    {
      id: 'manager' as RoleOutcomeId,
      label: t('landing.home.roles.managerLabel'),
      title: t('landing.home.roles.managerTitle'),
      icon: Users,
      items: [
        'Giám sát phân bổ và chất lượng xử lý lead của từng nhân viên',
        'Thiết lập chỉ tiêu KPI doanh số và theo dõi tiến độ từng tuần',
        'Phê duyệt nhanh các đề xuất báo giá, chiết khấu và hợp đồng',
      ],
      metric: {
        counter: <AnimatedCounter end={4.5} decimals={1} suffix="h" duration={1400} />,
        label: 'Tiết kiệm mỗi tuần / quản lý',
        sub: 'Loại bỏ họp báo cáo tiến độ thủ công',
      },
    },
    {
      id: 'sales' as RoleOutcomeId,
      label: t('landing.home.roles.salesLabel'),
      title: t('landing.home.roles.salesTitle'),
      icon: Target,
      items: [
        'Quản lý danh sách khách hàng và lịch sử trao đổi tập trung',
        'Tạo báo giá chuyên nghiệp theo mẫu doanh nghiệp trong 2 phút',
        'Nhận thông báo nhắc việc và tự động cập nhật trạng thái cơ hội',
      ],
      metric: {
        counter: <AnimatedCounter end={3} prefix="+" suffix="x" duration={1500} />,
        label: 'Tốc độ phản hồi khách hàng',
        sub: 'Chốt deal nhanh chóng và chuyên nghiệp',
      },
    },
  ];

  return (
    <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-10 shadow-sm">
      <Tabs
        value={activeRole}
        onValueChange={(val) => setActiveRole(val as RoleOutcomeId)}
        className="w-full"
      >
        <div className="flex justify-center mb-8">
          <TabsList className="bg-slate-100/80 p-1.5 rounded-xl h-auto flex-wrap justify-center gap-1.5">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#085AC0] data-[state=active]:shadow-sm transition-all"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {role.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {roles.map((role) => (
          <TabsContent
            key={role.id}
            value={role.id}
            className="focus-visible:outline-none m-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#07182B] landing-display">
                  {role.title}
                </h3>
                <ul className="space-y-3 pt-2">
                  {role.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#085AC0] shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-5 bg-[#F8FAFD] border border-blue-100 rounded-2xl p-6 text-center space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Hiệu quả đo lường được
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#085AC0] landing-display pt-1">
                  {role.metric.counter}
                </div>
                <div className="text-sm font-bold text-[#07182B]">
                  {role.metric.label}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {role.metric.sub}
                </p>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RoleOutcomeTabs;
