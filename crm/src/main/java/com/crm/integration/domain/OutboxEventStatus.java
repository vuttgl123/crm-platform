package com.crm.integration.domain;

public enum OutboxEventStatus {
	PENDING,
	PROCESSING,
	PUBLISHED,
	FAILED,
	DEAD
}
