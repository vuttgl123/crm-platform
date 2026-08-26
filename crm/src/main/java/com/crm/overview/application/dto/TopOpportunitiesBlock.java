package com.crm.overview.application.dto;

import java.util.List;

/**
 * The largest open opportunities the actor may see.
 *
 * <p>Restricted to a single {@code currencyCode} on purpose: ranking by amount
 * across currencies without exchange rates would order the list by the size of
 * the currency unit rather than by deal value.
 */
public record TopOpportunitiesBlock(
		String currencyCode,
		List<OpportunityHighlight> items
) {
}
