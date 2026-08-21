import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingSection } from '../../components/LandingSection';

export const FinalDemoSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection className="bg-[#07182B] text-white relative overflow-hidden">
      {/* Decorative ambient radial lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-blue-600/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/50 border border-blue-700/60 text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Sẵn sàng chuyển đổi số quy trình kinh doanh</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold landing-display leading-tight">
          {t('landing.home.finalCta.title')}
        </h2>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
          {t('landing.home.finalCta.description')}
        </p>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="h-12 px-8 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-900/40 transition-all duration-200 hover:-translate-y-0.5"
          >
            <a href="#demo" className="flex items-center">
              <span>{t('landing.home.finalCta.primary')}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 px-7 border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white font-semibold text-sm sm:text-base transition-colors"
          >
            <Link to="/register">{t('landing.home.finalCta.secondary')}</Link>
          </Button>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Dùng thử đầy đủ tính năng
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Không yêu cầu thẻ tín dụng
          </span>
        </div>
      </div>
    </LandingSection>
  );
};

export default FinalDemoSection;
