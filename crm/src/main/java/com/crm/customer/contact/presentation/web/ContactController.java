package com.crm.customer.contact.presentation.web;

import java.util.UUID;

import jakarta.validation.Valid;
import com.crm.customer.contact.application.command.DeleteContactCommand;
import com.crm.customer.contact.application.dto.ContactDetails;
import com.crm.customer.contact.application.usecase.ContactFacade;
import com.crm.customer.contact.domain.ContactId;
import com.crm.foundation.web.http.IfMatchVersion;
import com.crm.foundation.web.validation.ValidIfMatchVersion;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contacts")
public final class ContactController {

	private final ContactFacade contacts;
	private final ContactWebMapper mapper;

	public ContactController(ContactFacade contacts, ContactWebMapper mapper) {
		this.contacts = contacts;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<ContactResponse> create(
			@Valid @RequestBody CreateContactRequest request) {
		ContactDetails created = contacts.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public ContactResponse get(@PathVariable UUID id) {
		return mapper.toResponse(contacts.get(new ContactId(id)));
	}

	@GetMapping
	public PageResult<ContactSummaryResponse> search(
			@Valid @ModelAttribute ContactSearchRequest request) {
		return mapper.toSummaryPage(
				contacts.search(mapper.toSearchQuery(request)));
	}

	@PutMapping("/{id}")
	public ContactResponse update(@PathVariable UUID id,
			@Valid @RequestBody UpdateContactRequest request) {
		return mapper.toResponse(contacts.update(
				mapper.toUpdateCommand(new ContactId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		contacts.delete(new DeleteContactCommand(
				new ContactId(id), IfMatchVersion.parse(ifMatch)));
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/stats")
	public com.crm.customer.contact.application.dto.ContactStatsDto getStats() {
		return contacts.getStats();
	}

	@PostMapping("/{id}/set-primary")
	public ContactResponse setPrimary(
			@PathVariable UUID id,
			@Valid @RequestBody SetPrimaryContactRequest request) {
		ContactDetails updated = contacts.setPrimary(
				new com.crm.customer.contact.application.command.SetPrimaryContactCommand(
						new ContactId(id),
						request.isPrimary(),
						request.version()
				));
		return mapper.toResponse(updated);
	}

	@PostMapping("/{id}/transfer-account")
	public ContactResponse transferAccount(
			@PathVariable UUID id,
			@Valid @RequestBody TransferContactAccountRequest request) {
		ContactDetails updated = contacts.transferAccount(
				new com.crm.customer.contact.application.command.TransferContactAccountCommand(
						new ContactId(id),
						request.newAccountId(),
						request.jobTitle(),
						request.version()
				));
		return mapper.toResponse(updated);
	}

	@PostMapping("/bulk/lifecycle")
	public ResponseEntity<java.util.Map<String, Object>> bulkUpdateLifecycle(
			@Valid @RequestBody BulkUpdateContactLifecycleRequest request) {
		int updatedCount = contacts.bulkUpdateLifecycle(
				new com.crm.customer.contact.application.command.BulkUpdateContactLifecycleCommand(
						request.contactIds(),
						request.lifecycleStage()
				));
		return ResponseEntity.ok(java.util.Map.of("updatedCount", updatedCount));
	}

}
