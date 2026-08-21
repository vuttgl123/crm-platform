import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingSection } from '../../components/LandingSection';

export const FinalDemoSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection className="bg-[#07182B] text-white">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold landing-display leading-tight">
          {t('landing.home.finalCta.title')}
        </h2>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          {t('landing.home.finalCta.description')}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="h-12 px-8 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-base shadow-sm transition-colors"
          >
            <Link to="/demo">
              <span>{t('landing.home.finalCta.primary')}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 px-6 border-slate-700 bg-slate-850 text-white hover:bg-slate-800 font-semibold text-base"
          >
            <Link to="/register">{t('landing.home.finalCta.secondary')}</Link>
          </Button>
        </div>
      </div>
    </LandingSection>
  );
};

export default FinalDemoSection;
