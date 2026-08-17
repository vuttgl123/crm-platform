package com.crm.customer.note.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.customer.note.application.dto.NoteSummary;
import com.crm.customer.note.application.query.NoteSearchQuery;
import com.crm.customer.note.domain.Note;
import com.crm.customer.note.domain.NoteId;
import com.crm.sharedkernel.domain.TenantId;

public interface NoteRepository {

	Optional<Note> findById(TenantId tenantId, NoteId id);

	List<NoteSummary> findByTarget(TenantId tenantId, NoteSearchQuery query);

	void insert(Note note);

	void update(Note note);

}
