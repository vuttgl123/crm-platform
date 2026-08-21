import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  UserPlus, 
  Users, 
  Kanban, 
  FileCheck, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Layers,
  Activity,
  Lock,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { LandingSection } from '../components/LandingSection';
import { SectionHeading } from '../components/SectionHeading';
import { AnimatedCounter } from '../components/AnimatedCounter';

const featurePillars = [
  {
    number: '01',
    key: 'lead',
    icon: UserPlus,
    title: 'Lead Management Engine',
    badge: 'Top-of-Funnel',
    highlights: [
      'Ingest and qualify leads across Web, Events, and API integrations',
      'Automated rule-based assignment by territory and team capacity',
      'One-click qualification and instant conversion to Accounts & Opportunities',
    ],
  },
  {
    number: '02',
    key: 'account',
    icon: Users,
    title: 'Customer 360° Profiles',
    badge: 'Data Core',
    highlights: [
      'Organize multiple key contacts under a single legal account hierarchy',
      'Unified engagement timeline: logged calls, emails, notes, and attachments',
      'Credit limit tracking, segmented tags, and transaction history in one view',
    ],
  },
  {
    number: '03',
    key: 'opportunity',
    icon: Kanban,
    title: 'B2B Pipeline & Stage Control',
    badge: 'Conversion Rate',
    highlights: [
      'Multi-stage visual pipelines with weighted closing probabilities',
      'Stale deal alerts and proactive next-action recommendations',
      'Granular data scoping across individual, team, and organization levels',
    ],
  },
  {
    number: '04',
    key: 'commerce',
    icon: FileCheck,
    title: 'Quotes, Approvals & Contracts',
    badge: 'CPQ Automation',
    highlights: [
      'Multi-item CPQ quotation builder with price book and discount logic',
      'Multi-level discount approval workflows within the system',
      'Instant conversion from approved Quote to binding Contract and Sales Order',
    ],
  },
  {
    number: '05',
    key: 'automation',
    icon: Zap,
    title: 'Workflow Automation',
    badge: 'Productivity Boost',
    highlights: [
      'Automated task creation and assignment on key deal stage milestones',
      'Configurable territory reassignment rules for smooth team handoffs',
      'Eliminate repetitive manual data entry across commercial teams',
    ],
  },
  {
    number: '06',
    key: 'forecast',
    icon: TrendingUp,
    title: 'Revenue Forecasting & KPI Tracking',
    badge: 'Real-Time Insights',
    highlights: [
      'Weighted revenue projections across monthly and quarterly cycles',
      'Track individual and team attainment against assigned quota targets',
      'Instant interactive dashboards without manual spreadsheet rollups',
    ],
  },
  {
    number: '07',
    key: 'governance',
    icon: ShieldCheck,
    title: 'Enterprise RBAC & Audit Logging',
    badge: 'Security Standard',
    highlights: [
      'Four-tier scope permissions: TENANT, TEAM_TREE, TEAM, and OWN',
      '100% immutable audit logging for all record changes and data exports',
      'Built-in Data Subject Requests (DSR) and automated retention policies',
    ],
  },
];

export const FeaturesPage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.featuresTitle'),
    description: t('landing.metadata.featuresDescription'),
    path: '/features',
  });

  return (
    <div className="py-6 sm:py-10 lg:py-14 bg-[var(--landing-canvas)]">
      <LandingSection contained className="pt-0">
        {/* Header */}
        <SectionHeading
          as="h1"
          title="7 Core Modules for the Complete B2B Sales Lifecycle"
          description="A unified enterprise suite spanning lead generation, pipeline management, quoting, contracts, and compliance."
          align="left"
        />

        {/* Top Feature Stats Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2 pb-10">
          <div className="p-4 rounded-xl bg-white border border-[var(--landing-line)] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--landing-blue-soft)] text-[var(--landing-blue)] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[var(--landing-ink)] landing-display">
                <AnimatedCounter end={7} suffix=" Modules" duration={1200} />
              </div>
              <div className="text-xs text-[var(--landing-muted)] font-medium">Complete Lifecycle</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[var(--landing-line)] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[var(--landing-ink)] landing-display">
                <AnimatedCounter end={99.9} decimals={1} suffix="%" duration={1400} />
              </div>
              <div className="text-xs text-[var(--landing-muted)] font-medium">Uptime Guarantee</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[var(--landing-line)] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--landing-blue-soft)] text-[var(--landing-blue)] flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[var(--landing-ink)] landing-display">
                <AnimatedCounter end={150} prefix="< " suffix="ms" duration={1300} />
              </div>
              <div className="text-xs text-[var(--landing-muted)] font-medium">Fast Query Response</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[var(--landing-line)] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[var(--landing-ink)] landing-display">
                <AnimatedCounter end={100} suffix="%" duration={1500} />
              </div>
              <div className="text-xs text-[var(--landing-muted)] font-medium">Audit Traceability</div>
            </div>
          </div>
        </div>

        {/* 7 Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featurePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.key}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-[var(--landing-line)] hover:border-[var(--landing-blue)] transition-colors flex flex-col justify-between group shadow-2xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[var(--landing-blue-soft)] text-[var(--landing-blue)] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[var(--landing-muted)] font-mono">
                        {pillar.number}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--landing-blue)] bg-[var(--landing-blue-soft)] px-2.5 py-0.5 rounded-full uppercase">
                      {pillar.badge}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-[var(--landing-ink)] landing-display leading-snug">
                    {pillar.title}
                  </h2>

                  <ul className="space-y-2.5 pt-1">
                    {pillar.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--landing-muted)] leading-relaxed font-normal">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-[var(--landing-line)] mt-6 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--landing-muted)]">VUM Module #{pillar.number}</span>
                  <Link
                    to="/demo"
                    className="text-xs font-bold text-[var(--landing-blue)] hover:underline flex items-center gap-1 group/btn"
                  >
                    <span>Experience</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Conversion Banner */}
        <div className="mt-16 bg-[var(--landing-ink)] rounded-2xl p-8 sm:p-12 text-white text-center space-y-6">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold landing-display">
              {t('landing.features.ctaTitle')}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Schedule a 30-minute walkthrough with our technical architects to explore the system with simulated enterprise data.
            </p>
            <div className="pt-2">
              <Button
                asChild
                className="h-12 px-8 bg-[var(--landing-blue)] hover:bg-[var(--landing-blue-hover)] text-white font-semibold text-base shadow-md transition-colors"
              >
                <Link to="/demo">
                  <span>Schedule Demo Now</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </LandingSection>
    </div>
  );
};

export default FeaturesPage;
