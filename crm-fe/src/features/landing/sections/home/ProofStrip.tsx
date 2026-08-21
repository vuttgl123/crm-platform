import React from 'react';
import { ShieldCheck, Activity, Gauge, Lock } from 'lucide-react';
import { AnimatedCounter } from '../../components/AnimatedCounter';

const proofMetrics = [
  {
    icon: Gauge,
    counter: <AnimatedCounter end={150} prefix="< " suffix="ms" duration={1400} />,
    label: 'Tốc độ phản hồi hệ thống',
    tag: 'Thời gian thực',
  },
  {
    icon: Activity,
    counter: <AnimatedCounter end={99.9} decimals={1} suffix="%" duration={1600} />,
    label: 'Sẵn sàng hạ tầng đám mây',
    tag: 'Uptime SLA 24/7',
  },
  {
    icon: ShieldCheck,
    counter: <AnimatedCounter end={100} suffix="%" duration={1500} />,
    label: 'Nhật ký truy vết & Kiểm toán',
    tag: 'DSR Compliance',
  },
  {
    icon: Lock,
    counter: <AnimatedCounter end={4} suffix=" Cấp" duration={1200} />,
    label: 'Bảo mật phạm vi dữ liệu',
    tag: 'RBAC Strict Control',
  },
];

export const ProofStrip: React.FC = () => {
  return (
    <div className="relative border-y border-[#DCE5F0] bg-gradient-to-r from-[#07182B] via-[#0A2540] to-[#07182B] text-white py-10 sm:py-12 overflow-hidden shadow-xl">
      {/* Decorative ambient background mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#085ac015_1px,transparent_1px),linear-gradient(to_bottom,#085ac015_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      <div className="landing-container relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          {proofMetrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-4 pt-6 sm:pt-0 sm:px-4 first:pt-0 first:pl-0 last:pr-0 group"
              >
                <div className="w-13 h-13 rounded-2xl bg-blue-950/90 text-blue-400 flex items-center justify-center shrink-0 border border-blue-800/80 group-hover:scale-110 group-hover:border-blue-400 group-hover:text-white transition-all duration-300 shadow-md">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-white landing-display tracking-tight">
                      {metric.counter}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-0.5 leading-snug">
                    {metric.label}
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    {metric.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProofStrip;
