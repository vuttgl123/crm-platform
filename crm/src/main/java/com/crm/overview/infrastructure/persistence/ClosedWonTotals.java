package com.crm.overview.infrastructure.persistence;

import java.math.BigDecimal;

/** Won revenue over one explicit date range, in one currency. */
public record ClosedWonTotals(BigDecimal amount, long count) {
}
