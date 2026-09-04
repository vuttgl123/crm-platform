package com.crm.catalog.pricebook.presentation.web;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClonePriceBookRequest(
		@NotBlank @Size(max = 200) String newName,
		@NotBlank @Size(max = 100) String newCode,
		BigDecimal adjustmentPercentage
) {}
