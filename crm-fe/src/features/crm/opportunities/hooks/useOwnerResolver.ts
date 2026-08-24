import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/core/session/useAuth';
import { teamApi, TeamItem } from '@/services/api/teamApi';
import { membershipApi, MembershipRequestItem } from '@/services/api/membershipApi';
import { OpportunityOwner } from '../model/opportunityTypes';

export interface ResolvedOwner {
  label: string;
  subLabel?: string;
  type: 'USER' | 'TEAM' | 'UNASSIGNED';
  isCurrentUser: boolean;
}

export function useOwnerResolver() {
  const { session } = useAuth();

  // Fetch teams for resolving TEAM owner names
  const { data: teams = [] } = useQuery<TeamItem[]>({
    queryKey: ['platform-teams-lookup'],
    queryFn: async () => {
      try {
        return await teamApi.listTeams();
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  // Fetch approved membership users for resolving USER owner names
  const { data: membershipData } = useQuery<{ items: MembershipRequestItem[] }>({
    queryKey: ['platform-members-lookup'],
    queryFn: async () => {
      try {
        return await membershipApi.searchRequests('APPROVED');
      } catch {
        return { items: [] };
      }
    },
    staleTime: 60000,
  });

  const teamMap = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((t) => {
      if (t.id && t.name) map.set(t.id, t.name);
    });
    if (session?.assignedTeam?.id && session.assignedTeam.name) {
      map.set(session.assignedTeam.id, session.assignedTeam.name);
    }
    return map;
  }, [teams, session?.assignedTeam]);

  const userMap = useMemo(() => {
    const map = new Map<string, { displayName: string; email?: string }>();
    (membershipData?.items || []).forEach((m) => {
      if (m.requester?.id && m.requester.displayName) {
        map.set(m.requester.id, {
          displayName: m.requester.displayName,
          email: m.requester.email,
        });
      }
    });
    const currentUserName = session?.user?.display_name || (session?.user as any)?.displayName;
    if (session?.user?.id && currentUserName) {
      map.set(session.user.id, {
        displayName: currentUserName,
        email: session.user.email,
      });
    }
    return map;
  }, [membershipData, session?.user]);

  const resolveOwner = useMemo(() => {
    return (owner?: OpportunityOwner | null): ResolvedOwner => {
      if (!owner || !owner.id) {
        return {
          label: 'Unassigned',
          type: 'UNASSIGNED',
          isCurrentUser: false,
        };
      }

      if (owner.type === 'USER') {
        const isCurrent = owner.id === session?.user?.id;
        const matchedUser = userMap.get(owner.id);
        const currentUserName = session?.user?.display_name || (session?.user as any)?.displayName;
        const name = matchedUser?.displayName || (isCurrent ? currentUserName : null);

        if (name) {
          return {
            label: isCurrent ? `${name} (You)` : name,
            subLabel: matchedUser?.email || (isCurrent ? session?.user?.email : undefined),
            type: 'USER',
            isCurrentUser: isCurrent,
          };
        }

        return {
          label: `User (${owner.id.slice(0, 8)}…)`,
          type: 'USER',
          isCurrentUser: false,
        };
      }

      if (owner.type === 'TEAM') {
        const matchedTeamName = teamMap.get(owner.id);
        if (matchedTeamName) {
          return {
            label: matchedTeamName,
            subLabel: 'Team',
            type: 'TEAM',
            isCurrentUser: false,
          };
        }

        return {
          label: `Team (${owner.id.slice(0, 8)}…)`,
          type: 'TEAM',
          isCurrentUser: false,
        };
      }

      return {
        label: 'Unassigned',
        type: 'UNASSIGNED',
        isCurrentUser: false,
      };
    };
  }, [session?.user, teamMap, userMap]);

  const userList = useMemo(() => {
    return Array.from(userMap.entries()).map(([id, info]) => ({
      id,
      displayName: info.displayName,
      email: info.email,
    }));
  }, [userMap]);

  return { resolveOwner, teams, userMap, userList, teamList: teams };
}

