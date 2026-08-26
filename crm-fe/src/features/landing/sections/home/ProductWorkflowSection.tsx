import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { LandingProductVisual } from '../../components/LandingProductVisual';
import {
  homeProductAssets,
  homeWorkflowStages,
  type HomeWorkflowStageId,
} from '../../content/homeProductEvidence';

const stageMeta: Record<HomeWorkflowStageId, { metric: string; tag: string }> = {
  lead: { metric: '< 0.4s Latency', tag: 'Top-of-Funnel' },
  account: { metric: '360° Real-Time', tag: 'Core Entity' },
  opportunity: { metric: '+28% Velocity', tag: 'Pipeline Engine' },
  quote: { metric: '3x Faster CPQ', tag: 'Pricing Logic' },
  approval: { metric: '< 15 Mins SLA', tag: 'Governance' },
  contract: { metric: '100% Audit Trace', tag: 'Revenue Lock' },
};

export function ProductWorkflowSection() {
  const { t } = useTranslation();
  const [activeStage, setActiveStage] = useState<HomeWorkflowStageId>('lead');

  const activeIndex = homeWorkflowStages.findIndex(
    (stage) => stage.id === activeStage
  );

  return (
    <LandingSection
      id="features"
      tone="dark"
      size="default"
      aria-labelledby="workflow-title"
      className="bg-[#02040A] py-20 md:py-28"
    >
      <SectionHeading
        id="workflow-title"
        tone="dark"
        eyebrow={t('landing.home.workflow.eyebrow')}
        title={t('landing.home.workflow.title')}
        description={t('landing.home.workflow.description')}
      />

      <Tabs
        value={activeStage}
        onValueChange={(value) => setActiveStage(value as HomeWorkflowStageId)}
        orientation="vertical"
        className="grid gap-8 lg:grid-cols-12 lg:gap-10 items-start"
      >
        <TabsList className="h-auto justify-start gap-3 overflow-x-auto rounded-none bg-transparent p-0 lg:col-span-4 lg:flex-col lg:overflow-visible">
          {homeWorkflowStages.map((stage, index) => {
            const isActive = stage.id === activeStage;
            const isReached = index <= activeIndex;
            const meta = stageMeta[stage.id];

            return (
              <TabsTrigger
                key={stage.id}
                value={stage.id}
                className={`relative min-h-[4.25rem] w-full shrink-0 justify-start gap-4 rounded-[6px] p-4 text-left transition-all ${
                  isActive
                    ? 'border-blue-500/70 bg-slate-900 shadow-[0_0_20px_rgba(37,99,235,0.4)] border'
                    : 'border border-slate-800/80 bg-slate-950/60 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums transition-colors ${
                    isActive
                      ? 'border-cyan-400 bg-blue-600 text-white shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                      : isReached
                        ? 'border-blue-700 bg-blue-950/80 text-blue-300'
                        : 'border-slate-800 bg-slate-900 text-slate-500'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-sm font-bold truncate ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {t(stage.labelKey)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold ${
                        isActive
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {meta.metric}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {meta.tag}
                  </p>
                </div>

                <ChevronRight
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    isActive
                      ? 'text-cyan-400 translate-x-0.5'
                      : 'text-slate-600'
                  }`}
                />
              </TabsTrigger>
            );
          })}
        </TabsList>

        {homeWorkflowStages.map((stage) => (
          <TabsContent
            key={stage.id}
            value={stage.id}
            className="mt-0 lg:col-span-8 lg:col-start-5 lg:row-start-1"
          >
            <div className="lp-fade-in rounded-[6px] border border-slate-800 bg-slate-950/90 p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
              <div className="flex flex-col justify-between gap-2 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-white">
                    {t(stage.titleKey)}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {t(stage.descriptionKey)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-blue-950/80 border border-blue-500/40 px-3.5 py-1 text-xs font-bold text-blue-300 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                  Live Preview
                </span>
              </div>

              <div className="mt-6">
                <LandingProductVisual
                  asset={homeProductAssets[stage.assetId]}
                  className="rounded-[4px] border border-slate-800 shadow-2xl"
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </LandingSection>
  );
}

export default ProductWorkflowSection;
