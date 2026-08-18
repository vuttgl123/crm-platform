package com.crm.notification.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.notification.application.dto.NotificationItemDto;
import com.crm.notification.application.dto.UnreadNotificationCountDto;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Service;

@Service
public class InAppNotificationService {

	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;

	private final ConcurrentHashMap<String, List<NotificationItemDto>> notificationStore = new ConcurrentHashMap<>();

	public InAppNotificationService(
			CurrentTenant currentTenant,
			CurrentActor currentActor
	) {
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
	}

	public List<NotificationItemDto> listNotifications(Boolean unreadOnly) {
		TenantId tenantId = currentTenant.require();
		String actorKey = tenantId.value().toString() + "_" + (currentActor.get() != null ? currentActor.get().actorId() : "default");

		List<NotificationItemDto> list = notificationStore.get(actorKey);
		if (list == null || list.isEmpty()) {
			List<NotificationItemDto> defaults = new ArrayList<>();
			defaults.add(new NotificationItemDto(
					UUID.fromString("55000000-0000-0000-0000-000000000001"),
					"Khách hàng Tiềm năng Mới được Phân bổ",
					"Bạn vừa được hệ thống Lead Routing phân bổ Lead 'Công ty Cổ phần Bách Hóa Xanh'.",
					"LEAD_ASSIGNED",
					"HIGH",
					false,
					"/app/leads",
					"2026-08-17 11:15:00"
			));
			defaults.add(new NotificationItemDto(
					UUID.fromString("55000000-0000-0000-0000-000000000002"),
					"⚠️ Cảnh báo SLA Sắp Hết hạn",
					"Yêu cầu hỗ trợ TK-2026-0089 sắp vi phạm SLA cam kết trong vòng 2 giờ tới!",
					"SLA_BREACH",
					"URGENT",
					false,
					"/app/service/tickets",
					"2026-08-17 10:45:00"
			));
			defaults.add(new NotificationItemDto(
					UUID.fromString("55000000-0000-0000-0000-000000000003"),
					"🎉 Chúc mừng! Cơ hội Bán hàng Đã Chốt Thắng",
					"Cơ hội 'Triển khai CRM Enterprise cho Tập đoàn FPT' trị giá 1,2 tỷ ₫ đã Closed Won!",
					"DEAL_WON",
					"HIGH",
					false,
					"/app/opportunities",
					"2026-08-17 09:30:00"
			));
			defaults.add(new NotificationItemDto(
					UUID.fromString("55000000-0000-0000-0000-000000000004"),
					"Nhiệm vụ Đến hạn Trong Ngày",
					"Lịch hẹn gọi điện tư vấn hợp đồng với anh Hoàng Nam lúc 14:00 hôm nay.",
					"TASK_DUE",
					"MEDIUM",
					true,
					"/app/activities",
					"2026-08-17 08:00:00"
			));
			notificationStore.put(actorKey, defaults);
			list = defaults;
		}

		if (Boolean.TRUE.equals(unreadOnly)) {
			return list.stream().filter(n -> !n.isRead()).toList();
		}
		return list;
	}

	public UnreadNotificationCountDto getUnreadCount() {
		List<NotificationItemDto> all = listNotifications(false);
		long count = all.stream().filter(n -> !n.isRead()).count();
		return new UnreadNotificationCountDto((int) count);
	}

	public boolean markAsRead(UUID id) {
		TenantId tenantId = currentTenant.require();
		String actorKey = tenantId.value().toString() + "_" + (currentActor.get() != null ? currentActor.get().actorId() : "default");

		List<NotificationItemDto> list = notificationStore.get(actorKey);
		if (list != null) {
			for (int i = 0; i < list.size(); i++) {
				if (list.get(i).id().equals(id)) {
					NotificationItemDto old = list.get(i);
					list.set(i, new NotificationItemDto(
							old.id(),
							old.title(),
							old.message(),
							old.category(),
							old.priority(),
							true,
							old.actionUrl(),
							old.createdAt()
					));
					return true;
				}
			}
		}
		return true;
	}

	public boolean markAllAsRead() {
		TenantId tenantId = currentTenant.require();
		String actorKey = tenantId.value().toString() + "_" + (currentActor.get() != null ? currentActor.get().actorId() : "default");

		List<NotificationItemDto> list = notificationStore.get(actorKey);
		if (list != null) {
			for (int i = 0; i < list.size(); i++) {
				NotificationItemDto old = list.get(i);
				list.set(i, new NotificationItemDto(
						old.id(),
						old.title(),
						old.message(),
						old.category(),
						old.priority(),
						true,
						old.actionUrl(),
						old.createdAt()
				));
			}
		}
		return true;
	}
}
