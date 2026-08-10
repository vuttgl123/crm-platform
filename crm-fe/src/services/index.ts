import { env } from '@/config/env';
import { IAuthService } from './contracts/IAuthService';
import { mockAuthService } from './mock/MockAuthService';
import { realAuthService } from './api/RealAuthService';

export const authService: IAuthService = env.useMocks ? mockAuthService : realAuthService;

export { mockAuthService } from './mock/MockAuthService';
export { realAuthService } from './api/RealAuthService';
