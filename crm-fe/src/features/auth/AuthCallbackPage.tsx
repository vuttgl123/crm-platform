import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { realAuthService } from '@/services/api/RealAuthService';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    realAuthService
      .handleOAuth2Callback()
      .then(() => {
        if (mounted) {
          navigate('/app/overview', { replace: true });
        }
      })
      .catch((err) => {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Đăng nhập OAuth2 thất bại';
          setErrorMessage(message);
          setTimeout(() => {
            navigate('/login?error=OAUTH2_FAILED', { replace: true });
          }, 2000);
        }
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center border border-red-200">
          <h2 className="text-lg font-bold text-red-600 mb-2">Đăng nhập không thành công</h2>
          <p className="text-sm text-slate-600 mb-4">{errorMessage}</p>
          <p className="text-xs text-slate-400">Đang tự động chuyển hướng về trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <LoadingSkeleton variant="card" />
        <p className="mt-4 text-sm text-slate-600 font-medium">Đang đồng bộ phiên làm việc SSO...</p>
      </div>
    </div>
  );
};
