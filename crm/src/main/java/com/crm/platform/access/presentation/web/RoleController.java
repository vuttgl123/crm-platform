package com.crm.platform.access.presentation.web;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.net.URI;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import jakarta.validation.Valid;
import com.crm.platform.access.application.command.DeleteRoleCommand;
import com.crm.platform.access.application.dto.RoleDetails;
import com.crm.platform.access.application.usecase.RoleManagementFacade;
import com.crm.platform.access.domain.RoleId;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roles")
public final class RoleController {

	private final RoleManagementFacade roles;
	private final RoleWebMapper mapper;

	public RoleController(RoleManagementFacade roles, RoleWebMapper mapper) {
		this.roles = roles;
		this.mapper = mapper;
	}

	@GetMapping
	public List<RoleSummaryResponse> list() {
		return roles.roles().stream()
				.map(mapper::toSummaryResponse)
				.toList();
	}

	@GetMapping("/{id}")
	public RoleResponse get(@PathVariable UUID id) {
		return mapper.toResponse(roles.get(new RoleId(id)));
	}

	@PostMapping
	public ResponseEntity<RoleResponse> create(
			@Valid @RequestBody CreateRoleRequest request) {
		RoleDetails created = roles.create(mapper.toCreateCommand(request));
		return ResponseEntity.created(
				URI.create("/api/roles/" + created.id()))
				.body(mapper.toResponse(created));
	}

	@PutMapping("/{id}")
	public RoleResponse update(@PathVariable UUID id,
			@Valid @RequestBody UpdateRoleRequest request) {
		return mapper.toResponse(roles.update(
				mapper.toUpdateCommand(new RoleId(id), request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch) {
		long version = Long.parseLong(
				ifMatch.substring(1, ifMatch.length() - 1));
		roles.delete(new DeleteRoleCommand(new RoleId(id), version));
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
