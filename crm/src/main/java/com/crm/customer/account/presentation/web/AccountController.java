package com.crm.customer.account.presentation.web;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.UUID;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import jakarta.validation.Valid;
import com.crm.customer.account.application.command.DeleteAccountCommand;
import com.crm.customer.account.application.dto.AccountDetails;
import com.crm.customer.account.application.usecase.AccountFacade;
import com.crm.customer.account.domain.AccountId;
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
@RequestMapping("/api/accounts")
public final class AccountController {

	private final AccountFacade accounts;
	private final AccountWebMapper mapper;

	public AccountController(AccountFacade accounts, AccountWebMapper mapper) {
		this.accounts = accounts;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<AccountResponse> create(
			@Valid @RequestBody CreateAccountRequest request) {
		AccountDetails created = accounts.create(mapper.toCreateCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toResponse(created));
	}

	@GetMapping("/{id}")
	public AccountResponse get(@PathVariable UUID id) {
		return mapper.toResponse(accounts.get(new AccountId(id)));
	}

	@GetMapping
	public PageResult<AccountSummaryResponse> search(
			@Valid @ModelAttribute AccountSearchRequest request) {
		return mapper.toSummaryPage(
				accounts.search(mapper.toSearchQuery(request)));
	}

	@PutMapping("/{id}")
	public AccountResponse update(@PathVariable UUID id,
			@Valid @RequestBody UpdateAccountRequest request) {
		return mapper.toResponse(accounts.update(
				mapper.toUpdateCommand(new AccountId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		long version = Long.parseLong(
				ifMatch.substring(1, ifMatch.length() - 1));
		accounts.delete(new DeleteAccountCommand(new AccountId(id), version));
		return ResponseEntity.noContent().build();
	}

	@Target(ElementType.PARAMETER)
	@Retention(RetentionPolicy.RUNTIME)
	@Constraint(validatedBy = IfMatchVersionValidator.class)
	public @interface ValidIfMatchVersion {

		String message() default "{validation.invalid}";

		Class<?>[] groups() default {};

		Class<? extends Payload>[] payload() default {};

	}

	public static final class IfMatchVersionValidator
			implements ConstraintValidator<ValidIfMatchVersion, String> {

		@Override
		public boolean isValid(String value,
				ConstraintValidatorContext context) {
			if (value == null || !value.matches("^\"[1-9][0-9]*\"$")) {
				return false;
			}
			try {
				Long.parseLong(value.substring(1, value.length() - 1));
				return true;
			}
			catch (NumberFormatException exception) {
				return false;
			}
		}

	}

}
