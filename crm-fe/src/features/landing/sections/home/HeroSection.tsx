import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCockpit } from '../../components/ProductCockpit';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="pt-8 sm:pt-14 pb-16 lg:pb-24 overflow-hidden">
      <div className="landing-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Narrative Column: 5 Cols on Desktop */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#085AC0] bg-[#EAF2FC] px-3 py-1 rounded-full">
                {t('landing.home.hero.kicker')}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#07182B] landing-display leading-[1.08]">
                {t('landing.home.hero.title')}
              </h1>
              <p className="text-base sm:text-lg text-[#52647A] leading-relaxed">
                {t('landing.home.hero.description')}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Button
                asChild
                className="h-12 px-7 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-base shadow-sm transition-colors"
              >
                <Link to="/demo">
                  <span>{t('landing.home.hero.primaryCta')}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 px-6 border-slate-300 text-[#07182B] hover:bg-slate-50 font-semibold text-base"
              >
                <Link to="/register">{t('landing.home.hero.secondaryCta')}</Link>
              </Button>
            </div>

            {/* Micro proof bullets */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-[#52647A]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Không cần cài đặt phức tạp
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Hỗ trợ trực tiếp 1:1
              </span>
            </div>
          </div>

          {/* Product Cockpit Column: 7 Cols on Desktop */}
          <div className="lg:col-span-7">
            <ProductCockpit />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
