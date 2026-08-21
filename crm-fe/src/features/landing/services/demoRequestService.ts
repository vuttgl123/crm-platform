import { env } from '@/config/env';
import { DemoRequestInput, DemoRequestResult, DemoRequestServiceError } from '../types/landing';

export class PublicDemoRequestError extends Error {
  constructor(
    message: string,
    public readonly code: DemoRequestServiceError['code'],
    public readonly status?: number
  ) {
    super(message);
    this.name = 'PublicDemoRequestError';
  }
}

export const demoRequestService = {
  async submit(input: DemoRequestInput): Promise<DemoRequestResult> {
    if (!env.demoRequestEndpoint) {
      throw new PublicDemoRequestError(
        'Demo request endpoint is not configured',
        'CONFIGURATION_ERROR'
      );
    }

    let response: Response;
    try {
      response = await fetch(env.demoRequestEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        credentials: 'omit',
      });
    } catch {
      throw new PublicDemoRequestError('Network request failed', 'NETWORK_ERROR');
    }

    if (!response.ok) {
      throw new PublicDemoRequestError(
        'Demo request was rejected',
        'REQUEST_REJECTED',
        response.status
      );
    }

    if (response.status === 204) return {};
    return (await response.json().catch(() => ({}))) as DemoRequestResult;
  },
};
