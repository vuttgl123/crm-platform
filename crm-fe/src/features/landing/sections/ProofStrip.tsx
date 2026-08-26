import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, ShieldCheck } from 'lucide-react';
import { EditorialContainer } from '../components/EditorialContainer';
import { FadeIn } from '../components/FadeIn';

const clientLogos = [
  { name: 'Vinachem Distribution', label: 'VINACHEM' },
  { name: 'Hòa Phát Steel Supply', label: 'HOA PHAT STEEL' },
  { name: 'Digiworld Enterprise', label: 'DIGIWORLD B2B' },
  { name: 'TH Group Commercial', label: 'TH COMMERCIAL' },
  { name: 'Thiên Long B2B', label: 'THIEN LONG' },
  { name: 'Tân Á Đại Thành', label: 'TAN A DAI THANH' },
];

/**
 * Animated Number Hook with Smooth Easing on Viewport Entry
 */
const useCountUp = (end: number, duration: number = 1800) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic: 1 - (1 - t)^3
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(eased * end);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
};

export const ProofStrip: React.FC = () => {
  const metric1 = useCountUp(150, 1600);
  const metric2 = useCountUp(45000, 2000);
  const metric3 = useCountUp(99.9, 1800);

  return (
    <div className="w-full border-y border-[#E7E5E4] bg-[#FAFAF9] py-12 sm:py-16">
      <EditorialContainer>
        <div className="space-y-12">
          {/* Top: 6 B2B Client Monograms with Interactive Hover Boost */}
          <FadeIn>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-[#E7E5E4] pb-8">
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#A8A29E] shrink-0">
                Được tin dùng bởi 150+ doanh nghiệp phân phối &amp; B2B
              </span>
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3.5 sm:gap-5">
                {clientLogos.map((client) => (
                  <span
                    key={client.name}
                    className="font-mono text-[13px] font-semibold tracking-wider text-[#57534E] hover:text-[#1C1917] px-3.5 py-1.5 rounded-[6px] bg-white border border-[#E7E5E4] hover:border-[#D6D3D1] hover:shadow-[0_2px_8px_rgba(28,25,23,0.04)] transition-all duration-150 cursor-default select-none"
                  >
                    {client.label}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Bottom: 3 Operational Metrics — Frameless, Clean & Editorial */}
          <FadeIn stagger={1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-14 pt-2">
              {/* Metric 1: Royal Blue — Customer Growth (Frameless) */}
              <div ref={metric1.ref} className="space-y-3 group cursor-default">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[38px] sm:text-[46px] font-bold text-[#1D4ED8] tabular-nums tracking-tight leading-none">
                    {Math.floor(metric1.count)}+
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[12px] font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+24% YoY</span>
                  </span>
                </div>
                <p className="text-[15px] text-[#57534E] font-medium leading-relaxed max-w-sm">
                  Doanh nghiệp B2B và chuỗi phân phối vận hành hàng ngày
                </p>
              </div>

              {/* Metric 2: Deep Indigo / Violet — Scale of Quotes Approved (Frameless) */}
              <div ref={metric2.ref} className="space-y-3 group cursor-default">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[38px] sm:text-[46px] font-bold text-[#4F46E5] tabular-nums tracking-tight leading-none">
                    {Math.floor(metric2.count).toLocaleString('vi-VN')}+
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] text-[12px] font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+3.2x Tốc độ</span>
                  </span>
                </div>
                <p className="text-[15px] text-[#57534E] font-medium leading-relaxed max-w-sm">
                  Phiếu báo giá &amp; hợp đồng đã được phê duyệt qua hệ thống
                </p>
              </div>

              {/* Metric 3: Emerald Positive Green — Enterprise SLA Uptime (Frameless) */}
              <div ref={metric3.ref} className="space-y-3 group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[38px] sm:text-[46px] font-bold text-[#15803D] tabular-nums tracking-tight leading-none">
                      {metric3.count.toFixed(1)}%
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-pulse shrink-0" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] text-[12px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cam kết SLA</span>
                  </span>
                </div>
                <p className="text-[15px] text-[#57534E] font-medium leading-relaxed max-w-sm">
                  Thời gian sẵn sàng hệ thống cam kết theo thỏa thuận SLA
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </EditorialContainer>
    </div>
  );
};

export default ProofStrip;
