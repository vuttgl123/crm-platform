import { ActivitySummary } from '../model/activityTypes';
import { formatDate, formatDateTime } from '@/lib/formatters';

export interface AgendaGroup {
  id: string;
  title: string;
  isOverdue?: boolean;
  isToday?: boolean;
  isUnscheduled?: boolean;
  items: ActivitySummary[];
}

export function formatActivitySchedule(
  start?: string | null,
  end?: string | null
): string {
  if (!start) return 'Not scheduled';

  const startDateStr = formatDateTime(start);
  if (!end) return startDateStr;

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // If on same date, show date + start time - end time
    if (
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDate() === endDate.getDate()
    ) {
      const endTimeStr = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(endDate);
      return `${startDateStr} – ${endTimeStr}`;
    }

    return `${startDateStr} – ${formatDateTime(end)}`;
  } catch {
    return startDateStr;
  }
}

export function formatActivityTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
}

export function groupActivitiesForAgenda(activities: ActivitySummary[]): AgendaGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrowStart = new Date(todayStart.getTime() + 48 * 60 * 60 * 1000);

  const overdueItems: ActivitySummary[] = [];
  const todayItems: ActivitySummary[] = [];
  const dateBuckets = new Map<string, { title: string; dateVal: number; items: ActivitySummary[] }>();
  const unscheduledItems: ActivitySummary[] = [];

  activities.forEach((act) => {
    if (!act.scheduledStartAt) {
      unscheduledItems.push(act);
      return;
    }

    const startDate = new Date(act.scheduledStartAt);
    if (isNaN(startDate.getTime())) {
      unscheduledItems.push(act);
      return;
    }

    // Check if Overdue (planned / in_progress before start of today)
    if (
      (act.status === 'PLANNED' || act.status === 'IN_PROGRESS') &&
      startDate.getTime() < todayStart.getTime()
    ) {
      overdueItems.push(act);
      return;
    }

    // Check if Today
    if (startDate.getTime() >= todayStart.getTime() && startDate.getTime() < tomorrowStart.getTime()) {
      todayItems.push(act);
      return;
    }

    // Future or Past Completed dates bucketed by YYYY-MM-DD
    const dateKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    let title: string;

    if (startDate.getTime() >= tomorrowStart.getTime() && startDate.getTime() < dayAfterTomorrowStart.getTime()) {
      title = `Tomorrow – ${formatDate(startDate)}`;
    } else {
      title = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(startDate);
    }

    const existing = dateBuckets.get(dateKey);
    if (existing) {
      existing.items.push(act);
    } else {
      dateBuckets.set(dateKey, {
        title,
        dateVal: startDate.getTime(),
        items: [act],
      });
    }
  });

  const groups: AgendaGroup[] = [];

  if (overdueItems.length > 0) {
    groups.push({
      id: 'group-overdue',
      title: 'Overdue',
      isOverdue: true,
      items: overdueItems,
    });
  }

  if (todayItems.length > 0) {
    groups.push({
      id: 'group-today',
      title: `Today – ${formatDate(todayStart)}`,
      isToday: true,
      items: todayItems,
    });
  }

  // Sort upcoming date buckets chronologically
  const sortedDateBuckets = Array.from(dateBuckets.values()).sort((a, b) => a.dateVal - b.dateVal);
  sortedDateBuckets.forEach((bucket, idx) => {
    groups.push({
      id: `group-date-${idx}`,
      title: bucket.title,
      items: bucket.items,
    });
  });

  if (unscheduledItems.length > 0) {
    groups.push({
      id: 'group-unscheduled',
      title: 'Unscheduled Work',
      isUnscheduled: true,
      items: unscheduledItems,
    });
  }

  return groups;
}
