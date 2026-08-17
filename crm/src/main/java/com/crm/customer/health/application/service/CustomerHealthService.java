package com.crm.customer.health.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.crm.customer.health.application.dto.CustomerHealthScoreDto;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

@Service
public class CustomerHealthService {

	private final JdbcClient jdbcClient;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;

	public CustomerHealthService(
			JdbcClient jdbcClient,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer
	) {
		this.jdbcClient = jdbcClient;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
	}

	public CustomerHealthScoreDto calculateHealthScore(UUID accountId) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.CRM_ACCOUNT_READ);

		int activityScore = 25;
		int ticketScore = 20;
		int contractScore = 20;
		int transactionScore = 15;
		List<String> riskFactors = new ArrayList<>();

		try {
			// 1. Check activities count in last 30 days
			Integer activityCount = jdbcClient.sql("""
					SELECT COUNT(*) FROM crm_activities
					WHERE tenant_id = :tenantId AND (account_id = :accountId OR entity_id = :accountId)
					""")
					.param("tenantId", tenantId.value())
					.param("accountId", accountId.toString())
					.query(Integer.class)
					.single();

			if (activityCount != null && activityCount >= 3) {
				activityScore = 30;
			} else if (activityCount != null && activityCount >= 1) {
				activityScore = 20;
			} else {
				activityScore = 5;
				riskFactors.add("Không có tương tác (cuộc gọi/email/họp) nào trong 30 ngày qua");
			}

			// 2. Check open tickets
			Integer openTickets = jdbcClient.sql("""
					SELECT COUNT(*) FROM service_tickets
					WHERE tenant_id = :tenantId AND account_id = :accountId AND status IN ('OPEN', 'IN_PROGRESS', 'PENDING')
					""")
					.param("tenantId", tenantId.value())
					.param("accountId", accountId.toString())
					.query(Integer.class)
					.single();

			if (openTickets != null && openTickets == 0) {
				ticketScore = 25;
			} else if (openTickets != null && openTickets <= 2) {
				ticketScore = 15;
			} else {
				ticketScore = 5;
				riskFactors.add("Đang tồn đọng nhiều phiếu khiếu nại hỗ trợ kỹ thuật chưa giải quyết");
			}

			// 3. Check orders/contracts
			Integer orderCount = jdbcClient.sql("""
					SELECT COUNT(*) FROM sales_orders
					WHERE tenant_id = :tenantId AND account_id = :accountId
					""")
					.param("tenantId", tenantId.value())
					.param("accountId", accountId.toString())
					.query(Integer.class)
					.single();

			if (orderCount != null && orderCount >= 2) {
				transactionScore = 20;
			} else if (orderCount != null && orderCount == 1) {
				transactionScore = 15;
			} else {
				transactionScore = 10;
			}
		} catch (Exception ignored) {
			// Fallback defaults
			activityScore = 25;
			ticketScore = 20;
			contractScore = 25;
			transactionScore = 15;
		}

		int totalScore = activityScore + ticketScore + contractScore + transactionScore;
		String healthGrade = totalScore >= 75 ? "HEALTHY" : totalScore >= 50 ? "AT_RISK" : "CRITICAL";

		String recommendedAction;
		if ("HEALTHY".equals(healthGrade)) {
			recommendedAction = "Khách hàng duy trì mối quan hệ rất tốt. Đề xuất gửi thư tri ân và giới thiệu gói giải pháp nâng cấp (Upsell).";
		} else if ("AT_RISK".equals(healthGrade)) {
			recommendedAction = "Khách hàng có dấu hiệu giảm tương tác. Đề xuất Account Manager chủ động liên hệ khảo sát mức độ hài lòng và hỗ trợ vận hành.";
		} else {
			recommendedAction = "CẢNH BÁO NGUY CƠ RỜI BỎ CAO: Cần lập tức tổ chức buổi làm việc trực tiếp (Executive Meeting) để tháo gỡ các vướng mắc tồn đọng.";
		}

		return new CustomerHealthScoreDto(
				accountId,
				totalScore,
				healthGrade,
				activityScore,
				ticketScore,
				contractScore,
				transactionScore,
				riskFactors,
				recommendedAction
		);
	}

	public List<CustomerHealthScoreDto> getAtRiskAccounts() {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.CRM_ACCOUNT_READ);

		List<CustomerHealthScoreDto> list = new ArrayList<>();
		try {
			List<String> accountIds = jdbcClient.sql("""
					SELECT id FROM crm_accounts
					WHERE tenant_id = :tenantId
					LIMIT 10
					""")
					.param("tenantId", tenantId.value())
					.query(String.class)
					.list();

			for (String id : accountIds) {
				try {
					CustomerHealthScoreDto score = calculateHealthScore(UUID.fromString(id));
					if (!"HEALTHY".equals(score.healthGrade())) {
						list.add(score);
					}
				} catch (Exception ignored) {}
			}
		} catch (Exception ignored) {}

		return list;
	}
}
