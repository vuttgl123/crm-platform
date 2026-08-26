export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordViolation =
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'COMMON'
  | 'CONTAINS_IDENTITY';

export interface PasswordAssessment {
  score: 0 | 1 | 2 | 3 | 4;
  violation?: PasswordViolation;
}

const MIN_IDENTITY_FRAGMENT = 4;

/**
 * Mirrors PasswordPolicy.java for immediate feedback. The backend stays
 * authoritative; this exists so a user is not told about a problem only after
 * submitting. Duplication across a language boundary cannot be avoided, so
 * both sides are kept in one file each and the two lists are kept in step.
 */
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', 'passw0rd',
  '123456', '1234567', '12345678', '123456789', '1234567890',
  'qwerty', 'qwerty123', 'qwertyuiop', 'asdfghjkl',
  'letmein', 'welcome', 'welcome1', 'welcome123',
  'admin', 'admin123', 'administrator', 'root', 'toor',
  'iloveyou', 'sunshine', 'princess', 'dragon', 'monkey',
  'football', 'baseball', 'superman', 'batman',
  'trustno1', 'changeme', 'secret', 'master', 'shadow',
  'abc123', 'abcd1234', 'a1b2c3d4', 'zaq12wsx', '1q2w3e4r',
  'qazwsx', 'michael', 'jennifer', 'jordan', 'hunter',
  'vumcrm', 'vumcrm123', 'crmadmin', 'salespassword',
  'companyname', 'january', 'february', 'december',
  'summer2025', 'summer2026', 'winter2025', 'winter2026',
  'p@ssword', 'p@ssw0rd', 'passw0rd123', 'test1234',
  'demo1234', 'demopassword', 'temporary', 'temppassword',
]);

function containsIdentity(
  lower: string,
  email?: string,
  displayName?: string
): boolean {
  if (email) {
    const at = email.indexOf('@');
    const local = (at > 0 ? email.slice(0, at) : email).toLowerCase();
    if (local.length >= MIN_IDENTITY_FRAGMENT && lower.includes(local)) {
      return true;
    }
  }
  if (displayName) {
    for (const part of displayName.toLowerCase().split(/\s+/)) {
      if (part.length >= MIN_IDENTITY_FRAGMENT && lower.includes(part)) {
        return true;
      }
    }
  }
  return false;
}

export function evaluatePassword(
  password: string,
  email?: string,
  displayName?: string
): PasswordAssessment {
  if (!password) return { score: 0, violation: 'TOO_SHORT' };

  const lower = password.toLowerCase();

  if (password.length < PASSWORD_MIN_LENGTH) {
    return { score: 0, violation: 'TOO_SHORT' };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { score: 0, violation: 'TOO_LONG' };
  }
  if (COMMON_PASSWORDS.has(lower)) {
    return { score: 0, violation: 'COMMON' };
  }
  if (containsIdentity(lower, email, displayName)) {
    return { score: 0, violation: 'CONTAINS_IDENTITY' };
  }

  // Length dominates, because it is what actually expands the search space.
  // Character variety is a secondary signal, never a requirement — see the
  // note in PasswordPolicy.java on why composition rules are excluded.
  let score = 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) =>
    re.test(password)
  ).length;
  if (classes >= 3) score += 1;

  return { score: Math.min(score, 4) as PasswordAssessment['score'] };
}

/**
 * Plain-English wording for contexts that report through `toast` rather than
 * through i18n keys, such as the profile page.
 */
export const PASSWORD_VIOLATION_MESSAGES: Record<PasswordViolation, string> = {
  TOO_SHORT: 'Use at least 12 characters',
  TOO_LONG: 'Use at most 128 characters',
  COMMON: 'This password is too common',
  CONTAINS_IDENTITY: 'Do not use your name or email in the password',
};
