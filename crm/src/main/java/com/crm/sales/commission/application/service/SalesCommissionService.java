package com.crm.sales.commission.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.sales.commission.application.dto.ApproveCommissionRequest;
import com.crm.sales.commission.application.dto.CalculateCommissionRequest;
import com.crm.sales.commission.application.dto.SalesCommissionItemDto;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Service;

@Service
public class SalesCommissionService {

	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;

	private final ConcurrentHashMap<String, List<SalesCommissionItemDto>> commissionStore = new ConcurrentHashMap<>();

	public SalesCommissionService(
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer
	) {
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
	}

	public List<SalesCommissionItemDto> listCommissions(String period) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.SALES_ORDER_READ);

		List<SalesCommissionItemDto> list = commissionStore.get(tenantId.value().toString());
		if (list == null || list.isEmpty()) {
			List<SalesCommissionItemDto> defaults = new ArrayList<>();
			defaults.add(new SalesCommissionItemDto(
					UUID.fromString("66000000-0000-0000-0000-000000000001"),
					"Phạm Tuấn Vũ",
					period != null ? period : "2026-08",
					450_000_000.0,
					400_000_000.0,
					112.5,
					12.0,
					54_000_000.0,
					1_000_000.0,
					55_000_000.0,
					"APPROVED",
					"Giám đốc Kinh doanh",
					"2026-08-16 17:00:00"
			));
			defaults.add(new SalesCommissionItemDto(
					UUID.fromString("66000000-0000-0000-0000-000000000002"),
					"Nguyễn Văn An",
					period != null ? period : "2026-08",
					280_000_000.0,
					300_000_000.0,
					93.3,
					8.0,
					22_400_000.0,
					0.0,
					22_400_000.0,
					"PENDING_APPROVAL",
					null,
					"2026-08-16 17:00:00"
			));
			commissionStore.put(tenantId.value().toString(), defaults);
			return defaults;
		}

		return list;
	}

	public SalesCommissionItemDto calculateCommission(CalculateCommissionRequest request) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.SALES_ORDER_WRITE);

		double closedRevenue = 350_000_000.0;
		double targetQuota = request.targetQuota() != null ? request.targetQuota() : 300_000_000.0;
		double attainment = (closedRevenue / targetQuota) * 100.0;

		double basePercent = closedRevenue > 300_000_000.0 ? 12.0 : closedRevenue > 100_000_000.0 ? 8.0 : 5.0;
		double baseAmount = (closedRevenue * basePercent) / 100.0;
		double kickerBonus = attainment > 100.0 ? (closedRevenue - targetQuota) * 0.02 : 0.0;
		double totalPayout = baseAmount + kickerBonus;

		SalesCommissionItemDto item = new SalesCommissionItemDto(
				UUID.randomUUID(),
				request.salesRepName() != null ? request.salesRepName() : "Chuyên viên Kinh doanh",
				request.period() != null ? request.period() : "2026-08",
				closedRevenue,
				targetQuota,
				attainment,
				basePercent,
				baseAmount,
				kickerBonus,
				totalPayout,
				"PENDING_APPROVAL",
				null,
				"2026-08-17 11:30:00"
		);

		commissionStore.computeIfAbsent(tenantId.value().toString(), k -> new ArrayList<>()).add(item);
		return item;
	}

	public boolean approveCommission(UUID id, ApproveCommissionRequest request) {
		TenantId tenantId = currentTenant.require();
		authorizer.requireAny(currentActor.get(), SystemPermission.SALES_ORDER_WRITE);

		List<SalesCommissionItemDto> list = commissionStore.get(tenantId.value().toString());
		if (list != null) {
			for (int i = 0; i < list.size(); i++) {
				if (list.get(i).id().equals(id)) {
					SalesCommissionItemDto old = list.get(i);
					list.set(i, new SalesCommissionItemDto(
							old.id(),
							old.salesRepName(),
							old.period(),
							old.totalClosedRevenue(),
							old.targetQuota(),
							old.quotaAttainmentPercent(),
							old.baseCommissionPercent(),
							old.baseCommissionAmount(),
							old.kickerBonusAmount(),
							old.totalPayoutAmount(),
							"APPROVED",
							"Trưởng phòng / Kế toán",
							old.calculatedAt()
					));
					return true;
				}
			}
		}
		return true;
	}
}
