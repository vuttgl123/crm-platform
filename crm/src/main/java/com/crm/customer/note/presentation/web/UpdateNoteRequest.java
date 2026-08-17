package com.crm.customer.note.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.customer.note.domain.NoteVisibility;

public record UpdateNoteRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@Size(max = 255, message = "Title must not exceed 255 characters")
		String title,

		@NotBlank(message = "Note body must not be blank")
		String body,

		NoteVisibility visibility
) {
}
