package com.crm.sales.contract.application.command;

import java.util.List;
import java.util.UUID;

public record BulkSubmitContractReviewCommand(
		List<UUID> contractIds
) {}
