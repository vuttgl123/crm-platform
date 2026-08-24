package com.crm.sales.quote.application.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import com.crm.sales.quote.application.command.QuoteLineInputCommand;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteLine;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

@Service
public class QuotePricingService {

	private final JdbcClient jdbcClient;

	public QuotePricingService(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	public List<QuoteLine> buildAndCalculateLines(
			TenantId tenantId,
			QuoteId quoteId,
			UUID priceBookId,
			List<QuoteLineInputCommand> inputs,
			Instant now
	) {
		if (inputs == null || inputs.isEmpty()) {
			return List.of();
		}

		List<QuoteLine> calculatedLines = new ArrayList<>();
		int position = 1;

		for (QuoteLineInputCommand input : inputs) {
			// Query Product snapshot and Price Book Item snapshot
			Map<String, Object> row = jdbcClient.sql("""
					SELECT p.sku, p.name AS product_name, p.unit_of_measure, p.description,
					       pbi.unit_price AS list_price, pbi.id AS pbi_id
					FROM catalog.products p
					LEFT JOIN catalog.price_book_items pbi ON pbi.tenant_id = p.tenant_id
					                                     AND pbi.product_id = p.id
					                                     AND pbi.price_book_id = :priceBookId
					                                     AND pbi.id = :priceBookItemId
					WHERE p.tenant_id = :tenantId
					  AND p.id = :productId
					  AND p.deleted_at IS NULL
					""")
					.param("tenantId", tenantId.value())
					.param("priceBookId", priceBookId.toString())
					.param("priceBookItemId", input.priceBookItemId().toString())
					.param("productId", input.productId().toString())
					.query()
					.listOfRows()
					.stream()
					.findFirst()
					.orElse(null);

			String sku = row != null && row.get("sku") != null ? String.valueOf(row.get("sku")) : "SKU-" + input.productId().toString().substring(0, 8);
			String name = row != null && row.get("product_name") != null ? String.valueOf(row.get("product_name")) : "Product";
			String unit = row != null && row.get("unit_of_measure") != null ? String.valueOf(row.get("unit_of_measure")) : "Item";
			String desc = input.description() != null && !input.description().isBlank() ? input.description() : (row != null && row.get("description") != null ? String.valueOf(row.get("description")) : null);
			BigDecimal listUnitPrice = row != null && row.get("list_price") != null ? new BigDecimal(String.valueOf(row.get("list_price"))) : input.salesUnitPrice();

			QuoteLine line = QuoteLine.calculate(
					input.id(),
					quoteId,
					position++,
					input.productId(),
					input.priceBookItemId(),
					sku,
					name,
					unit,
					desc,
					input.quantity(),
					listUnitPrice,
					input.salesUnitPrice(),
					input.discountPercent(),
					input.taxPercent(),
					now
			);

			calculatedLines.add(line);
		}

		return calculatedLines;
	}
}
