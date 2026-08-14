import { env } from '@/config/env';
import { storageAdapter } from '../mock/storageAdapter';

export interface ApiErrorDetail {
  field: string;
  errorCode: string;
  message: string;
}

export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errorCode?: string;
  path?: string;
  traceId?: string;
  errors?: ApiErrorDetail[];
}

export class ApiError extends Error {
  public status: number;
  public errorCode: string;
  public problemDetail: ProblemDetail;

  constructor(status: number, problemDetail: ProblemDetail) {
    const message = problemDetail.detail || problemDetail.title || `API Request failed with status ${status}`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = problemDetail.errorCode || 'UNKNOWN_ERROR';
    this.problemDetail = problemDetail;
  }
}

export function extractErrorMessage(err: any, fallback: string = 'Thao tác không thành công'): string {
  if (!err) return fallback;

  const errors = err?.problemDetail?.errors || err?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const details = errors
      .map((e: ApiErrorDetail) => `${e.field ? e.field + ': ' : ''}${e.message || e.errorCode}`)
      .join('; ');
    return `Dữ liệu không hợp lệ: ${details}`;
  }

  if (err?.problemDetail?.detail && err.problemDetail.detail !== 'Request data is invalid') {
    return err.problemDetail.detail;
  }

  if (err?.message && err.message !== 'Request data is invalid') {
    return err.message;
  }

  if (err?.response?.data?.message && err.response.data.message !== 'Request data is invalid') {
    return err.response.data.message;
  }

  return fallback;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = storageAdapter.getSession();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.sessionToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${session.sessionToken}`);
  }

  if (session?.tenant?.id && !headers.has('X-Tenant-ID')) {
    headers.set('X-Tenant-ID', session.tenant.id);
  }

  const baseUrl = env.apiBaseUrl.replace(/\/$/, '');
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}${cleanEndpoint}`;

  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response = await fetch(url, requestOptions);

  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshUrl = baseUrl.endsWith('/api') ? `${baseUrl}/auth/refresh` : `${baseUrl}/api/auth/refresh`;
        const refreshResponse = await fetch(refreshUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const data = (await refreshResponse.json()) as { accessToken: string };
          if (session) {
            const updatedSession = { ...session, sessionToken: data.accessToken };
            storageAdapter.setSession(updatedSession);
          }
          isRefreshing = false;
          onRefreshed(data.accessToken);
        } else {
          isRefreshing = false;
          storageAdapter.clearSession();
        }
      } catch {
        isRefreshing = false;
        storageAdapter.clearSession();
      }
    }

    const retryPromise = new Promise<T>((resolve, reject) => {
      addRefreshSubscriber((newToken: string) => {
        const retryHeaders = new Headers(requestOptions.headers);
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
        fetch(url, { ...requestOptions, headers: retryHeaders })
          .then(async (res) => {
            if (!res.ok) {
              const problem = (await res.json().catch(() => ({}))) as ProblemDetail;
              reject(new ApiError(res.status, problem));
            } else {
              const contentType = res.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                resolve((await res.json()) as T);
              } else {
                resolve({} as T);
              }
            }
          })
          .catch(reject);
      });
    });

    return retryPromise;
  }

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as ProblemDetail;
    throw new ApiError(response.status, problem);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return {} as T;
}
