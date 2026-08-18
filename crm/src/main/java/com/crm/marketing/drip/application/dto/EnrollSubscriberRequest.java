package com.crm.marketing.drip.application.dto;

import java.util.UUID;

public record EnrollSubscriberRequest(
		String subscriberType,
		UUID subscriberId,
		String subscriberName,
		String email,
		String phone
) {}
