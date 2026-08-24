import React from 'react';
import { useAuth } from '@/core/session/useAuth';
import { ActivityOwnerRef, ActivityOwnerKind } from '../model/activityTypes';

export interface ResolvedOwnerInfo {
  type: ActivityOwnerKind;
  id: string;
  label: string;
  isCurrentUser: boolean;
}

export function useOwnerResolver() {
  const { session } = useAuth();
  const currentUserId = session?.user?.id;
  const currentUserName =
    session?.user?.display_name || (session?.user as any)?.displayName || 'Current User';
  const currentTeamId = session?.assignedTeam?.id;
  const currentTeamName = session?.assignedTeam?.name || 'Assigned Team';

  const resolveOwner = React.useCallback(
    (owner?: ActivityOwnerRef | { kind?: ActivityOwnerKind; type?: ActivityOwnerKind; id: string; displayName?: string } | null): ResolvedOwnerInfo => {
      if (!owner || !owner.id) {
        return {
          type: 'USER',
          id: '',
          label: 'Unassigned',
          isCurrentUser: false,
        };
      }

      const kind = (owner as any).kind || (owner as any).type || 'USER';

      if (kind === 'USER') {
        if (currentUserId && owner.id === currentUserId) {
          return {
            type: 'USER',
            id: owner.id,
            label: `${currentUserName} (You)`,
            isCurrentUser: true,
          };
        }
        if (owner.displayName) {
          return {
            type: 'USER',
            id: owner.id,
            label: owner.displayName,
            isCurrentUser: false,
          };
        }
        return {
          type: 'USER',
          id: owner.id,
          label: `User (${owner.id.slice(0, 8)}…)`,
          isCurrentUser: false,
        };
      }

      // TEAM kind
      if (currentTeamId && owner.id === currentTeamId) {
        return {
          type: 'TEAM',
          id: owner.id,
          label: currentTeamName,
          isCurrentUser: false,
        };
      }
      if (owner.displayName) {
        return {
          type: 'TEAM',
          id: owner.id,
          label: owner.displayName,
          isCurrentUser: false,
        };
      }
      return {
        type: 'TEAM',
        id: owner.id,
        label: `Team (${owner.id.slice(0, 8)}…)`,
        isCurrentUser: false,
      };
    },
    [currentUserId, currentUserName, currentTeamId, currentTeamName]
  );

  return {
    resolveOwner,
    currentUserId,
    currentUserName,
    currentTeamId,
    currentTeamName,
  };
}
