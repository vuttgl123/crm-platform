import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { evaluatePassword } from '../utils/passwordPolicy';

const LEVEL_KEYS = [
  'auth.gateway.password.strength.veryWeak',
  'auth.gateway.password.strength.weak',
  'auth.gateway.password.strength.fair',
  'auth.gateway.password.strength.good',
  'auth.gateway.password.strength.strong',
] as const;

const VIOLATION_KEYS = {
  TOO_SHORT: 'auth.gateway.password.violation.tooShort',
  TOO_LONG: 'auth.gateway.password.violation.tooLong',
  COMMON: 'auth.gateway.password.violation.common',
  CONTAINS_IDENTITY: 'auth.gateway.password.violation.containsIdentity',
} as const;

// On-light values: the form column sits on --ed-canvas. Only the brand panel
// is a dark region.
const BAR_COLORS = [
  'bg-[var(--ed-negative)]',
  'bg-[var(--ed-negative)]',
  'bg-amber-500',
  'bg-[var(--ed-accent)]',
  'bg-[var(--ed-positive)]',
];

const TEXT_COLORS = [
  'text-[var(--ed-negative)]',
  'text-[var(--ed-negative)]',
  'text-amber-700',
  'text-[var(--ed-accent)]',
  'text-[var(--ed-positive)]',
];

export interface PasswordStrengthMeterProps {
  password: string;
  email?: string;
  displayName?: string;
}

export function PasswordStrengthMeter({
  password,
  email,
  displayName,
}: PasswordStrengthMeterProps): ReactElement | null {
  const { t } = useTranslation();

  if (!password) return null;

  const { score, violation } = evaluatePassword(password, email, displayName);

  return (
    <div className="mt-2.5">
      {/* Decorative: the assessment is announced once, as words, below. */}
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              index < score ? BAR_COLORS[score] : 'bg-[var(--ed-hairline)]'
            }`}
          />
        ))}
      </div>
      <p
        className={`mt-1.5 font-mono text-[11px] font-medium ${
          violation ? 'text-[var(--ed-negative)]' : TEXT_COLORS[score]
        }`}
        aria-live="polite"
      >
        {violation ? t(VIOLATION_KEYS[violation]) : t(LEVEL_KEYS[score])}
      </p>
    </div>
  );
}

export default PasswordStrengthMeter;
