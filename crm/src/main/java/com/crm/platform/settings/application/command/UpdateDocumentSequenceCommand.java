package com.crm.platform.settings.application.command;

public record UpdateDocumentSequenceCommand(
		String entityType,
		String prefix,
		String dateFormatPattern,
		int paddingLength
) {}
