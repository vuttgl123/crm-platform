import {
  RoleDetailResponse,
  PermissionResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleDataScope,
} from '@/services/api/roleApi';
import {
  ExtendedPermission,
  RoleDraft,
  RoleEditorMode,
} from './roleTypes';

export const MODULE_NAMES: Record<string, { en: string; vi: string }> = {
  crm: { en: 'Customer Relationship Management', vi: 'Quản trị Quan hệ Khách hàng (CRM)' },
  sales: { en: 'Sales & Commercial Operations', vi: 'Quản lý Bán hàng & Thương mại' },
  service: { en: 'Service & Support Operations', vi: 'Dịch vụ & Chăm sóc Khách hàng' },
  platform: { en: 'Platform & Security Governance', vi: 'Quản trị Nền tảng & Bảo mật' },
  audit: { en: 'Audit & Compliance Logging', vi: 'Kiểm toán & Truy vết Hệ thống' },
  privacy: { en: 'Data Privacy & Protection', vi: 'Quyền riêng tư & Bảo vệ Dữ liệu' },
};

export function mapPermissionResponse(p: PermissionResponse): ExtendedPermission {
  const code = p.permissionCode || p.code || '';
  const modCode = (p.moduleCode || 'other').toLowerCase();
  const moduleInfo = MODULE_NAMES[modCode] || {
    en: p.moduleCode ? p.moduleCode.toUpperCase() : 'System',
    vi: p.moduleCode ? p.moduleCode.toUpperCase() : 'Hệ thống',
  };

  return {
    ...p,
    permissionCode: code,
    description: p.description || p.descriptionVi || code,
    moduleCode: modCode,
    moduleNameEn: moduleInfo.en,
    moduleNameVi: moduleInfo.vi,
    actionName: p.displayNameEn || p.displayNameVi || p.description || code,
    riskLevel: p.riskLevel || 'NORMAL',
  };
}

export function createInitialRoleDraft(): RoleDraft {
  return {
    roleCode: '',
    name: '',
    description: '',
    status: 'ACTIVE',
    system: false,
    permissionCodes: [],
    dataScopes: [],
  };
}

export function roleDetailToDraft(
  detail: RoleDetailResponse,
  mode: RoleEditorMode
): RoleDraft {
  if (mode === 'clone') {
    return {
      roleCode: '',
      name: `${detail.name} (Copy)`,
      description: detail.description || '',
      status: 'ACTIVE',
      system: false,
      permissionCodes: [...(detail.permissionCodes || [])],
      dataScopes: (detail.dataScopes || []).map((ds) => ({ ...ds })),
      cloneSourceName: detail.name,
    };
  }

  return {
    id: detail.id,
    roleCode: detail.roleCode,
    name: detail.name,
    description: detail.description || '',
    status: detail.status,
    system: detail.system || false,
    permissionCodes: [...(detail.permissionCodes || [])],
    dataScopes: (detail.dataScopes || []).map((ds) => ({ ...ds })),
    version: detail.version,
  };
}

export function sanitizeDataScopes(scopes: RoleDataScope[]): RoleDataScope[] {
  const seen = new Set<string>();
  const sanitized: RoleDataScope[] = [];

  for (const s of scopes) {
    const entityType = s.entityType.trim().toUpperCase();
    const type = s.type;
    const teamId = (type === 'TEAM' || type === 'TEAM_TREE') && s.teamId ? s.teamId : undefined;
    const key = `${entityType}:${type}:${teamId || ''}`;

    if (!seen.has(key)) {
      seen.add(key);
      sanitized.push({
        entityType,
        type,
        ...(teamId ? { teamId } : {}),
      });
    }
  }

  return sanitized;
}

export function draftToCreateRequest(draft: RoleDraft): CreateRoleRequest {
  return {
    roleCode: draft.roleCode.trim().toUpperCase(),
    name: draft.name.trim(),
    description: draft.description ? draft.description.trim() : undefined,
    permissionCodes: Array.from(new Set(draft.permissionCodes)),
    dataScopes: sanitizeDataScopes(draft.dataScopes),
  };
}

export function draftToUpdateRequest(
  draft: RoleDraft,
  originalVersion: number
): UpdateRoleRequest {
  return {
    version: originalVersion,
    name: draft.name.trim(),
    description: draft.description ? draft.description.trim() : undefined,
    status: draft.status,
    permissionCodes: Array.from(new Set(draft.permissionCodes)),
    dataScopes: sanitizeDataScopes(draft.dataScopes),
  };
}
