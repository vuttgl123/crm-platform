const DEFAULT_RETURN_URL = '/app/overview';

export function resolveReturnUrl(rawValue: string | null): string {
  if (
    !rawValue ||
    !rawValue.startsWith('/') ||
    rawValue.startsWith('//') ||
    rawValue.includes('\\') ||
    rawValue.includes('\uFFFD') ||
    /%(?![0-9A-Fa-f]{2})/.test(rawValue)
  ) {
    return DEFAULT_RETURN_URL;
  }

  try {
    const origin = window.location.origin;
    const resolved = new URL(rawValue, origin);
    if (resolved.origin !== origin) return DEFAULT_RETURN_URL;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return DEFAULT_RETURN_URL;
  }
}
