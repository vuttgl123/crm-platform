package com.crm.customer.note.application.usecase;

import java.util.List;

import com.crm.customer.note.application.command.CreateNoteCommand;
import com.crm.customer.note.application.command.UpdateNoteCommand;
import com.crm.customer.note.application.dto.NoteDetails;
import com.crm.customer.note.application.dto.NoteSummary;
import com.crm.customer.note.application.query.NoteSearchQuery;
import com.crm.customer.note.domain.NoteId;

public interface NoteFacade {

	NoteDetails create(CreateNoteCommand command);

	NoteDetails get(NoteId id);

	List<NoteSummary> listByTarget(NoteSearchQuery query);

	NoteDetails update(UpdateNoteCommand command);

	void delete(NoteId id, long version);

}
