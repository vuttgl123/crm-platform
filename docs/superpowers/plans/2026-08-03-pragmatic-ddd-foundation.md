# Pragmatic DDD Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Do not dispatch subagents unless the user explicitly authorizes multi-agent work. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the approved Pragmatic DDD shared kernel and technical foundation without implementing CRM business modules.

**Architecture:** Keep one Spring Boot application and introduce two deliberately separate foundations: `sharedkernel` for stable cross-domain types and `foundation` for Spring, security, tenancy, persistence support, web errors, logging, time, and identifiers. Business contexts will consume these contracts later but will continue to own their domain models, repositories, and persistence mappings.

**Tech Stack:** Java 21, Spring Boot 4.0.7, Spring MVC, Spring Security, Jakarta Validation, Spring Data JPA, SLF4J 2, Logback, Maven.

## Global Constraints

- Follow `docs/superpowers/specs/2026-08-03-pragmatic-ddd-project-structure-design.md` exactly.
- Keep one Maven module and one Spring Boot deployment unit.
- Add no dependency.
- Do not create `base`, `common`, `BaseController`, `BaseService`, `BaseRepository`, or a generic CRUD framework.
- Do not create empty bounded-context package trees.
- Domain code must not depend on Spring MVC, Spring Security, JPA, or infrastructure implementations.
- `sharedkernel` and `foundation` must remain separate.
- Preserve the current security rule, request-tracing behavior, and Logback configuration.
- Use `apply_patch` for every source-file creation, move, update, or deletion.
- Prefer RTK for read-only inspection and redact datasource credentials from all output.
- Do not add or run tests.
- Do not run Maven build or compile commands.
- Do not start the application or call the database/API.
- Do not stage, commit, push, merge, or create a pull request.
- Replace the usual test/commit steps from the writing-plans workflow with explicit read-only static inspections.

---

## File Structure

### Shared kernel files

- Create `crm/src/main/java/com/crm/sharedkernel/domain/TenantId.java`: validated UUID tenant identifier.
- Create `crm/src/main/java/com/crm/sharedkernel/domain/ActorId.java`: validated UUID actor identifier.
- Create `crm/src/main/java/com/crm/sharedkernel/domain/DomainEvent.java`: minimum domain-event contract.
- Create `crm/src/main/java/com/crm/sharedkernel/domain/AggregateRoot.java`: domain-event collection owned by aggregate roots.
- Create `crm/src/main/java/com/crm/sharedkernel/domain/exception/DomainException.java`: base coded domain failure.
- Create `crm/src/main/java/com/crm/sharedkernel/domain/exception/BusinessRuleViolation.java`: HTTP-neutral rule failure.
- Create `crm/src/main/java/com/crm/sharedkernel/domain/exception/InvalidStateTransition.java`: HTTP-neutral state-transition failure.
- Create `crm/src/main/java/com/crm/sharedkernel/domain/exception/ResourceConflict.java`: HTTP-neutral conflict failure.
- Create `crm/src/main/java/com/crm/sharedkernel/domain/exception/DomainResourceNotFound.java`: HTTP-neutral missing-resource failure.
- Create `crm/src/main/java/com/crm/sharedkernel/application/PageQuery.java`: validated zero-based paging input.
- Create `crm/src/main/java/com/crm/sharedkernel/application/PageResult.java`: immutable paging output.

### Foundation files

- Create `crm/src/main/java/com/crm/foundation/time/TimeProvider.java`: application clock contract.
- Create `crm/src/main/java/com/crm/foundation/time/SystemTimeProvider.java`: UTC system-clock implementation.
- Create `crm/src/main/java/com/crm/foundation/identifier/IdentifierGenerator.java`: UUID generation contract.
- Create `crm/src/main/java/com/crm/foundation/identifier/UuidIdentifierGenerator.java`: random UUID implementation.
- Create `crm/src/main/java/com/crm/foundation/event/DomainEventPublisher.java`: local domain-event publication contract.
- Create `crm/src/main/java/com/crm/foundation/tenancy/CurrentTenant.java`: current-tenant contract.
- Create `crm/src/main/java/com/crm/foundation/tenancy/TenantContext.java`: safely scoped tenant ThreadLocal.
- Create `crm/src/main/java/com/crm/foundation/tenancy/ThreadLocalCurrentTenant.java`: `CurrentTenant` adapter.
- Create `crm/src/main/java/com/crm/foundation/tenancy/MissingTenantContextException.java`: missing-context technical failure.
- Create `crm/src/main/java/com/crm/foundation/security/CurrentActor.java`: current-actor contract.
- Create `crm/src/main/java/com/crm/foundation/security/ActorContext.java`: safely scoped actor ThreadLocal.
- Create `crm/src/main/java/com/crm/foundation/security/ThreadLocalCurrentActor.java`: `CurrentActor` adapter.
- Create `crm/src/main/java/com/crm/foundation/security/MissingActorContextException.java`: missing-context technical failure.
- Create `crm/src/main/java/com/crm/foundation/security/PermissionChecker.java`: authorization contract for application use cases.
- Create `crm/src/main/java/com/crm/foundation/persistence/auditing/AuditStamp.java`: immutable time/actor capture.
- Create `crm/src/main/java/com/crm/foundation/persistence/auditing/AuditContext.java`: persistence-audit contract.
- Create `crm/src/main/java/com/crm/foundation/persistence/auditing/CurrentAuditContext.java`: default audit-context implementation.
- Create `crm/src/main/java/com/crm/foundation/web/error/FieldViolation.java`: safe validation-field detail.
- Create `crm/src/main/java/com/crm/foundation/web/error/ApiProblemFactory.java`: trace-aware `ProblemDetail` creation.
- Create `crm/src/main/java/com/crm/foundation/web/error/GlobalExceptionHandler.java`: exception-to-HTTP mapping.

### Existing technical-code relocation

- Create `crm/src/main/java/com/crm/foundation/config/SecurityConfig.java` and delete `crm/src/main/java/com/crm/config/SecurityConfig.java`.
- Create `crm/src/main/java/com/crm/foundation/logging/RequestTracingFilter.java` and delete `crm/src/main/java/com/crm/logging/RequestTracingFilter.java`.

No `pom.xml`, `application.yaml`, or `logback-spring.xml` change is planned.

---

### Task 1: Create Shared Domain Identifiers and Event Contracts

**Files:**

- Create: `crm/src/main/java/com/crm/sharedkernel/domain/TenantId.java`
- Create: `crm/src/main/java/com/crm/sharedkernel/domain/ActorId.java`
- Create: `crm/src/main/java/com/crm/sharedkernel/domain/DomainEvent.java`
- Create: `crm/src/main/java/com/crm/sharedkernel/domain/AggregateRoot.java`
- Create: `crm/src/main/java/com/crm/foundation/event/DomainEventPublisher.java`

**Interfaces:**

- Produces: `TenantId(UUID value)`, `TenantId.from(String)`, `ActorId(UUID value)`, `ActorId.from(String)`.
- Produces: `DomainEvent.eventId()` and `DomainEvent.occurredAt()`.
- Produces: `AggregateRoot.registerEvent(T)` and `AggregateRoot.releaseDomainEvents()`.
- Produces: `DomainEventPublisher.publishAll(Collection<? extends DomainEvent>)` without selecting a transport or transaction policy prematurely.
- Consumes: Java standard-library `UUID`, `Instant`, collections, and null validation only.

- [ ] **Step 1: Create `TenantId`**

```java
package com.crm.sharedkernel.domain;

import java.util.Objects;
import java.util.UUID;

public record TenantId(UUID value) {

	public TenantId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static TenantId from(String value) {
		return new TenantId(UUID.fromString(Objects.requireNonNull(value,
				"value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
```

- [ ] **Step 2: Create `ActorId`**

```java
package com.crm.sharedkernel.domain;

import java.util.Objects;
import java.util.UUID;

public record ActorId(UUID value) {

	public ActorId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static ActorId from(String value) {
		return new ActorId(UUID.fromString(Objects.requireNonNull(value,
				"value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
```

- [ ] **Step 3: Create `DomainEvent`**

```java
package com.crm.sharedkernel.domain;

import java.time.Instant;
import java.util.UUID;

public interface DomainEvent {

	UUID eventId();

	Instant occurredAt();

}
```

- [ ] **Step 4: Create `AggregateRoot`**

```java
package com.crm.sharedkernel.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public abstract class AggregateRoot {

	private final List<DomainEvent> domainEvents = new ArrayList<>();

	protected final <T extends DomainEvent> T registerEvent(T domainEvent) {
		domainEvents.add(Objects.requireNonNull(domainEvent,
				"domainEvent must not be null"));
		return domainEvent;
	}

	public final List<DomainEvent> releaseDomainEvents() {
		List<DomainEvent> releasedEvents = List.copyOf(domainEvents);
		domainEvents.clear();
		return releasedEvents;
	}

}
```

- [ ] **Step 5: Create the publication contract**

```java
package com.crm.foundation.event;

import java.util.Collection;

import com.crm.sharedkernel.domain.DomainEvent;

public interface DomainEventPublisher {

	void publishAll(Collection<? extends DomainEvent> domainEvents);

}
```

- [ ] **Step 6: Statically inspect Task 1**

Run:

```bash
rtk read crm/src/main/java/com/crm/sharedkernel/domain/TenantId.java
rtk read crm/src/main/java/com/crm/sharedkernel/domain/ActorId.java
rtk read crm/src/main/java/com/crm/sharedkernel/domain/DomainEvent.java
rtk read crm/src/main/java/com/crm/sharedkernel/domain/AggregateRoot.java
rtk read crm/src/main/java/com/crm/foundation/event/DomainEventPublisher.java
rtk grep -n "org.springframework|jakarta.persistence|jakarta.servlet" crm/src/main/java/com/crm/sharedkernel/domain
```

Expected static evidence:

- Both identifiers wrap non-null UUID values compatible with schema `CHAR(36)` identifiers.
- Aggregate event release returns an immutable snapshot and clears only its own collection.
- The final grep returns zero matches.

---

### Task 2: Create the Domain Exception Hierarchy

**Files:**

- Create: `crm/src/main/java/com/crm/sharedkernel/domain/exception/DomainException.java`
- Create: `crm/src/main/java/com/crm/sharedkernel/domain/exception/BusinessRuleViolation.java`
- Create: `crm/src/main/java/com/crm/sharedkernel/domain/exception/InvalidStateTransition.java`
- Create: `crm/src/main/java/com/crm/sharedkernel/domain/exception/ResourceConflict.java`
- Create: `crm/src/main/java/com/crm/sharedkernel/domain/exception/DomainResourceNotFound.java`

**Interfaces:**

- Produces: `DomainException.code()` with non-blank code and safe message.
- Produces: four HTTP-neutral concrete failure types used by Task 6.
- Consumes: no Spring or Jakarta type.

- [ ] **Step 1: Create `DomainException`**

```java
package com.crm.sharedkernel.domain.exception;

import java.util.Objects;

public abstract class DomainException extends RuntimeException {

	private final String code;

	protected DomainException(String code, String message) {
		super(requireText(message, "message"));
		this.code = requireText(code, "code");
	}

	public final String code() {
		return code;
	}

	private static String requireText(String value, String name) {
		String requiredValue = Objects.requireNonNull(value,
				name + " must not be null");
		if (requiredValue.isBlank()) {
			throw new IllegalArgumentException(name + " must not be blank");
		}
		return requiredValue;
	}

}
```

- [ ] **Step 2: Create `BusinessRuleViolation`**

```java
package com.crm.sharedkernel.domain.exception;

public final class BusinessRuleViolation extends DomainException {

	public BusinessRuleViolation(String code, String message) {
		super(code, message);
	}

}
```

- [ ] **Step 3: Create `InvalidStateTransition`**

```java
package com.crm.sharedkernel.domain.exception;

public final class InvalidStateTransition extends DomainException {

	public InvalidStateTransition(String code, String message) {
		super(code, message);
	}

}
```

- [ ] **Step 4: Create `ResourceConflict`**

```java
package com.crm.sharedkernel.domain.exception;

public final class ResourceConflict extends DomainException {

	public ResourceConflict(String code, String message) {
		super(code, message);
	}

}
```

- [ ] **Step 5: Create `DomainResourceNotFound`**

```java
package com.crm.sharedkernel.domain.exception;

public final class DomainResourceNotFound extends DomainException {

	public DomainResourceNotFound(String code, String message) {
		super(code, message);
	}

}
```

- [ ] **Step 6: Statically inspect Task 2**

Run:

```bash
rtk read crm/src/main/java/com/crm/sharedkernel/domain/exception/DomainException.java
rtk grep -n "HttpStatus|ProblemDetail|ResponseEntity|org.springframework|jakarta" crm/src/main/java/com/crm/sharedkernel/domain/exception
```

Expected static evidence:

- Every concrete exception requires an explicit stable code and safe message.
- No exception contains HTTP, Spring, persistence, or servlet concerns.
- The final grep returns zero matches.

---

### Task 3: Create Paging, Time, and Identifier Primitives

**Files:**

- Create: `crm/src/main/java/com/crm/sharedkernel/application/PageQuery.java`
- Create: `crm/src/main/java/com/crm/sharedkernel/application/PageResult.java`
- Create: `crm/src/main/java/com/crm/foundation/time/TimeProvider.java`
- Create: `crm/src/main/java/com/crm/foundation/time/SystemTimeProvider.java`
- Create: `crm/src/main/java/com/crm/foundation/identifier/IdentifierGenerator.java`
- Create: `crm/src/main/java/com/crm/foundation/identifier/UuidIdentifierGenerator.java`

**Interfaces:**

- Produces: zero-based `PageQuery(page, size)` with `DEFAULT_SIZE = 20` and `MAX_SIZE = 100`.
- Produces: immutable `PageResult.of(items, query, totalElements)`.
- Produces: `TimeProvider.now()` and `IdentifierGenerator.nextId()`.
- Consumes: Spring `@Component` only in concrete technical adapters.

- [ ] **Step 1: Create `PageQuery`**

```java
package com.crm.sharedkernel.application;

public record PageQuery(int page, int size) {

	public static final int DEFAULT_SIZE = 20;
	public static final int MAX_SIZE = 100;

	public PageQuery {
		if (page < 0) {
			throw new IllegalArgumentException("page must be zero or greater");
		}
		if (size < 1 || size > MAX_SIZE) {
			throw new IllegalArgumentException(
					"size must be between 1 and " + MAX_SIZE);
		}
	}

	public static PageQuery firstPage() {
		return new PageQuery(0, DEFAULT_SIZE);
	}

	public long offset() {
		return Math.multiplyExact((long) page, size);
	}

}
```

- [ ] **Step 2: Create `PageResult`**

```java
package com.crm.sharedkernel.application;

import java.util.List;
import java.util.Objects;

public record PageResult<T>(
		List<T> items,
		int page,
		int size,
		long totalElements,
		int totalPages) {

	public PageResult {
		items = List.copyOf(Objects.requireNonNull(items,
				"items must not be null"));
		if (page < 0 || size < 1 || totalElements < 0 || totalPages < 0) {
			throw new IllegalArgumentException("page metadata must not be negative");
		}
	}

	public static <T> PageResult<T> of(List<T> items, PageQuery query,
			long totalElements) {
		Objects.requireNonNull(query, "query must not be null");
		if (totalElements < 0) {
			throw new IllegalArgumentException("totalElements must not be negative");
		}
		long pageCount = totalElements == 0
				? 0
				: ((totalElements - 1) / query.size()) + 1;
		return new PageResult<>(items, query.page(), query.size(), totalElements,
				Math.toIntExact(pageCount));
	}

	public boolean first() {
		return page == 0;
	}

	public boolean last() {
		return totalPages == 0 || page >= totalPages - 1;
	}

}
```

- [ ] **Step 3: Create the time contract and adapter**

`TimeProvider.java`:

```java
package com.crm.foundation.time;

import java.time.Instant;

public interface TimeProvider {

	Instant now();

}
```

`SystemTimeProvider.java`:

```java
package com.crm.foundation.time;

import java.time.Clock;
import java.time.Instant;

import org.springframework.stereotype.Component;

@Component
public final class SystemTimeProvider implements TimeProvider {

	private final Clock clock;

	public SystemTimeProvider() {
		this(Clock.systemUTC());
	}

	SystemTimeProvider(Clock clock) {
		this.clock = clock;
	}

	@Override
	public Instant now() {
		return clock.instant();
	}

}
```

- [ ] **Step 4: Create the identifier contract and adapter**

`IdentifierGenerator.java`:

```java
package com.crm.foundation.identifier;

import java.util.UUID;

public interface IdentifierGenerator {

	UUID nextId();

}
```

`UuidIdentifierGenerator.java`:

```java
package com.crm.foundation.identifier;

import java.util.UUID;

import org.springframework.stereotype.Component;

@Component
public final class UuidIdentifierGenerator implements IdentifierGenerator {

	@Override
	public UUID nextId() {
		return UUID.randomUUID();
	}

}
```

- [ ] **Step 5: Statically inspect Task 3**

Run:

```bash
rtk read crm/src/main/java/com/crm/sharedkernel/application/PageQuery.java
rtk read crm/src/main/java/com/crm/sharedkernel/application/PageResult.java
rtk grep -n "org.springframework|jakarta" crm/src/main/java/com/crm/sharedkernel/application
rtk grep -n "Clock.systemUTC|UUID.randomUUID" crm/src/main/java/com/crm/foundation
```

Expected static evidence:

- Paging collections are immutable and page size is capped at 100.
- Shared application types contain no framework import.
- Static clock/UUID calls exist only in their technical adapters.

---

### Task 4: Create Tenant and Actor Context Contracts

**Files:**

- Create: `crm/src/main/java/com/crm/foundation/tenancy/CurrentTenant.java`
- Create: `crm/src/main/java/com/crm/foundation/tenancy/TenantContext.java`
- Create: `crm/src/main/java/com/crm/foundation/tenancy/ThreadLocalCurrentTenant.java`
- Create: `crm/src/main/java/com/crm/foundation/tenancy/MissingTenantContextException.java`
- Create: `crm/src/main/java/com/crm/foundation/security/CurrentActor.java`
- Create: `crm/src/main/java/com/crm/foundation/security/ActorContext.java`
- Create: `crm/src/main/java/com/crm/foundation/security/ThreadLocalCurrentActor.java`
- Create: `crm/src/main/java/com/crm/foundation/security/MissingActorContextException.java`
- Create: `crm/src/main/java/com/crm/foundation/security/PermissionChecker.java`

**Interfaces:**

- Produces: `CurrentTenant.tenantId()` and `CurrentTenant.requireTenantId()`.
- Produces: `TenantContext.open(TenantId)` returning an idempotent `Scope`.
- Produces: `CurrentActor.actorId()` and `CurrentActor.requireActorId()`.
- Produces: `ActorContext.open(ActorId)` returning an idempotent `Scope`.
- Produces: `PermissionChecker.hasPermission(String)` and `requirePermission(String)`.
- Consumes: `TenantId` and `ActorId` from Task 1.

- [ ] **Step 1: Create tenant contract and missing-context exception**

`CurrentTenant.java`:

```java
package com.crm.foundation.tenancy;

import java.util.Optional;

import com.crm.sharedkernel.domain.TenantId;

public interface CurrentTenant {

	Optional<TenantId> tenantId();

	default TenantId requireTenantId() {
		return tenantId().orElseThrow(MissingTenantContextException::new);
	}

}
```

`MissingTenantContextException.java`:

```java
package com.crm.foundation.tenancy;

public final class MissingTenantContextException extends IllegalStateException {

	public MissingTenantContextException() {
		super("Tenant context is required for this operation");
	}

}
```

- [ ] **Step 2: Create safely scoped `TenantContext`**

```java
package com.crm.foundation.tenancy;

import java.util.Objects;
import java.util.Optional;

import com.crm.sharedkernel.domain.TenantId;

public final class TenantContext {

	private static final ThreadLocal<TenantId> CURRENT_TENANT = new ThreadLocal<>();

	private TenantContext() {
	}

	public static Optional<TenantId> currentTenantId() {
		return Optional.ofNullable(CURRENT_TENANT.get());
	}

	public static Scope open(TenantId tenantId) {
		TenantId previousTenantId = CURRENT_TENANT.get();
		CURRENT_TENANT.set(Objects.requireNonNull(tenantId,
				"tenantId must not be null"));
		return new Scope(previousTenantId);
	}

	public static final class Scope implements AutoCloseable {

		private final TenantId previousTenantId;
		private boolean closed;

		private Scope(TenantId previousTenantId) {
			this.previousTenantId = previousTenantId;
		}

		@Override
		public void close() {
			if (closed) {
				return;
			}
			closed = true;
			if (previousTenantId == null) {
				CURRENT_TENANT.remove();
			}
			else {
				CURRENT_TENANT.set(previousTenantId);
			}
		}
	}

}
```

- [ ] **Step 3: Create `ThreadLocalCurrentTenant`**

```java
package com.crm.foundation.tenancy;

import java.util.Optional;

import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Component;

@Component
public final class ThreadLocalCurrentTenant implements CurrentTenant {

	@Override
	public Optional<TenantId> tenantId() {
		return TenantContext.currentTenantId();
	}

}
```

- [ ] **Step 4: Create actor contract and missing-context exception**

`CurrentActor.java`:

```java
package com.crm.foundation.security;

import java.util.Optional;

import com.crm.sharedkernel.domain.ActorId;

public interface CurrentActor {

	Optional<ActorId> actorId();

	default ActorId requireActorId() {
		return actorId().orElseThrow(MissingActorContextException::new);
	}

}
```

`MissingActorContextException.java`:

```java
package com.crm.foundation.security;

public final class MissingActorContextException extends IllegalStateException {

	public MissingActorContextException() {
		super("Actor context is required for this operation");
	}

}
```

- [ ] **Step 5: Create safely scoped `ActorContext`**

```java
package com.crm.foundation.security;

import java.util.Objects;
import java.util.Optional;

import com.crm.sharedkernel.domain.ActorId;

public final class ActorContext {

	private static final ThreadLocal<ActorId> CURRENT_ACTOR = new ThreadLocal<>();

	private ActorContext() {
	}

	public static Optional<ActorId> currentActorId() {
		return Optional.ofNullable(CURRENT_ACTOR.get());
	}

	public static Scope open(ActorId actorId) {
		ActorId previousActorId = CURRENT_ACTOR.get();
		CURRENT_ACTOR.set(Objects.requireNonNull(actorId,
				"actorId must not be null"));
		return new Scope(previousActorId);
	}

	public static final class Scope implements AutoCloseable {

		private final ActorId previousActorId;
		private boolean closed;

		private Scope(ActorId previousActorId) {
			this.previousActorId = previousActorId;
		}

		@Override
		public void close() {
			if (closed) {
				return;
			}
			closed = true;
			if (previousActorId == null) {
				CURRENT_ACTOR.remove();
			}
			else {
				CURRENT_ACTOR.set(previousActorId);
			}
		}
	}

}
```

- [ ] **Step 6: Create `ThreadLocalCurrentActor` and `PermissionChecker`**

`ThreadLocalCurrentActor.java`:

```java
package com.crm.foundation.security;

import java.util.Optional;

import com.crm.sharedkernel.domain.ActorId;
import org.springframework.stereotype.Component;

@Component
public final class ThreadLocalCurrentActor implements CurrentActor {

	@Override
	public Optional<ActorId> actorId() {
		return ActorContext.currentActorId();
	}

}
```

`PermissionChecker.java`:

```java
package com.crm.foundation.security;

public interface PermissionChecker {

	boolean hasPermission(String permission);

	void requirePermission(String permission);

}
```

- [ ] **Step 7: Statically inspect Task 4**

Run:

```bash
rtk grep -n "ThreadLocal|remove\(\)|previousTenantId|previousActorId" crm/src/main/java/com/crm/foundation/tenancy crm/src/main/java/com/crm/foundation/security
rtk grep -n "HttpServletRequest|X-Tenant|request.getHeader" crm/src/main/java/com/crm/foundation/tenancy crm/src/main/java/com/crm/foundation/security
```

Expected static evidence:

- Both contexts restore a previous nested value and remove the ThreadLocal when no prior value exists.
- No client-controlled tenant header convention is introduced.
- Context binding remains a later platform/authentication responsibility.

---

### Task 5: Create Persistence Audit Context

**Files:**

- Create: `crm/src/main/java/com/crm/foundation/persistence/auditing/AuditStamp.java`
- Create: `crm/src/main/java/com/crm/foundation/persistence/auditing/AuditContext.java`
- Create: `crm/src/main/java/com/crm/foundation/persistence/auditing/CurrentAuditContext.java`

**Interfaces:**

- Produces: `AuditStamp(Instant occurredAt, Optional<ActorId> actorId)`.
- Produces: `AuditContext.capture()`.
- Consumes: `TimeProvider` from Task 3 and `CurrentActor` from Task 4.
- Does not produce a generic JPA base entity.

- [ ] **Step 1: Create `AuditStamp`**

```java
package com.crm.foundation.persistence.auditing;

import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

import com.crm.sharedkernel.domain.ActorId;

public record AuditStamp(Instant occurredAt, Optional<ActorId> actorId) {

	public AuditStamp {
		Objects.requireNonNull(occurredAt, "occurredAt must not be null");
		actorId = Objects.requireNonNull(actorId, "actorId must not be null");
	}

}
```

- [ ] **Step 2: Create `AuditContext`**

```java
package com.crm.foundation.persistence.auditing;

public interface AuditContext {

	AuditStamp capture();

}
```

- [ ] **Step 3: Create `CurrentAuditContext`**

```java
package com.crm.foundation.persistence.auditing;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.time.TimeProvider;
import org.springframework.stereotype.Component;

@Component
public final class CurrentAuditContext implements AuditContext {

	private final TimeProvider timeProvider;
	private final CurrentActor currentActor;

	public CurrentAuditContext(TimeProvider timeProvider, CurrentActor currentActor) {
		this.timeProvider = timeProvider;
		this.currentActor = currentActor;
	}

	@Override
	public AuditStamp capture() {
		return new AuditStamp(timeProvider.now(), currentActor.actorId());
	}

}
```

- [ ] **Step 4: Statically inspect Task 5**

Run:

```bash
rtk read crm/src/main/java/com/crm/foundation/persistence/auditing/AuditStamp.java
rtk read crm/src/main/java/com/crm/foundation/persistence/auditing/CurrentAuditContext.java
rtk grep -n "@MappedSuperclass|BaseEntity|JpaRepository" crm/src/main/java/com/crm/foundation/persistence
```

Expected static evidence:

- Audit capture uses injected time and actor contracts.
- System operations can be represented by an empty actor ID.
- No generic persistence inheritance hierarchy is introduced.

---

### Task 6: Create the Trace-Aware HTTP Error Contract

**Files:**

- Create: `crm/src/main/java/com/crm/foundation/web/error/FieldViolation.java`
- Create: `crm/src/main/java/com/crm/foundation/web/error/ApiProblemFactory.java`
- Create: `crm/src/main/java/com/crm/foundation/web/error/GlobalExceptionHandler.java`

**Interfaces:**

- Produces: `ApiProblemFactory.create(HttpStatus, String, String, HttpServletRequest)`.
- Produces: `ApiProblemFactory.createValidationProblem(List<FieldViolation>, HttpServletRequest)`.
- Produces: safe `ProblemDetail` responses with `code`, `path`, and `traceId` properties.
- Consumes: exception types from Task 2 and MDC `traceId` from the existing request filter.

- [ ] **Step 1: Create `FieldViolation`**

```java
package com.crm.foundation.web.error;

import java.util.Objects;

public record FieldViolation(String field, String message) {

	public FieldViolation {
		field = Objects.requireNonNull(field, "field must not be null");
		message = Objects.requireNonNull(message, "message must not be null");
	}

}
```

- [ ] **Step 2: Create `ApiProblemFactory`**

```java
package com.crm.foundation.web.error;

import java.net.URI;
import java.util.List;
import java.util.Objects;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

@Component
public final class ApiProblemFactory {

	private static final String TRACE_ID_MDC_KEY = "traceId";
	private static final String SYSTEM_TRACE_ID = "SYSTEM";

	public ProblemDetail create(HttpStatus status, String code, String detail,
			HttpServletRequest request) {
		Objects.requireNonNull(status, "status must not be null");
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(status,
				Objects.requireNonNull(detail, "detail must not be null"));
		problem.setTitle(status.getReasonPhrase());
		problem.setInstance(URI.create(request.getRequestURI()));
		problem.setProperty("code", Objects.requireNonNull(code,
				"code must not be null"));
		problem.setProperty("path", request.getRequestURI());
		problem.setProperty("traceId", currentTraceId());
		return problem;
	}

	public ProblemDetail createValidationProblem(List<FieldViolation> violations,
			HttpServletRequest request) {
		ProblemDetail problem = create(HttpStatus.BAD_REQUEST,
				"REQUEST_VALIDATION_FAILED", "Request validation failed", request);
		problem.setProperty("errors", List.copyOf(violations));
		return problem;
	}

	private static String currentTraceId() {
		String traceId = MDC.get(TRACE_ID_MDC_KEY);
		return traceId == null || traceId.isBlank() ? SYSTEM_TRACE_ID : traceId;
	}

}
```

- [ ] **Step 3: Create `GlobalExceptionHandler`**

```java
package com.crm.foundation.web.error;

import java.util.Comparator;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.crm.sharedkernel.domain.exception.DomainException;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.InvalidStateTransition;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public final class GlobalExceptionHandler {

	private static final Logger LOGGER =
			LoggerFactory.getLogger(GlobalExceptionHandler.class);

	private final ApiProblemFactory problemFactory;

	public GlobalExceptionHandler(ApiProblemFactory problemFactory) {
		this.problemFactory = problemFactory;
	}

	@ExceptionHandler(DomainException.class)
	public ResponseEntity<ProblemDetail> handleDomainException(
			DomainException exception, HttpServletRequest request) {
		HttpStatus status = statusFor(exception);
		return ResponseEntity.status(status)
				.body(problemFactory.create(status, exception.code(),
						exception.getMessage(), request));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ProblemDetail> handleMethodArgumentNotValid(
			MethodArgumentNotValidException exception,
			HttpServletRequest request) {
		List<FieldViolation> violations = exception.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(error -> new FieldViolation(error.getField(),
						error.getDefaultMessage() == null
								? "Invalid value"
								: error.getDefaultMessage()))
				.sorted(Comparator.comparing(FieldViolation::field))
				.toList();
		return ResponseEntity.badRequest()
				.body(problemFactory.createValidationProblem(violations, request));
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ProblemDetail> handleConstraintViolation(
			ConstraintViolationException exception,
			HttpServletRequest request) {
		List<FieldViolation> violations = exception.getConstraintViolations()
				.stream()
				.map(violation -> new FieldViolation(
						violation.getPropertyPath().toString(),
						violation.getMessage()))
				.sorted(Comparator.comparing(FieldViolation::field))
				.toList();
		return ResponseEntity.badRequest()
				.body(problemFactory.createValidationProblem(violations, request));
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ProblemDetail> handleAccessDenied(
			AccessDeniedException exception, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(problemFactory.create(HttpStatus.FORBIDDEN,
						"ACCESS_DENIED", "Access is denied", request));
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ProblemDetail> handleAuthentication(
			AuthenticationException exception, HttpServletRequest request) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(problemFactory.create(HttpStatus.UNAUTHORIZED,
						"AUTHENTICATION_REQUIRED", "Authentication is required",
						request));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ProblemDetail> handleUnexpectedException(
			Exception exception, HttpServletRequest request) {
		LOGGER.error("Unhandled request failure", exception);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(problemFactory.create(HttpStatus.INTERNAL_SERVER_ERROR,
						"INTERNAL_ERROR", "An unexpected error occurred", request));
	}

	private static HttpStatus statusFor(DomainException exception) {
		if (exception instanceof DomainResourceNotFound) {
			return HttpStatus.NOT_FOUND;
		}
		if (exception instanceof BusinessRuleViolation) {
			return HttpStatus.UNPROCESSABLE_ENTITY;
		}
		if (exception instanceof InvalidStateTransition
				|| exception instanceof ResourceConflict) {
			return HttpStatus.CONFLICT;
		}
		return HttpStatus.INTERNAL_SERVER_ERROR;
	}

}
```

- [ ] **Step 4: Statically inspect Task 6**

Run:

```bash
rtk grep -n "REQUEST_VALIDATION_FAILED|ACCESS_DENIED|AUTHENTICATION_REQUIRED|INTERNAL_ERROR|traceId|ProblemDetail" crm/src/main/java/com/crm/foundation/web/error
rtk grep -n "getStackTrace|SQLException|password|token|Authorization" crm/src/main/java/com/crm/foundation/web/error
```

Expected static evidence:

- Controlled errors expose stable codes, safe details, path, and trace ID.
- Unexpected exceptions are logged once by the MVC boundary and return a generic detail.
- The second grep returns zero matches.

---

### Task 7: Relocate Existing Security and Request-Tracing Code

**Files:**

- Create: `crm/src/main/java/com/crm/foundation/config/SecurityConfig.java`
- Create: `crm/src/main/java/com/crm/foundation/logging/RequestTracingFilter.java`
- Delete: `crm/src/main/java/com/crm/config/SecurityConfig.java`
- Delete: `crm/src/main/java/com/crm/logging/RequestTracingFilter.java`

**Interfaces:**

- Preserves: HTTP Basic authentication for all other current endpoints.
- Preserves: validated `X-Request-ID`, MDC `traceId`, response header, and metadata-only completion logging.
- Produces: new packages under `foundation` with no behavioral change.

- [ ] **Step 1: Create the relocated `RequestTracingFilter`**

```java
package com.crm.foundation.logging;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public final class RequestTracingFilter extends OncePerRequestFilter {

	public static final String REQUEST_ID_HEADER = "X-Request-ID";

	private static final Logger LOGGER = LoggerFactory.getLogger(RequestTracingFilter.class);
	private static final String TRACE_ID_MDC_KEY = "traceId";
	private static final String ANONYMOUS_USER = "anonymous";
	private static final Pattern VALID_REQUEST_ID = Pattern.compile("[A-Za-z0-9._-]{1,64}");

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
			FilterChain filterChain) throws ServletException, IOException {
		String traceId = resolveTraceId(request.getHeader(REQUEST_ID_HEADER));
		long startedAt = System.nanoTime();
		boolean exceptionLogged = false;

		response.setHeader(REQUEST_ID_HEADER, traceId);

		try (MDC.MDCCloseable ignored = MDC.putCloseable(TRACE_ID_MDC_KEY, traceId)) {
			LOGGER.debug("HTTP request started method={} uri={}", request.getMethod(),
					sanitizeForLog(request.getRequestURI(), 1024));

			try {
				filterChain.doFilter(request, response);
			}
			catch (IOException | ServletException | RuntimeException exception) {
				exceptionLogged = true;
				long durationMillis = elapsedMillis(startedAt);
				LOGGER.error("HTTP request failed method={} uri={} durationMs={} ip={} user={}",
						request.getMethod(), sanitizeForLog(request.getRequestURI(), 1024),
						durationMillis, sanitizeForLog(request.getRemoteAddr(), 128),
						resolvePrincipal(), exception);
				throw exception;
			}
			finally {
				int status = exceptionLogged
						? HttpServletResponse.SC_INTERNAL_SERVER_ERROR
						: response.getStatus();
				logCompletion(request, status, elapsedMillis(startedAt));
			}
		}
	}

	private static String resolveTraceId(String candidate) {
		if (candidate != null && VALID_REQUEST_ID.matcher(candidate).matches()) {
			return candidate;
		}
		return UUID.randomUUID().toString();
	}

	private static long elapsedMillis(long startedAt) {
		return TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt);
	}

	private static String resolvePrincipal() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			return ANONYMOUS_USER;
		}
		return sanitizeForLog(authentication.getName(), 128);
	}

	private static String sanitizeForLog(String value, int maxLength) {
		if (value == null || value.isBlank()) {
			return "-";
		}
		String singleLineValue = value.replace('\r', '_').replace('\n', '_');
		return singleLineValue.length() <= maxLength
				? singleLineValue
				: singleLineValue.substring(0, maxLength);
	}

	private static void logCompletion(HttpServletRequest request, int status,
			long durationMillis) {
		String method = request.getMethod();
		String uri = sanitizeForLog(request.getRequestURI(), 1024);
		String remoteAddress = sanitizeForLog(request.getRemoteAddr(), 128);
		String principal = resolvePrincipal();
		String message = "HTTP {} {} -> {} ({} ms) ip={} user={}";

		if (status >= HttpServletResponse.SC_INTERNAL_SERVER_ERROR) {
			LOGGER.error(message, method, uri, status, durationMillis, remoteAddress, principal);
		}
		else if (status >= HttpServletResponse.SC_BAD_REQUEST) {
			LOGGER.warn(message, method, uri, status, durationMillis, remoteAddress, principal);
		}
		else {
			LOGGER.info(message, method, uri, status, durationMillis, remoteAddress, principal);
		}
	}

}
```

- [ ] **Step 2: Create the relocated `SecurityConfig`**

```java
package com.crm.foundation.config;

import com.crm.foundation.logging.RequestTracingFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
				.authorizeHttpRequests(authorize -> authorize
						.anyRequest().authenticated())
				.httpBasic(Customizer.withDefaults())
				.addFilterAfter(new RequestTracingFilter(), SecurityContextHolderFilter.class)
				.build();
	}

}
```

- [ ] **Step 3: Delete the old security and logging files with `apply_patch`**

Delete exactly:

```text
crm/src/main/java/com/crm/config/SecurityConfig.java
crm/src/main/java/com/crm/logging/RequestTracingFilter.java
```

- [ ] **Step 4: Statically inspect Task 7**

Run:

```bash
rtk grep -n "new RequestTracingFilter|addFilterAfter|SecurityContextHolderFilter" crm/src/main/java/com/crm/foundation
rtk grep -n "com.crm.logging|package com.crm.config|package com.crm.logging" crm/src/main/java
rtk grep -n "getQueryString|getInputStream|getReader|getCookies|Authorization|password|accessToken|refreshToken" crm/src/main/java/com/crm/foundation/logging/RequestTracingFilter.java
```

Expected static evidence:

- The filter is instantiated exactly once after `SecurityContextHolderFilter`.
- The old packages have zero references.
- Metadata-only logging remains unchanged and the final sensitive-data grep returns zero matches.

---

### Task 8: Perform Final Static Architecture Review

**Files:**

- Read: all Java files under `crm/src/main/java/com/crm/sharedkernel`.
- Read: all Java files under `crm/src/main/java/com/crm/foundation`.
- Read: `crm/src/main/java/com/crm/CrmApplication.java`.
- Read: `crm/src/main/resources/logback-spring.xml`.
- Read with credential redaction: `crm/src/main/resources/application.yaml`.
- Read: `docs/superpowers/specs/2026-08-03-pragmatic-ddd-project-structure-design.md`.

**Interfaces:**

- Consumes: all deliverables from Tasks 1 through 7.
- Produces: an evidence-backed static handoff without runtime, test, build, database, or Git-mutation claims.

- [ ] **Step 1: Inspect the resulting package tree**

Run:

```bash
rtk tree crm/src/main/java/com/crm -L 8
```

Confirm:

- `sharedkernel` and `foundation` both exist and are separate.
- No `base`, `common`, or empty business-context packages were created.
- Only `CrmApplication.java` remains directly under `com.crm`.

- [ ] **Step 2: Check package ownership and dependency direction**

Run:

```bash
rtk grep -n "org.springframework|jakarta.persistence|jakarta.servlet" crm/src/main/java/com/crm/sharedkernel
rtk grep -n "com.crm.foundation" crm/src/main/java/com/crm/sharedkernel
rtk grep -n "BaseController|BaseService|BaseRepository|GenericCrud" crm/src/main/java
rtk grep -n "package com.crm.config|package com.crm.logging|package com.crm.health|import com.crm.config|import com.crm.logging|import com.crm.health" crm/src/main/java
```

Expected: all four commands return zero matches.

- [ ] **Step 3: Check expected source files and package-path consistency**

Run this read-only standard-library checker from the repository root:

```bash
python3 -c '
from pathlib import Path

root = Path("crm/src/main/java")
expected = [
    "com/crm/sharedkernel/domain/TenantId.java",
    "com/crm/sharedkernel/domain/ActorId.java",
    "com/crm/sharedkernel/domain/DomainEvent.java",
    "com/crm/sharedkernel/domain/AggregateRoot.java",
    "com/crm/sharedkernel/domain/exception/DomainException.java",
    "com/crm/sharedkernel/application/PageQuery.java",
    "com/crm/sharedkernel/application/PageResult.java",
    "com/crm/foundation/time/TimeProvider.java",
    "com/crm/foundation/time/SystemTimeProvider.java",
    "com/crm/foundation/identifier/IdentifierGenerator.java",
    "com/crm/foundation/identifier/UuidIdentifierGenerator.java",
    "com/crm/foundation/event/DomainEventPublisher.java",
    "com/crm/foundation/tenancy/CurrentTenant.java",
    "com/crm/foundation/security/CurrentActor.java",
    "com/crm/foundation/persistence/auditing/AuditContext.java",
    "com/crm/foundation/web/error/GlobalExceptionHandler.java",
    "com/crm/foundation/config/SecurityConfig.java",
    "com/crm/foundation/logging/RequestTracingFilter.java",
]
assert all((root / path).is_file() for path in expected)
for path in root.rglob("*.java"):
    text = path.read_text(encoding="utf-8")
    relative = path.relative_to(root)
    expected_package = ".".join(relative.parts[:-1])
    if expected_package:
        assert "package " + expected_package + ";" in text, relative
print("STATIC_SOURCE_CHECK_OK expected_files=" + str(len(expected)))
'
```

Expected: exit `0` and `STATIC_SOURCE_CHECK_OK expected_files=18` without displaying credentials.

- [ ] **Step 4: Check trace/error consistency and sensitive-data minimization**

Run:

```bash
rtk grep -n "traceId|X-Request-ID|ProblemDetail|INTERNAL_ERROR" crm/src/main/java/com/crm/foundation crm/src/main/resources/logback-spring.xml
rtk grep -n "getQueryString|getInputStream|getReader|getCookies|Authorization|password|accessToken|refreshToken|requestBody|responseBody" crm/src/main/java/com/crm/foundation
```

Expected:

- `traceId` is consistent across MDC, Logback, and `ProblemDetail`.
- The second command returns zero matches.

- [ ] **Step 5: Confirm configuration files were not changed by this plan**

Use credential-redacted static inspection to confirm:

- `application.yaml` still contains active MySQL configuration and the commented PostgreSQL block.
- `logging.config` still references `classpath:logback-spring.xml`.
- `logback-spring.xml` still uses the `com.crm` logger and the approved rolling policy.
- `pom.xml` has no newly added dependency.

Do not print datasource passwords or complete connection strings.

- [ ] **Step 6: Report explicit verification omissions**

The handoff must explicitly state:

```text
No tests, build, application startup, API call, database connection,
staging, commit, push, merge, or pull request were performed.
Verification was limited to read-only static inspection.
```

Do not claim compilation or runtime success.
