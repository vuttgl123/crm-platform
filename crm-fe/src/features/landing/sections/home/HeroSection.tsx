import React from 'react';

import { ProductCockpit } from '../../components/ProductCockpit';

export const HeroSection: React.FC = () => {

  return (
    <section
      id="hero"
      className="relative bg-white pt-20 pb-0 overflow-hidden"
    >
      <div className="landing-container">
        {/* ── Main Headline ─────────────────────────────────────── */}
        <div className="mx-auto max-w-[48rem] text-center space-y-6">
          <h1 className="h-hero landing-display">
            Hệ thống CRM chuẩn Enterprise
            <br className="hidden sm:block" />
            {' '}cho doanh nghiệp Việt
          </h1>

          <p className="mx-auto max-w-[38rem] text-lg sm:text-xl leading-relaxed text-[--color-ink-muted]">
            Hợp nhất Customer 360°, quản lý phễu Pipeline, báo giá CPQ và kiểm soát phân quyền RBAC 4 cấp — tất cả trên một nền tảng duy nhất.
          </p>

          {/* ── CTAs ──────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="#demo" className="btn-primary h-12 px-8 text-base w-full sm:w-auto">
              Đặt lịch demo ngay
            </a>
            <a 
              href="#features" 
              className="inline-flex items-center justify-center h-12 px-8 text-base font-semibold text-[--color-ink] bg-white border border-[--color-border] hover:bg-[--color-canvas] transition-colors rounded-md w-full sm:w-auto"
            >
              Xem tính năng
            </a>
          </div>
        </div>

        {/* ── Product Cockpit ───────────────────────────────────── */}
        <div className="relative mt-20 sm:mt-24 max-w-[1000px] mx-auto">
          {/* Subtle browser chrome border */}
          <div className="relative rounded-xl overflow-hidden border border-[--color-border] bg-white shadow-sm">
            <ProductCockpit />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
