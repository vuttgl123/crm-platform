package com.crm.overview.infrastructure.persistence;

/** Exact counts of open activities, independent of any list truncation. */
public record DueActivityCounts(long overdueCount, long dueTodayCount) {
}
