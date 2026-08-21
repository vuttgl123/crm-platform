import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Workflow, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { LandingSection } from '../components/LandingSection';
import { SectionHeading } from '../components/SectionHeading';

const scopingFactors = [
  {
    key: 'scale',
    icon: Users,
    badge: 'Scale Flexibility',
    title: 'User Scale & Organization Hierarchy',
    description: 'Cost is calibrated to active commercial seats and actual departmental hierarchy without artificial minimums.',
    criteria: [
      'Active commercial seats across sales and management roles',
      'Regional branches and hierarchical team trees (TEAM_TREE)',
      'Flexible seat expansion as your revenue team grows',
    ],
  },
  {
    key: 'process',
    icon: Workflow,
    badge: 'Workflow Complexity',
    title: 'B2B Process & Quoting Depth',
    description: 'Configurable pipeline stages, multi-tier CPQ discount approvals, and custom document generation.',
    criteria: [
      'Number of distinct pipeline funnels by product line or business unit',
      'Multi-level approval workflows for quotes, orders, and contracts',
      'Standardized quotation templates and legal contract templates',
    ],
  },
  {
    key: 'integration',
    icon: Database,
    badge: 'Ecosystem Sync',
    title: 'System Integration & Data Ecosystem',
    description: 'Secure bidirectional sync with ERP, internal databases, webhook endpoints, and inbound lead channels.',
    criteria: [
      'Two-way synchronization for accounts, contacts, and invoices',
      'Inbound and outbound webhooks for real-time CRM event dispatch',
      'Data migration and cleansing assistance for legacy spreadsheet records',
    ],
  },
  {
    key: 'governance',
    icon: ShieldCheck,
    badge: 'Enterprise Standard',
    title: 'Governance, Security & SLA Support',
    description: 'Multi-tier data scoping, complete immutable audit trails, and dedicated SLA commitments.',
    criteria: [
      'Strict 4-tier data scope enforcement (TENANT, TEAM_TREE, TEAM, OWN)',
      '100% immutable real-time audit logging for compliance',
      '99.9% uptime SLA guarantee and dedicated technical support',
    ],
  },
];

const includedFeatures = [
  'All 7 core modules from Lead to Contract',
  'Unlimited Customer 360° company profiles',
  '4-tier role-based access control (RBAC)',
  'Detailed immutable audit trail logging',
  'Standardized REST APIs and Webhook engine',
  'Comprehensive onboarding and documentation',
];

const deploymentSteps = [
  {
    step: '01',
    title: 'Discovery Consultation (30 min)',
    desc: 'Review your commercial structure, sales workflow bottlenecks, and data integration requirements.',
  },
  {
    step: '02',
    title: 'Tailored Solution Walkthrough (1–3 Days)',
    desc: 'Explore a tailored sandbox environment configured with your pipeline stages and sample data.',
  },
  {
    step: '03',
    title: 'Onboarding & Deployment',
    desc: 'Receive transparent scoped pricing, migration assistance, and user training for your teams.',
  },
];

export const PricingPage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.pricingTitle'),
    description: t('landing.metadata.pricingDescription'),
    path: '/pricing',
  });

  return (
    <div className="py-6 sm:py-10 lg:py-14 bg-[var(--landing-canvas)]">
      <LandingSection contained className="pt-0">
        {/* Header */}
        <SectionHeading
          as="h1"
          title="Enterprise Commercial Scoping Model"
          description="Transparent, scope-based implementation without artificial feature paywalls or hidden fees."
          align="left"
        />

        {/* 4 Scoping Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {scopingFactors.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.key}
                className="bg-white border border-[var(--landing-line)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xs hover:border-[var(--landing-blue)] transition-colors flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[var(--landing-blue-soft)] text-[var(--landing-blue)] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--landing-blue)] bg-[var(--landing-blue-soft)] px-2.5 py-0.5 rounded-full uppercase">
                      {f.badge}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-extrabold text-[var(--landing-ink)] landing-display">
                    {f.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[var(--landing-muted)] leading-relaxed font-normal">
                    {f.description}
                  </p>

                  <div className="space-y-2 pt-1 border-t border-[var(--landing-line)]">
                    {f.criteria.map((crit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--landing-ink)] font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* All Plans Include Strip */}
        <div className="mt-12 bg-white border border-[var(--landing-line)] rounded-2xl p-6 sm:p-10 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-[var(--landing-line)]">
            <CheckCircle2 className="w-6 h-6 text-[var(--landing-blue)] shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--landing-ink)] landing-display">
                Included in Every Implementation Scope
              </h2>
              <p className="text-xs sm:text-sm text-[var(--landing-muted)] font-medium mt-0.5">
                Full core enterprise infrastructure without unexpected per-feature add-on fees
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {includedFeatures.map((item, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-[var(--landing-canvas)] border border-[var(--landing-line)] flex items-center gap-3 text-xs sm:text-sm font-semibold text-[var(--landing-ink)]"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--landing-blue)] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Step Deployment Flow */}
        <div className="mt-12 bg-[var(--landing-blue-soft)] border border-[var(--landing-line)] rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[var(--landing-blue)] uppercase tracking-wider">Transparent Process</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--landing-ink)] landing-display">
              3 Steps to Deploying Your Enterprise CRM
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {deploymentSteps.map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-[var(--landing-line)] space-y-2 shadow-2xs">
                <span className="text-xs font-mono font-bold text-[var(--landing-blue)] bg-[var(--landing-blue-soft)] px-2 py-0.5 rounded border border-blue-200">
                  Step {s.step}
                </span>
                <h4 className="text-sm font-bold text-[var(--landing-ink)]">{s.title}</h4>
                <p className="text-xs text-[var(--landing-muted)] leading-relaxed font-normal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation CTA Banner */}
        <div className="mt-16 bg-[var(--landing-ink)] rounded-2xl p-8 sm:p-12 text-white text-center space-y-6">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold landing-display">
              {t('landing.pricing.ctaTitle')}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Our enterprise solution team will work with you to determine the most effective deployment roadmap for your sales organization.
            </p>
            <div className="pt-2">
              <Button
                asChild
                className="h-12 px-8 bg-[var(--landing-blue)] hover:bg-[var(--landing-blue-hover)] text-white font-semibold text-base shadow-md transition-colors"
              >
                <Link to="/demo">
                  <span>{t('landing.pricing.ctaAction')}</span>
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

export default PricingPage;
