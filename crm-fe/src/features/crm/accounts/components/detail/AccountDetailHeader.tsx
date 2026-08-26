import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  renderAccountTypeBadge,
  renderLifecycleStageBadge,
} from '@/config/crmStatusConfig';
import { formatDateTime } from '@/lib/formatters';
import { AccountResponse } from '../../model/accountTypes';
import { useOwnerResolver } from '../../hooks/useOwnerResolver';
import { toast } from 'sonner';
import {
  Building2,
  ChevronRight,
  Edit,
  Trash2,
  User,
  Users,
  Ban,
  Camera,
} from 'lucide-react';

interface AccountDetailHeaderProps {
  account: AccountResponse;
  canWrite: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const AccountDetailHeader: React.FC<AccountDetailHeaderProps> = ({
  account,
  canWrite,
  onEdit,
  onDelete,
}) => {
  const { resolveOwner } = useOwnerResolver();
  const ownerInfo = resolveOwner(account.owner);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageKey = `crm_account_avatar_${account.id}`;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    return localStorage.getItem(storageKey);
  });

  useEffect(() => {
    setAvatarUrl(localStorage.getItem(storageKey));
  }, [account.id, storageKey]);

  const handleAvatarClick = () => {
    if (!canWrite) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (PNG, JPG, SVG, WebP).',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum image size is 5MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        localStorage.setItem(storageKey, dataUrl);
        setAvatarUrl(dataUrl);
        toast.success('Account avatar updated', {
          description: `Logo uploaded for ${account.displayName}.`,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3 font-sans w-full">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/app/crm/accounts" className="hover:text-blue-600 font-medium">
          Accounts
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-sm">
          {account.displayName}
        </span>
      </div>

      {/* Main Identity Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Avatar / Logo Pod with Upload Overlay */}
          <div className="relative group shrink-0 mt-0.5">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={!canWrite}
              title={canWrite ? 'Click to upload account logo / avatar' : undefined}
              className={`w-12 h-12 rounded-[4px] overflow-hidden flex items-center justify-center font-bold relative transition-all ${
                avatarUrl
                  ? 'border border-slate-200 bg-white'
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
              } ${canWrite ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''}`}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={account.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 text-blue-600" />
              )}

              {/* Hover Overlay for Uploading */}
              {canWrite && (
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                  <Camera className="w-4 h-4" />
                  <span className="text-[9px] font-semibold mt-0.5">Upload</span>
                </div>
              )}
            </button>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                {account.displayName}
              </h1>
              {account.legalName && (
                <span className="text-xs text-slate-500 italic">
                  ({account.legalName})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-[2px]">
                {account.accountNumber}
              </span>
              {renderAccountTypeBadge(account.accountType)}
              {renderLifecycleStageBadge(account.lifecycleStage)}
              {account.doNotContact && (
                <Badge
                  variant="destructive"
                  className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-2 py-0.5 font-bold gap-1 rounded-[2px]"
                >
                  <Ban className="w-3 h-3" />
                  <span>Do Not Contact</span>
                </Badge>
              )}
            </div>

            {/* Clean inline account description directly below the title/badges */}
            {account.description && (
              <p className="text-xs text-slate-600 leading-relaxed font-normal pt-1 max-w-4xl">
                {account.description}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Owner, Timestamps & Action Buttons in Column */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <div className="hidden lg:flex flex-col items-end text-xs text-slate-500 pr-3 border-r border-slate-200">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              {account.owner ? (
                <>
                  {ownerInfo.type === 'USER' ? (
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className={ownerInfo.isCurrentUser ? 'font-bold text-slate-900' : 'text-slate-800'}>
                    {ownerInfo.label}
                  </span>
                </>
              ) : (
                <span className="italic text-slate-400">Unassigned Owner</span>
              )}
            </div>
            <div className="flex flex-col items-end text-[11px] text-slate-400 font-mono mt-0.5 space-y-0.5">
              <span>Created: {formatDateTime(account.createdAt)}</span>
              <span>Updated: {formatDateTime(account.updatedAt)}</span>
            </div>
          </div>

          {/* Action Buttons: Column of Edit Account + Delete Account */}
          {canWrite && (
            <div className="flex flex-col gap-1.5 min-w-[115px]">
              <Button
                size="sm"
                onClick={onEdit}
                className="h-7 px-2.5 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none w-full justify-start"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Account</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={onDelete}
                className="h-7 px-2.5 text-xs font-semibold border-rose-200 bg-rose-50/40 text-rose-700 hover:bg-rose-100 hover:border-rose-300 rounded-[3px] gap-1.5 shadow-none w-full justify-start transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDetailHeader;
