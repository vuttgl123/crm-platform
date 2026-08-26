package com.crm.overview.application.dto;

import java.util.List;

/**
 * Open activities that have already started or start before the end of today,
 * measured in the tenant's timezone.
 *
 * <p>The counts cover every matching activity; {@code items} is capped, so the
 * list length must not be used as a count.
 */
public record MyDayBlock(
		long overdueCount,
		long dueTodayCount,
		List<DueActivity> items
) {
}
