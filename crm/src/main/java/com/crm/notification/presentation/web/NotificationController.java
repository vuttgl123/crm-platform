package com.crm.notification.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.notification.application.dto.NotificationItemDto;
import com.crm.notification.application.dto.UnreadNotificationCountDto;
import com.crm.notification.application.service.InAppNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final InAppNotificationService inAppNotificationService;

	public NotificationController(InAppNotificationService inAppNotificationService) {
		this.inAppNotificationService = inAppNotificationService;
	}

	@GetMapping
	public ResponseEntity<List<NotificationItemDto>> listNotifications(
			@RequestParam(required = false) Boolean unreadOnly
	) {
		List<NotificationItemDto> list = inAppNotificationService.listNotifications(unreadOnly);
		return ResponseEntity.ok(list);
	}

	@GetMapping("/unread-count")
	public ResponseEntity<UnreadNotificationCountDto> getUnreadCount() {
		UnreadNotificationCountDto count = inAppNotificationService.getUnreadCount();
		return ResponseEntity.ok(count);
	}

	@PutMapping("/{id}/read")
	public ResponseEntity<Boolean> markAsRead(@PathVariable UUID id) {
		boolean success = inAppNotificationService.markAsRead(id);
		return ResponseEntity.ok(success);
	}

	@PutMapping("/read-all")
	public ResponseEntity<Boolean> markAllAsRead() {
		boolean success = inAppNotificationService.markAllAsRead();
		return ResponseEntity.ok(success);
	}
}
