export interface RoleErrorMessage {
  title: string;
  description: string;
  recoveryAction?: 'RELOAD' | 'RETRY' | 'GO_PERMISSIONS' | 'GO_SCOPES' | 'CLOSE';
}

export function parseRoleError(err: unknown): RoleErrorMessage {
  const defaultError: RoleErrorMessage = {
    title: 'Operation Failed',
    description: 'An unexpected system error occurred while processing the role request. Please try again.',
    recoveryAction: 'RETRY',
  };

  if (!err) return defaultError;

  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes('ROLE_CODE_ALREADY_EXISTS') || msg.toLowerCase().includes('already exists')) {
    return {
      title: 'Role Code Already In Use',
      description: 'The specified Role Code is already registered for another role in this organization. Please choose a unique identifier.',
    };
  }

  if (msg.includes('ROLE_VERSION_CONFLICT') || msg.includes('412') || msg.includes('If-Match')) {
    return {
      title: 'Concurrent Modification Detected',
      description: 'This role has been modified by another administrator since you opened it. Please reload the latest version to avoid overwriting changes.',
      recoveryAction: 'RELOAD',
    };
  }

  if (msg.includes('SYSTEM_ROLE_IMMUTABLE')) {
    return {
      title: 'System Role Protected',
      description: 'Built-in system roles are read-only and cannot be altered or removed.',
      recoveryAction: 'CLOSE',
    };
  }

  if (msg.includes('ROLE_NOT_FOUND') || msg.includes('404')) {
    return {
      title: 'Role Not Found',
      description: 'The selected role no longer exists or was deleted by another administrator.',
      recoveryAction: 'RELOAD',
    };
  }

  if (msg.includes('ACCESS_DENIED') || msg.includes('403')) {
    return {
      title: 'Permission Denied',
      description: 'You do not have the required "platform_role.manage" authority to modify security roles.',
      recoveryAction: 'CLOSE',
    };
  }

  if (msg.includes('ROLE_PERMISSION_UNKNOWN')) {
    return {
      title: 'Invalid Permission Assigned',
      description: 'One or more assigned permission codes are no longer valid in the system catalogue.',
      recoveryAction: 'GO_PERMISSIONS',
    };
  }

  if (msg.includes('ROLE_DATA_SCOPE_INVALID')) {
    return {
      title: 'Invalid Data Scoping Configuration',
      description: 'Please ensure that all TEAM and TEAM_TREE scoping entries have a valid team assigned.',
      recoveryAction: 'GO_SCOPES',
    };
  }

  return {
    ...defaultError,
    description: msg || defaultError.description,
  };
}
