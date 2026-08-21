import React from 'react';

const quote = {
  text: '"VUM CRM rút ngắn chu kỳ chốt deal của chúng tôi từ 60 ngày xuống còn 32 ngày. Báo giá tự động và phân quyền chi nhánh là hai tính năng thay đổi hoàn toàn cách đội ngũ vận hành."',
  author: 'Phạm Quốc Hùng',
  role: 'Phó Tổng Giám Đốc Vận Hành',
  company: 'VinFast Global Supply Chain',
  initial: 'PH',
};

const logos = [
  { name: 'VinFast',  industry: 'Sản xuất' },
  { name: 'VNG',      industry: 'Công nghệ' },
  { name: 'FPT',      industry: 'Phần mềm' },
  { name: 'Masan',    industry: 'Tiêu dùng' },
  { name: 'Viettel',  industry: 'Viễn thông' },
  { name: 'VNPT',     industry: 'Hạ tầng' },
];

export const SocialProofSection: React.FC = () => {
  return (
    <section
      id="social-proof"
      className="section-py-sm bg-white border-b border-[--color-border]"
    >
      <div className="landing-container space-y-16">
        {/* ── Logo grid ──────────────────────────────────────── */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[--color-ink-faint] mb-8">
            Được tin dùng bởi các tập đoàn hàng đầu
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="group flex flex-col items-center gap-1"
              >
                <span className="text-xl font-black tracking-tight text-[--color-ink-faint] group-hover:text-[--color-ink] transition-colors duration-200 leading-none">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ────────────────────────────────────────── */}
        <div className="border-t border-[--color-border]" />

        {/* ── Testimonial ────────────────────────────────────── */}
        <figure className="max-w-3xl mx-auto text-center space-y-8">
          <blockquote className="text-lg sm:text-2xl font-semibold text-[--color-ink] leading-relaxed landing-display">
            {quote.text}
          </blockquote>

          <figcaption className="flex items-center justify-center gap-4">
            <div
              className="w-10 h-10 rounded-full bg-[--color-canvas] border border-[--color-border] text-[--color-ink] flex items-center justify-center text-sm font-bold shrink-0"
            >
              {quote.initial}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-[--color-ink]">{quote.author}</div>
              <div className="text-[13px] text-[--color-ink-muted]">{quote.role} · {quote.company}</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
};

export default SocialProofSection;
