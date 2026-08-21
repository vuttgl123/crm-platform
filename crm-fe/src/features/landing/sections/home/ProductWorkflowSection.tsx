import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LandingSection } from '../../components/LandingSection';
import { LandingProductVisual } from '../../components/LandingProductVisual';
import {
  homeProductAssets,
  homeWorkflowStages,
  type HomeWorkflowStageId,
} from '../../content/homeProductEvidence';

export function ProductWorkflowSection() {
  const { t } = useTranslation();
  const [activeStage, setActiveStage] = useState<HomeWorkflowStageId>('lead');

  return (
    <LandingSection id="features" aria-labelledby="workflow-title" className="bg-[var(--landing-surface)]">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--landing-blue)]">
          {t('landing.home.workflow.eyebrow')}
        </p>
        <h2 id="workflow-title" className="landing-display mt-4 text-3xl font-extrabold text-[var(--landing-ink)] md:text-5xl">
          {t('landing.home.workflow.title')}
        </h2>
        <p className="landing-body-copy mt-5 text-lg">
          {t('landing.home.workflow.description')}
        </p>
      </header>

      <Tabs
        value={activeStage}
        onValueChange={(value) => setActiveStage(value as HomeWorkflowStageId)}
        className="mt-12"
      >
        <TabsList className="grid h-auto grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-3 lg:grid-cols-6">
          {homeWorkflowStages.map((stage, index) => (
            <TabsTrigger
              key={stage.id}
              value={stage.id}
              className="min-h-11 justify-start rounded-lg border border-[var(--landing-line)] bg-white px-3 py-3 text-left data-[state=active]:border-[var(--landing-blue)] data-[state=active]:text-[var(--landing-blue)]"
            >
              <span aria-hidden="true" className="mr-2 text-xs tabular-nums font-mono font-bold">
                {String(index + 1).padStart(2, '0')}
              </span>
              {t(stage.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        {homeWorkflowStages.map((stage) => (
          <TabsContent key={stage.id} value={stage.id} className="mt-8">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h3 className="landing-display text-2xl font-bold text-[var(--landing-ink)]">
                  {t(stage.titleKey)}
                </h3>
                <p className="landing-body-copy mt-4">
                  {t(stage.descriptionKey)}
                </p>
              </div>
              <div className="lg:col-span-8">
                <LandingProductVisual asset={homeProductAssets[stage.assetId]} />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </LandingSection>
  );
}

export default ProductWorkflowSection;
