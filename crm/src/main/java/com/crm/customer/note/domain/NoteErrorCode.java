package com.crm.customer.note.domain;

public enum NoteErrorCode {

	NOTE_NOT_FOUND("NOTE_NOT_FOUND"),
	INVALID_NOTE_TARGET("INVALID_NOTE_TARGET"),
	NOTE_ACCESS_DENIED("NOTE_ACCESS_DENIED"),
	NOTE_VERSION_CONFLICT("NOTE_VERSION_CONFLICT");

	private final String code;

	NoteErrorCode(String code) {
		this.code = code;
	}

	public String code() {
		return code;
	}

}
