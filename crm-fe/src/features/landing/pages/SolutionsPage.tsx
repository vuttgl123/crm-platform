import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { LandingSection } from '../components/LandingSection';
import { SectionHeading } from '../components/SectionHeading';
import { AnimatedCounter } from '../components/AnimatedCounter';

const solutionContexts = [
  {
    key: 'regional',
    icon: Building2,
    badge: 'Multi-Region Enterprise',
    title: 'Regional & Team-Based Commercial Management',
    description: 'Solve data hierarchy challenges when managing nationwide branch offices, representative locations, and distributed commercial teams.',
    metric: {
      counter: <AnimatedCounter end={4} suffix=" Levels" duration={1200} />,
      label: 'Data Scope Hierarchy',
      detail: 'TENANT • TEAM_TREE • TEAM • OWN',
    },
    capabilities: [
      'Partition visibility across regional branch offices and sales territories',
      'Hierarchical team trees empower managers with complete subordinate visibility',
      'Automated lead and account assignment based on geography and sales capacity',
    ],
  },
  {
    key: 'b2b',
    icon: Layers,
    badge: 'Complex B2B Sales',
    title: 'Long-Cycle & High-Value Commercial Deals',
    description: 'Standardize engagement from initial prospecting and needs discovery to multi-revision CPQ quotes and signed commercial contracts.',
    metric: {
      counter: <AnimatedCounter end={3.2} decimals={1} suffix="x" duration={1400} />,
      label: 'Quoting Velocity',
      detail: 'Automated discounting & approval flows',
    },
    capabilities: [
      'Unified account profile linking multiple decision-makers (Executive, Technical, Procurement)',
      'Multi-stage pipeline with deal age indicators and realistic closing probabilities',
      'One-click conversion from approved Quote to binding Contract and Sales Order',
    ],
  },
  {
    key: 'governed',
    icon: ShieldCheck,
    badge: 'Enterprise Governance',
    title: 'Strict Audit, Compliance & Security Demands',
    description: 'Safeguard customer data with granular role-based access control, leak prevention, and 100% immutable activity audit trails.',
    metric: {
      counter: <AnimatedCounter end={100} suffix="%" duration={1500} />,
      label: 'Audit Log Coverage',
      detail: 'Real-time compliance trails',
    },
    capabilities: [
      'Granular logging of all record reads, exports, and status modifications',
      'Data Subject Requests (DSR) and automated retention policy enforcement',
      'Secure two-way sync with ERP and financial accounting systems via webhooks',
    ],
  },
];

export const SolutionsPage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.solutionsTitle'),
    description: t('landing.metadata.solutionsDescription'),
    path: '/solutions',
  });

  return (
    <div className="py-6 sm:py-10 lg:py-14 bg-[var(--landing-canvas)]">
      <LandingSection contained className="pt-0">
        <SectionHeading
          as="h1"
          title="Operating Architecture for Enterprise Business Challenges"
          description="Flexible design adapted to multi-region hierarchies, complex B2B sales cycles, and strict enterprise governance standards."
          align="left"
        />

        {/* 3 Solution Context Cards */}
        <div className="space-y-8 pt-4">
          {solutionContexts.map((sol) => {
            const Icon = sol.icon;
            return (
              <div
                key={sol.key}
                className="bg-white border border-[var(--landing-line)] rounded-2xl p-6 sm:p-10 shadow-xs hover:border-[var(--landing-blue)] transition-colors grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Narrative */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--landing-blue-soft)] text-[var(--landing-blue)] text-xs font-bold uppercase tracking-wider">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sol.badge}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--landing-ink)] landing-display leading-tight">
                      {sol.title}
                    </h2>

                    <p className="text-sm sm:text-base text-[var(--landing-muted)] leading-relaxed font-normal">
                      {sol.description}
                    </p>
                  </div>

                  {/* Capabilities Bullet List */}
                  <div className="space-y-2.5 pt-2 border-t border-[var(--landing-line)]">
                    {sol.capabilities.map((cap) => (
                      <div key={cap} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--landing-ink)] font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[var(--landing-blue)] shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Metric Card */}
                <div className="lg:col-span-4 bg-[var(--landing-canvas)] border border-[var(--landing-line)] rounded-xl p-6 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-[var(--landing-muted)] uppercase tracking-wider block mb-1">
                      {sol.metric.label}
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-[var(--landing-blue)] landing-display">
                      {sol.metric.counter}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--landing-line)]">
                    <span className="text-xs font-semibold text-[var(--landing-ink)]">
                      {sol.metric.detail}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 sm:p-10 rounded-2xl bg-[var(--landing-ink)] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold landing-display">
              Ready to structure your B2B sales pipeline?
            </h3>
            <p className="text-sm text-slate-300">
              Schedule a technical demonstration tailored to your organization structure.
            </p>
          </div>

          <Button asChild size="lg" className="h-12 px-7 bg-[var(--landing-blue)] hover:bg-[var(--landing-blue-hover)] text-white font-semibold shrink-0">
            <Link to="/demo">
              <span>Book Consultation &amp; Demo</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </LandingSection>
    </div>
  );
};

export default SolutionsPage;
