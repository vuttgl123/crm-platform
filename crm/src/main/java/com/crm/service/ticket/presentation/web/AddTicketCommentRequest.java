package com.crm.service.ticket.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.crm.service.ticket.domain.CommentVisibility;

public record AddTicketCommentRequest(
		UUID authorUserId,

		UUID authorContactId,

		@NotBlank(message = "Comment body must not be blank")
		@Size(max = 10000, message = "Comment body must not exceed 10000 characters")
		String body,

		CommentVisibility visibility,

		@Size(max = 50, message = "Channel must not exceed 50 characters")
		String channel,

		@Size(max = 255, message = "External message ID must not exceed 255 characters")
		String externalMessageId
) {
}
