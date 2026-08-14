import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface ProfileHeaderCardProps {
  /** Optional back navigation URL (e.g. '/app/crm/accounts') */
  backUrl?: string;
  /** Optional back button label (e.g. 'Danh sách Khách hàng') */
  backLabel?: string;
  /** Breadcrumb current label */
  breadcrumbCurrent?: string;

  /** Banner right tag badge (e.g. 'Hồ sơ Khách hàng Doanh nghiệp') */
  coverTag?: React.ReactNode;
  /** Avatar initials or fallback text */
  avatarText?: string;
  /** Avatar image source URL */
  avatarSrc?: string;
  /** Avatar action element (e.g. camera edit button) */
  avatarAction?: React.ReactNode;

  /** Main title (e.g. Display Name) */
  title: React.ReactNode;
  /** Subtitle text or element (e.g. Legal Name or Job Title) */
  subtitle?: React.ReactNode;
  /** Show verified check badge next to title */
  verified?: boolean;

  /** Row of status/type badges on the bottom right of hero header */
  badges?: React.ReactNode;

  /** Top right action buttons (e.g. Refresh, Edit, Delete, Save) */
  actions?: React.ReactNode;

  /** Main content below header (typically Tabs or TabContent) */
  children?: React.ReactNode;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  backUrl,
  backLabel,
  breadcrumbCurrent,
  coverTag,
  avatarText = 'U',
  avatarSrc,
  avatarAction,
  title,
  subtitle,
  verified = true,
  badges,
  actions,
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 pb-10 font-sans w-full">
      {/* Navigation & Action Top Bar */}
      {(backUrl || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {backUrl && (
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(backUrl)}
                className="h-8 px-2.5 text-xs font-semibold border-slate-200 gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{backLabel || 'Quay lại'}</span>
              </Button>
              {breadcrumbCurrent && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {breadcrumbCurrent}
                  </span>
                </>
              )}
            </div>
          )}

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Top Banner Hero Card with Perfect Alignment */}
      <Card className="shadow-xs border-slate-200/90 overflow-hidden w-full bg-white rounded-xl">
        <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative">
          {coverTag && (
            <div className="absolute top-3 right-4 flex items-center gap-2">
              {typeof coverTag === 'string' ? (
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-xs gap-1.5 px-3 py-1 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  {coverTag}
                </Badge>
              ) : (
                coverTag
              )}
            </div>
          )}
        </div>

        <CardContent className="px-6 pb-4 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {/* Only Avatar takes the negative margin offset */}
              <div className="relative -mt-10 shrink-0">
                <Avatar className="w-20 h-20 border-4 border-white shadow-md rounded-2xl bg-blue-600">
                  {avatarSrc && <AvatarImage src={avatarSrc} alt="Avatar" />}
                  <AvatarFallback className="bg-blue-600 text-white font-black text-xl rounded-2xl">
                    {avatarText}
                  </AvatarFallback>
                </Avatar>
                {avatarAction}
              </div>

              {/* Title & Subtitle sit cleanly on white background */}
              <div className="pt-1 sm:pt-0 sm:pb-1 space-y-0.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>{title}</span>
                  {verified && <CheckCircle2 className="w-4.5 h-4.5 text-blue-600 fill-blue-50 shrink-0" />}
                </h1>
                {subtitle && (
                  <div className="text-xs text-slate-500 font-medium">{subtitle}</div>
                )}
              </div>
            </div>

            {badges && (
              <div className="flex items-center gap-2 flex-wrap sm:pb-1">
                {badges}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Body / Tabs Container */}
      {children}
    </div>
  );
};
