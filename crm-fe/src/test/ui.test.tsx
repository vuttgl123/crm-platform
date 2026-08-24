import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { OfflineState } from '@/components/common/OfflineState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { SessionExpired } from '@/components/common/SessionExpired';
import { ForbiddenPage } from '@/features/system/ForbiddenPage';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { CommandPalette } from '@/layouts/CommandPalette';
import { AuthProvider } from '@/core/session/AuthContext';
import { mockAuthService } from '@/services/mock/MockAuthService';
import { storageAdapter } from '@/services/mock/storageAdapter';
import i18n from '@/i18n/config';

describe('UI & System States Tests', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('15. Renders all system states correctly', () => {
    // Loading State
    const { unmount: unmountLoading } = render(<LoadingSkeleton variant="page" />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    unmountLoading();

    // Empty State
    const { unmount: unmountEmpty } = render(<EmptyState title="Không có bản ghi" />);
    expect(screen.getByText('Không có bản ghi')).toBeInTheDocument();
    unmountEmpty();

    // Error State
    const { unmount: unmountError } = render(<ErrorState title="Lỗi kết nối" />);
    expect(screen.getByText('Lỗi kết nối')).toBeInTheDocument();
    unmountError();

    // Offline State
    const { unmount: unmountOffline } = render(<OfflineState />);
    expect(screen.getByText(/Mất kết nối mạng/i)).toBeInTheDocument();
    unmountOffline();

    // 403 Forbidden State
    const { unmount: unmount403 } = render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/403 - Không có quyền truy cập/i)).toBeInTheDocument();
    unmount403();

    // 404 Not Found State
    const { unmount: unmount404 } = render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/404 - Trang không tồn tại/i)).toBeInTheDocument();
    unmount404();

    // Session Expired State
    render(
      <MemoryRouter>
        <SessionExpired />
      </MemoryRouter>
    );
    expect(screen.getByText(/Phiên làm việc đã hết hạn/i)).toBeInTheDocument();
  });

  it('16. Command palette filtering and keyboard interaction', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    // Pre-populate active admin session in storage
    const adminSession = await mockAuthService.switchDemoRole('ADMIN');
    storageAdapter.setSession(adminSession);

    render(
      <MemoryRouter>
        <AuthProvider>
          <CommandPalette isOpen={true} onClose={handleClose} />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait until AuthProvider restores session asynchronously
    const items = await screen.findAllByText('Khách hàng');
    expect(items.length).toBeGreaterThan(0);

    const input = screen.getByPlaceholderText(/Tìm kiếm chức năng/i);
    await user.type(input, 'Báo giá');

    await waitFor(() => {
      expect(screen.getByText('Báo giá')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalled();
  });
});
