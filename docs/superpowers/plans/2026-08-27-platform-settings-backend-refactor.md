# Platform Settings Backend Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 935-line `TenantSettingsApplicationService` into eight concern-scoped services, decouple the HTTP contract from application DTOs, and move JSON serialization into infrastructure — without changing a single byte of any response body.

**Architecture:** Eight facade-plus-service pairs in `application/usecase` and `application/service`, mirroring `platform/access`. A `TenantSettingsStore` port hides JSON codec work behind infrastructure. Eighteen `*Response` records in `presentation/web` mirror the application DTOs field-for-field, mapped by three `*WebMapper` components.

**Tech Stack:** Java 21 records, Spring Boot, Spring `JdbcClient`, Jackson, Spring `@RestController`.

**Spec:** `docs/superpowers/specs/2026-08-27-platform-settings-backend-refactor-design.md`

## Global Constraints

These come from `AGENTS.md` and from the spec. They apply to every task below.

- **Do not create git commits.** `AGENTS.md` section 3. The standard "commit" step of the writing-plans workflow is replaced everywhere in this plan by a static verification step. Leave all changes uncommitted.
- **Do not run tests, and do not run a build as an indirect test.** `AGENTS.md` section 4. No `mvn test`, no `mvn compile`, no starting the application. Verification is read-only static inspection only. See "Verification strategy" below.
- **Every API change updates `docs/api-reference.md` in the same task.** `AGENTS.md` section 5. This refactor changes no endpoint, so the only documentation change is the placeholder warnings in Task 15.
- **No URL, HTTP method, status code, permission, or JSON field name may change.** Spec section 3.
- **Response record components must be spelled and ordered exactly as their DTO counterparts.** Spec section 6.
- **No `@JsonInclude` annotations on response records.** Nulls are emitted today and must continue to be. Spec section 6.
- **Exactly two intentional behavior changes are permitted**, both named in the spec: the PATCH permission union (Task 14) and the serialization error code (Task 2). Any other behavior difference is a defect.
- **Java style in this module:** tab indentation, `final` classes for controllers and mappers, constructor injection with no annotations, `@Component` on mappers, `@Service` on application services, `@Repository` on JDBC adapters.

## Verification strategy

Because tests and builds are both off-limits, each task ends with a static check
that a reviewer can repeat. Three checks recur; they are named here and
referenced by number from the tasks.

**Check A — Symbol resolution.** For every new or edited file, confirm each
referenced type is either imported in that file or lives in the same package.
Run: `grep -n "^import" <file>` and compare against the types the file uses.

**Check B — Field parity.** For a response record, confirm its component list is
identical in name, type, and order to the DTO it mirrors, and identical in name
to the TypeScript interface in `crm-fe/src/services/api/tenantSettingsApi.ts`.

**Check C — No orphaned references.** After moving or deleting a symbol, confirm
nothing still references the old name. Run:
`grep -rn "<OldSymbol>" crm/src/main/java/com/crm --include=*.java`
Expected: no hits outside the file that defines it.

---

### Task 1: Extract the shared access guard and defaults

The current service repeats `AccessContext ctx = authorize(...)` in all 46 public
methods and carries thirteen `default*()` factory methods in its last 200 lines.
Both must exist as standalone collaborators before any concern can be split out.

**Files:**
- Create: `crm/src/main/java/com/crm/platform/settings/application/service/AccessContext.java`
- Create: `crm/src/main/java/com/crm/platform/settings/application/service/TenantSettingsAccessGuard.java`
- Create: `crm/src/main/java/com/crm/platform/settings/application/service/TenantSettingDefaults.java`
- Modify: `crm/src/main/java/com/crm/platform/settings/application/service/TenantSettingsApplicationService.java` (remove private `authorize` at line 814, private record `AccessContext` at line 934, and the thirteen `default*` methods at lines 835–933)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `AccessContext(TenantId tenantId, ActorId actorId)` — package-level record.
  - `TenantSettingsAccessGuard.require(SystemPermission permission) -> AccessContext`
  - `TenantSettingsAccessGuard.requireAll(SystemPermission... permissions) -> AccessContext`
    (named `requireAll`, not an overload of `require`: Java would resolve the
    single-argument call to the non-varargs method, but the distinct name makes
    which one is being called obvious at the call site)
  - `TenantSettingDefaults` static methods, one per current `default*()` method, with identical names and return types: `profile()`, `billingInfo()`, `localization()`, `currencies(Instant now)`, `businessHours()`, `security()`, `passwordPolicy()`, `automation()`, `routingRules()`, `alertRules()`, `notifications()`, `digest()`, `documentSequences(Instant now)`.

  Two of the thirteen take an `Instant`. `defaultCurrencies()` and
  `defaultDocumentSequences()` call `timeProvider.now()` in their bodies, so a
  pure static utility cannot reproduce them without either injecting a
  `TimeProvider` or taking the instant as a parameter. Taking the parameter is
  the smaller change, since every caller already holds a `TimeProvider`.

- [ ] **Step 1: Create `AccessContext`**

```java
package com.crm.platform.settings.application.service;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

record AccessContext(TenantId tenantId, ActorId actorId) {
}
```

Package-private on purpose: it must not escape `application.service`.

- [ ] **Step 2: Create `TenantSettingsAccessGuard`**

```java
package com.crm.platform.settings.application.service;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.PermissionChecker;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Component;

@Component
public class TenantSettingsAccessGuard {

	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final PermissionChecker permissionChecker;

	public TenantSettingsAccessGuard(
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			PermissionChecker permissionChecker) {
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.permissionChecker = permissionChecker;
	}

	AccessContext require(SystemPermission permission) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		permissionChecker.requirePermission(permission);
		return new AccessContext(tenantId, actorId);
	}

	AccessContext requireAll(SystemPermission... permissions) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		for (SystemPermission permission : permissions) {
			permissionChecker.requirePermission(permission);
		}
		return new AccessContext(tenantId, actorId);
	}
}
```

The class is `public` so Spring can instantiate it; the `require` methods are
package-private so only `application.service` can call them. The order of
operations — resolve tenant, resolve actor, then check permission — is copied
verbatim from the current `authorize` at line 814 and must not be reordered.

- [ ] **Step 3: Create `TenantSettingDefaults`**

Move the bodies of the thirteen `default*()` methods from
`TenantSettingsApplicationService` lines 835–933 verbatim. Rename by dropping the
`default` prefix and lowercasing the first letter: `defaultProfile()` becomes
`profile()`, `defaultBusinessHours()` becomes `businessHours()`, and so on.

```java
package com.crm.platform.settings.application.service;

import java.math.BigDecimal;
import java.util.List;

import com.crm.platform.settings.application.dto.AlertRulesDto;
import com.crm.platform.settings.application.dto.AutomationSettingsDto;
import com.crm.platform.settings.application.dto.BillingInfoDto;
import com.crm.platform.settings.application.dto.BusinessHoursDto;
import com.crm.platform.settings.application.dto.CurrencyRateDto;
import com.crm.platform.settings.application.dto.DigestScheduleDto;
import com.crm.platform.settings.application.dto.DocumentSequenceDto;
import com.crm.platform.settings.application.dto.LeadRoutingRuleDto;
import com.crm.platform.settings.application.dto.LocalizationSettingsDto;
import com.crm.platform.settings.application.dto.NotificationSettingsDto;
import com.crm.platform.settings.application.dto.PasswordPolicyDto;
import com.crm.platform.settings.application.dto.SecuritySettingsDto;
import com.crm.platform.settings.application.dto.TenantProfileDto;

final class TenantSettingDefaults {

	private TenantSettingDefaults() {
	}

	static TenantProfileDto profile() {
		// body copied verbatim from defaultProfile(), service lines 835-847
	}

	// ... one static method per remaining default, same treatment
}
```

The values inside each body must not be edited. They are the fallback a tenant
sees before ever saving a section, so changing one silently changes what the
frontend renders on a fresh tenant.

- [ ] **Step 4: Repoint the existing service**

In `TenantSettingsApplicationService`: replace the `CurrentTenant`,
`CurrentActor`, and `PermissionChecker` constructor parameters with a single
`TenantSettingsAccessGuard accessGuard`. Replace every `authorize(X)` call with
`accessGuard.require(X)`. Replace every `defaultX()` call with
`TenantSettingDefaults.x()`. Delete the private `authorize` method, the private
`AccessContext` record, and the thirteen `default*` methods.

- [ ] **Step 5: Verify**

Run Check A on all three new files.
Run Check C for `defaultProfile`, `defaultBillingInfo`, `defaultLocalization`,
`defaultCurrencies`, `defaultBusinessHours`, `defaultSecurity`,
`defaultPasswordPolicy`, `defaultAutomation`, `defaultRoutingRules`,
`defaultAlertRules`, `defaultNotifications`, `defaultDigest`,
`defaultDocumentSequences`, and `authorize`.
Then confirm the guard is used everywhere it should be:

```bash
grep -c "accessGuard.require" crm/src/main/java/com/crm/platform/settings/application/service/TenantSettingsApplicationService.java
```

Expected: 44 — not 46. Two of the 46 facade methods never call `authorize`
themselves: `resetLogo` (line 216) delegates to `updateLogo`, and
`updateCurrencyRate` (line 296) delegates to `addCurrency`. Both are therefore
authorized by the method they delegate to. Preserve that delegation when
splitting; do not "fix" it by adding a second permission check, which would
double-check the permission on those two endpoints.

---

### Task 2: Introduce the settings store and wire up the payload error code

Moves JSON serialization out of the application layer, and replaces the bare
`RuntimeException` with the module's own error code. This task carries one of
the two intentional behavior changes.

**Files:**
- Create: `crm/src/main/java/com/crm/platform/settings/application/port/TenantSettingsStore.java`
- Create: `crm/src/main/java/com/crm/platform/settings/infrastructure/persistence/JdbcTenantSettingsStore.java`
- Modify: `crm/src/main/java/com/crm/platform/settings/application/service/TenantSettingsApplicationService.java` (delete `OBJECT_MAPPER` at line 70, `loadSettingJson` overloads at lines 778–801, `saveSettingJson` at lines 802–813)
- Modify: `crm/src/main/resources/messages.properties`
- Modify: `crm/src/main/resources/messages_en.properties`
- Modify: `crm/src/main/resources/messages_vi.properties`

**Interfaces:**
- Consumes: `AccessContext` from Task 1.
- Produces:
  - `TenantSettingsStore.read(TenantId, TenantSettingKey, Class<T>, T) -> T`
  - `TenantSettingsStore.read(TenantId, TenantSettingKey, TypeReference<T>, T) -> T`
  - `TenantSettingsStore.write(TenantId, TenantSettingKey, Object, ActorId) -> void`

- [ ] **Step 1: Create the port**

```java
package com.crm.platform.settings.application.port;

import com.crm.platform.settings.domain.TenantSettingKey;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.fasterxml.jackson.core.type.TypeReference;

public interface TenantSettingsStore {

	<T> T read(TenantId tenantId, TenantSettingKey key, Class<T> type, T fallback);

	<T> T read(TenantId tenantId, TenantSettingKey key, TypeReference<T> type, T fallback);

	void write(TenantId tenantId, TenantSettingKey key, Object value, ActorId actorId);
}
```

`TypeReference` is a Jackson type appearing in an application-layer port. That is
a deliberate, documented compromise: the alternative is a bespoke type token, and
the existing code already couples the application layer to Jackson far more
tightly. Do not "fix" this by widening the signature to `Object`.

- [ ] **Step 2: Create the JDBC store**

```java
package com.crm.platform.settings.infrastructure.persistence;

import com.crm.foundation.time.TimeProvider;
import com.crm.platform.settings.application.port.TenantSettingsRepository;
import com.crm.platform.settings.application.port.TenantSettingsStore;
import com.crm.platform.settings.domain.TenantSetting;
import com.crm.platform.settings.domain.TenantSettingKey;
import com.crm.platform.settings.domain.TenantSettingsErrorCode;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class JdbcTenantSettingsStore implements TenantSettingsStore {

	private static final Logger LOGGER = LoggerFactory.getLogger(JdbcTenantSettingsStore.class);
	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

	private final TenantSettingsRepository settingsRepository;
	private final TimeProvider timeProvider;

	public JdbcTenantSettingsStore(
			TenantSettingsRepository settingsRepository,
			TimeProvider timeProvider) {
		this.settingsRepository = settingsRepository;
		this.timeProvider = timeProvider;
	}

	@Override
	public <T> T read(TenantId tenantId, TenantSettingKey key, Class<T> type, T fallback) {
		return settingsRepository.findByKey(tenantId, key)
				.map(setting -> {
					try {
						return OBJECT_MAPPER.readValue(setting.settingValue(), type);
					}
					catch (Exception e) {
						LOGGER.warn(
								"Unreadable tenant setting, falling back to default. tenantId={} settingKey={}",
								tenantId.value(), key.code(), e);
						return fallback;
					}
				})
				.orElse(fallback);
	}

	@Override
	public <T> T read(TenantId tenantId, TenantSettingKey key, TypeReference<T> type, T fallback) {
		return settingsRepository.findByKey(tenantId, key)
				.map(setting -> {
					try {
						return OBJECT_MAPPER.readValue(setting.settingValue(), type);
					}
					catch (Exception e) {
						LOGGER.warn(
								"Unreadable tenant setting, falling back to default. tenantId={} settingKey={}",
								tenantId.value(), key.code(), e);
						return fallback;
					}
				})
				.orElse(fallback);
	}

	@Override
	public void write(TenantId tenantId, TenantSettingKey key, Object value, ActorId actorId) {
		String json;
		try {
			json = OBJECT_MAPPER.writeValueAsString(value);
		}
		catch (Exception e) {
			throw new BusinessRuleViolation(TenantSettingsErrorCode.INVALID_SETTING_PAYLOAD);
		}
		TenantSetting setting = settingsRepository.findByKey(tenantId, key)
				.orElseGet(() -> TenantSetting.create(
						tenantId, key, json, false, actorId, timeProvider.now()));
		setting.updateValue(json, actorId, timeProvider.now());
		settingsRepository.save(setting);
	}
}
```

Two details carried over deliberately from the original `saveSettingJson`:
`TenantSetting.create(...)` is followed by `updateValue(...)` even on the
creation path, which bumps `version` from 1 to 2 on first write. That is existing
behavior and is out of scope — do not "fix" it here.

The fallback-on-read behavior is also preserved exactly. Only the `WARN` log is
new, because a silent revert to defaults is otherwise untraceable.

- [ ] **Step 3: Add the nine message keys**

Append to all three bundles. Values below are for `messages_vi.properties`;
`messages_en.properties` gets the English column; `messages.properties` gets the
same values as the Vietnamese bundle, matching how the repository treats
Vietnamese as the default language.

```properties
settings.not_found=Không tìm thấy thiết lập
settings.invalid_payload=Nội dung thiết lập không hợp lệ
settings.version_conflict=Thiết lập đã được người khác thay đổi
settings.invalid_cidr_block=Dải IP không hợp lệ
settings.ip_whitelist_rule_not_found=Không tìm thấy quy tắc IP
settings.document_sequence_not_found=Không tìm thấy cấu hình đánh số chứng từ
settings.currency_not_supported=Loại tiền tệ không được hỗ trợ
settings.currency_already_exists=Loại tiền tệ đã tồn tại
settings.invalid_exchange_rate=Tỷ giá không hợp lệ
```

English equivalents for `messages_en.properties`:

```properties
settings.not_found=Setting not found
settings.invalid_payload=Invalid setting payload
settings.version_conflict=The setting was changed by someone else
settings.invalid_cidr_block=Invalid CIDR block
settings.ip_whitelist_rule_not_found=IP whitelist rule not found
settings.document_sequence_not_found=Document sequence configuration not found
settings.currency_not_supported=Currency is not supported
settings.currency_already_exists=Currency already exists
settings.invalid_exchange_rate=Invalid exchange rate
```

Before writing, confirm the ordering convention of the existing bundles — if keys
are grouped by module with a comment header, follow that grouping.

- [ ] **Step 4: Repoint the existing service**

Replace the `TenantSettingsRepository settingsRepository` constructor parameter
with `TenantSettingsStore settingsStore`. Replace every
`loadSettingJson(tenantId, KEY, Type.class, fallback)` with
`settingsStore.read(tenantId, KEY, Type.class, fallback)` and every
`saveSettingJson(tenantId, KEY, value, actorId)` with
`settingsStore.write(tenantId, KEY, value, actorId)`. Delete the static
`OBJECT_MAPPER`, both `loadSettingJson` overloads, and `saveSettingJson`.

Note that `TenantSettingsApplicationService` also uses `sequenceRepository` and
`ipWhitelistRepository` directly. Those stay — only `settingsRepository` is
replaced.

- [ ] **Step 5: Verify**

Run Check A on both new files.
Run Check C for `loadSettingJson` and `saveSettingJson`.
Confirm Jackson has left the application layer entirely:

```bash
grep -rn "ObjectMapper\|com.fasterxml" crm/src/main/java/com/crm/platform/settings/application/service/
```

Expected: no hits.

```bash
grep -rn "settings\." crm/src/main/resources/messages_vi.properties | wc -l
```

Expected: 9.

---

### Task 3: Flatten the request record package

**Files:**
- Move: all 18 files from `crm/src/main/java/com/crm/platform/settings/presentation/web/request/` to `crm/src/main/java/com/crm/platform/settings/presentation/web/`
- Modify: `crm/src/main/java/com/crm/platform/settings/presentation/web/TenantSettingsWebMapper.java` (drop 18 now-redundant imports)
- Modify: all five controllers (drop the `...web.request.*` imports)

**Interfaces:**
- Consumes: nothing.
- Produces: the same 18 request record types, now in package `com.crm.platform.settings.presentation.web`.

The 18 files are: `AddCurrencyRequest`, `AddIpWhitelistRequest`,
`AddLeadRoutingRuleRequest`, `NotificationPingTestRequest`,
`PatchConsolidatedSettingsRequest`, `ResetDocumentSequenceRequest`,
`UpdateAlertRulesRequest`, `UpdateAutomationRequest`, `UpdateBillingInfoRequest`,
`UpdateBusinessHoursRequest`, `UpdateCurrencyRateRequest`,
`UpdateDigestScheduleRequest`, `UpdateDocumentSequenceRequest`,
`UpdateLocalizationRequest`, `UpdateNotificationRequest`,
`UpdatePasswordPolicyRequest`, `UpdateProfileRequest`, `UpdateSecurityRequest`.

- [ ] **Step 1: Move the files and rewrite their package declarations**

```bash
cd crm/src/main/java/com/crm/platform/settings/presentation/web
git mv request/*.java .
sed -i 's|^package com\.crm\.platform\.settings\.presentation\.web\.request;|package com.crm.platform.settings.presentation.web;|' \
  AddCurrencyRequest.java AddIpWhitelistRequest.java AddLeadRoutingRuleRequest.java \
  NotificationPingTestRequest.java PatchConsolidatedSettingsRequest.java \
  ResetDocumentSequenceRequest.java UpdateAlertRulesRequest.java UpdateAutomationRequest.java \
  UpdateBillingInfoRequest.java UpdateBusinessHoursRequest.java UpdateCurrencyRateRequest.java \
  UpdateDigestScheduleRequest.java UpdateDocumentSequenceRequest.java UpdateLocalizationRequest.java \
  UpdateNotificationRequest.java UpdatePasswordPolicyRequest.java UpdateProfileRequest.java \
  UpdateSecurityRequest.java
rmdir request
```

`git mv` is used only to preserve rename detection in the working tree. It stages
the move; per the global constraints, do not commit.

- [ ] **Step 2: Drop the now-redundant imports**

Same-package types need no import. Remove every
`import com.crm.platform.settings.presentation.web.request.*;` line from the
mapper and the five controllers:

```bash
sed -i '/^import com\.crm\.platform\.settings\.presentation\.web\.request\./d' \
  crm/src/main/java/com/crm/platform/settings/presentation/web/*.java
```

- [ ] **Step 3: Verify**

```bash
grep -rn "presentation\.web\.request" crm/src/main/java/com/crm
ls crm/src/main/java/com/crm/platform/settings/presentation/web/*Request.java | wc -l
```

Expected: no hits for the first command; `18` for the second.

---

### Task 4: Add the eighteen response records

Purely additive. Nothing references these yet, so this task cannot break
anything — which is exactly why it is isolated. The whole risk of the task is
field parity, and a reviewer can check that and nothing else.

**Files:**
- Create: 18 files in `crm/src/main/java/com/crm/platform/settings/presentation/web/`

**Interfaces:**
- Consumes: nothing.
- Produces: the 18 response record types listed below.

- [ ] **Step 1: Create the sixteen leaf records**

Each is a `public record` in package `com.crm.platform.settings.presentation.web`
with the imports its component types require.

```java
public record TenantProfileResponse(
		String tenantName,
		String legalName,
		String taxCode,
		String contactEmail,
		String contactPhone,
		String address,
		String website,
		String logoUrl
) {}

public record BillingInfoResponse(
		String bankName,
		String bankAccountNumber,
		String bankAccountHolder,
		String swiftCode,
		String invoiceHeaderNote,
		String invoiceFooterNote
) {}

public record LocalizationSettingsResponse(
		String defaultCurrency,
		List<String> supportedCurrencies,
		String defaultTimezone,
		String dateFormat,
		String timeFormat,
		String decimalSeparator,
		String thousandsSeparator,
		int fiscalYearStartMonth
) {}

public record CurrencyRateResponse(
		String currencyCode,
		String currencyName,
		String symbol,
		BigDecimal exchangeRateToBase,
		String rateMode,
		Instant lastSyncedAt
) {}

public record BusinessHoursResponse(
		String timezone,
		List<String> workDays,
		String startTime,
		String endTime,
		boolean holidayCalendarEnabled,
		List<String> observedHolidays
) {}

public record SecuritySettingsResponse(
		boolean enableTwoFactor,
		String twoFactorEnforceScope,
		boolean enableAuditLog,
		int sessionTimeoutMinutes,
		int maxConcurrentSessions,
		boolean ipWhitelistEnabled,
		int passwordExpiryDays
) {}

public record PasswordPolicyResponse(
		int minLength,
		boolean requireUppercase,
		boolean requireLowercase,
		boolean requireNumbers,
		boolean requireSpecialChars,
		int maxFailedAttempts,
		int lockoutDurationMinutes,
		int passwordHistoryCount
) {}

public record IpWhitelistRuleResponse(
		UUID id,
		String cidrBlock,
		String description,
		boolean active,
		Instant createdAt,
		UUID createdBy
) {}

public record ActiveSessionResponse(
		UUID sessionId,
		UUID userId,
		String userEmail,
		String userName,
		String ipAddress,
		String userAgent,
		String deviceType,
		Instant loginAt,
		Instant lastActivityAt,
		boolean isCurrentSession
) {}

public record AutomationSettingsResponse(
		boolean autoAssignLeads,
		String routingStrategy,
		UUID defaultLeadOwnerUserId,
		UUID defaultLeadOwnerTeamId,
		boolean notifySlack,
		boolean dailyDigest,
		String digestTime,
		boolean autoTaskCreationOnNewLead,
		int staleDealThresholdDays
) {}

public record LeadRoutingRuleResponse(
		UUID id,
		String ruleName,
		int priority,
		String conditionField,
		String conditionOperator,
		String conditionValue,
		UUID assignToUserId,
		UUID assignToTeamId,
		boolean active
) {}

public record AlertRulesResponse(
		boolean highValueDealAlertEnabled,
		BigDecimal highValueDealThreshold,
		List<String> highValueNotificationChannels,
		boolean staleDealAlertEnabled,
		int staleDealInactivityDays,
		boolean churnRiskAlertEnabled
) {}

public record NotificationSettingsResponse(
		boolean customSmtpEnabled,
		String smtpHost,
		int smtpPort,
		String smtpUsername,
		String smtpSenderEmail,
		String smtpSenderName,
		boolean slackWebhookEnabled,
		String slackWebhookUrl,
		String slackChannel,
		boolean teamsWebhookEnabled,
		String teamsWebhookUrl,
		boolean inAppNotificationsEnabled
) {}

public record DigestScheduleResponse(
		boolean enabled,
		String frequency,
		String deliveryTime,
		String timezone,
		List<UUID> recipientUserIds,
		List<String> recipientEmails,
		List<String> includedMetricKeys
) {}

public record DocumentSequenceResponse(
		String entityType,
		String prefix,
		String dateFormatPattern,
		int paddingLength,
		long currentValue,
		String previewFormattedNumber,
		Instant updatedAt
) {}

public record StorageUsageResponse(
		long databaseSizeBytes,
		long attachmentsSizeBytes,
		long totalAllocatedQuotaBytes,
		double usagePercentage,
		long totalDbRows,
		Map<String, Long> storageBreakdownByModule
) {}

public record BackupSnapshotResponse(
		UUID backupId,
		String backupFileName,
		long fileSizeBytes,
		String status,
		Instant createdAt,
		Instant expiresAt,
		String downloadUrl
) {}
```

`ActiveSessionResponse.isCurrentSession` keeps the `is` prefix. Java records name
the accessor after the component verbatim, so Jackson emits `isCurrentSession`.
Renaming it to `currentSession` would silently change the JSON and break
`ActiveSessionData.isCurrentSession` in the frontend.

`NotificationSettingsResponse` has no `smtpPassword` component, matching
`NotificationSettingsDto`. That omission is correct — a secret must not be
returned. See spec section 9 for why the write side is nevertheless broken.

- [ ] **Step 2: Create the nested consolidated record**

```java
public record ConsolidatedTenantSettingsResponse(
		UUID tenantId,
		String tenantCode,
		TenantProfileResponse profile,
		BillingInfoResponse billingInfo,
		LocalizationSettingsResponse localization,
		BusinessHoursResponse businessHours,
		SecuritySettingsResponse security,
		PasswordPolicyResponse passwordPolicy,
		AutomationSettingsResponse automation,
		AlertRulesResponse alertRules,
		NotificationSettingsResponse notifications,
		DigestScheduleResponse digest,
		long version,
		Instant updatedAt
) {}
```

It nests the response records, never the DTOs.

- [ ] **Step 3: Verify**

Run Check B on all 18 records against
`crm/src/main/java/com/crm/platform/settings/application/dto/` and against
`crm-fe/src/services/api/tenantSettingsApi.ts`. Record the result as an explicit
18-row checklist; this is the single highest-risk check in the plan.

```bash
ls crm/src/main/java/com/crm/platform/settings/presentation/web/*Response.java | wc -l
grep -rn "JsonInclude" crm/src/main/java/com/crm/platform/settings/presentation/web/
```

Expected: `18`; no hits for the second command.

---

### Task 5: Split the web mapper into three and add the response direction

**Files:**
- Modify: `crm/src/main/java/com/crm/platform/settings/presentation/web/TenantSettingsWebMapper.java`
- Create: `crm/src/main/java/com/crm/platform/settings/presentation/web/TenantSecurityWebMapper.java`
- Create: `crm/src/main/java/com/crm/platform/settings/presentation/web/TenantAutomationWebMapper.java`

**Interfaces:**
- Consumes: the 18 response records from Task 4.
- Produces:
  - `TenantSettingsWebMapper` — keeps `toCommand` for profile, billing, localization, currency, business hours, notification, digest, document sequence, and consolidated patch; gains `toResponse` for `TenantProfileDto`, `BillingInfoDto`, `LocalizationSettingsDto`, `CurrencyRateDto`, `BusinessHoursDto`, `NotificationSettingsDto`, `DigestScheduleDto`, `DocumentSequenceDto`, `StorageUsageDto`, `BackupSnapshotDto`, `ConsolidatedTenantSettingsDto`.
  - `TenantSecurityWebMapper` — `toCommand(UpdateSecurityRequest)`, `toCommand(UpdatePasswordPolicyRequest)`, `toCommand(AddIpWhitelistRequest)`; `toResponse` for `SecuritySettingsDto`, `PasswordPolicyDto`, `IpWhitelistRuleDto`, `ActiveSessionDto`.
  - `TenantAutomationWebMapper` — `toCommand(UpdateAutomationRequest)`, `toCommand(UpdateAlertRulesRequest)`, `toAddCommand(AddLeadRoutingRuleRequest)`, `toUpdateCommand(UUID, AddLeadRoutingRuleRequest)`; `toResponse` for `AutomationSettingsDto`, `AlertRulesDto`, `LeadRoutingRuleDto`.

- [ ] **Step 1: Create `TenantSecurityWebMapper`**

Move `toCommand(UpdateSecurityRequest)`, `toCommand(UpdatePasswordPolicyRequest)`,
and `toCommand(AddIpWhitelistRequest)` out of `TenantSettingsWebMapper` verbatim,
then add the response direction:

```java
package com.crm.platform.settings.presentation.web;

import com.crm.platform.settings.application.command.AddIpWhitelistRuleCommand;
import com.crm.platform.settings.application.command.UpdatePasswordPolicyCommand;
import com.crm.platform.settings.application.command.UpdateSecurityPolicyCommand;
import com.crm.platform.settings.application.dto.ActiveSessionDto;
import com.crm.platform.settings.application.dto.IpWhitelistRuleDto;
import com.crm.platform.settings.application.dto.PasswordPolicyDto;
import com.crm.platform.settings.application.dto.SecuritySettingsDto;
import org.springframework.stereotype.Component;

@Component
public final class TenantSecurityWebMapper {

	public UpdateSecurityPolicyCommand toCommand(UpdateSecurityRequest r) {
		return new UpdateSecurityPolicyCommand(
				r.enableTwoFactor(), r.twoFactorEnforceScope(), r.enableAuditLog(),
				r.sessionTimeoutMinutes(), r.maxConcurrentSessions(),
				r.ipWhitelistEnabled(), r.passwordExpiryDays()
		);
	}

	public UpdatePasswordPolicyCommand toCommand(UpdatePasswordPolicyRequest r) {
		return new UpdatePasswordPolicyCommand(
				r.minLength(), r.requireUppercase(), r.requireLowercase(),
				r.requireNumbers(), r.requireSpecialChars(), r.maxFailedAttempts(),
				r.lockoutDurationMinutes(), r.passwordHistoryCount()
		);
	}

	public AddIpWhitelistRuleCommand toCommand(AddIpWhitelistRequest r) {
		return new AddIpWhitelistRuleCommand(r.cidrBlock(), r.description());
	}

	public SecuritySettingsResponse toResponse(SecuritySettingsDto d) {
		return new SecuritySettingsResponse(
				d.enableTwoFactor(), d.twoFactorEnforceScope(), d.enableAuditLog(),
				d.sessionTimeoutMinutes(), d.maxConcurrentSessions(),
				d.ipWhitelistEnabled(), d.passwordExpiryDays()
		);
	}

	public PasswordPolicyResponse toResponse(PasswordPolicyDto d) {
		return new PasswordPolicyResponse(
				d.minLength(), d.requireUppercase(), d.requireLowercase(),
				d.requireNumbers(), d.requireSpecialChars(), d.maxFailedAttempts(),
				d.lockoutDurationMinutes(), d.passwordHistoryCount()
		);
	}

	public IpWhitelistRuleResponse toResponse(IpWhitelistRuleDto d) {
		return new IpWhitelistRuleResponse(
				d.id(), d.cidrBlock(), d.description(),
				d.active(), d.createdAt(), d.createdBy()
		);
	}

	public ActiveSessionResponse toResponse(ActiveSessionDto d) {
		return new ActiveSessionResponse(
				d.sessionId(), d.userId(), d.userEmail(), d.userName(),
				d.ipAddress(), d.userAgent(), d.deviceType(),
				d.loginAt(), d.lastActivityAt(), d.isCurrentSession()
		);
	}
}
```

Method overloading on the DTO parameter type is safe here because every DTO is a
distinct type. Do not merge them into one generic method.

- [ ] **Step 2: Create `TenantAutomationWebMapper`**

Move `toCommand(UpdateAutomationRequest)` and `toCommand(UpdateAlertRulesRequest)`
out of `TenantSettingsWebMapper` verbatim. The two lead-routing command builders
are new; their command types arrive in Task 12, so for now write only the
`toResponse` methods and the two moved `toCommand` methods, and add the routing
builders in Task 12.

```java
package com.crm.platform.settings.presentation.web;

import java.util.UUID;

import com.crm.platform.settings.application.command.UpdateAlertRulesCommand;
import com.crm.platform.settings.application.command.UpdateAutomationRulesCommand;
import com.crm.platform.settings.application.dto.AlertRulesDto;
import com.crm.platform.settings.application.dto.AutomationSettingsDto;
import com.crm.platform.settings.application.dto.LeadRoutingRuleDto;
import org.springframework.stereotype.Component;

@Component
public final class TenantAutomationWebMapper {

	public UpdateAutomationRulesCommand toCommand(UpdateAutomationRequest r) {
		return new UpdateAutomationRulesCommand(
				r.autoAssignLeads(), r.routingStrategy(),
				r.defaultLeadOwnerUserId(), r.defaultLeadOwnerTeamId(),
				r.notifySlack(), r.dailyDigest(), r.digestTime(),
				r.autoTaskCreationOnNewLead(), r.staleDealThresholdDays()
		);
	}

	public UpdateAlertRulesCommand toCommand(UpdateAlertRulesRequest r) {
		return new UpdateAlertRulesCommand(
				r.highValueDealAlertEnabled(), r.highValueDealThreshold(),
				r.highValueNotificationChannels(), r.staleDealAlertEnabled(),
				r.staleDealInactivityDays(), r.churnRiskAlertEnabled()
		);
	}

	public AutomationSettingsResponse toResponse(AutomationSettingsDto d) {
		return new AutomationSettingsResponse(
				d.autoAssignLeads(), d.routingStrategy(),
				d.defaultLeadOwnerUserId(), d.defaultLeadOwnerTeamId(),
				d.notifySlack(), d.dailyDigest(), d.digestTime(),
				d.autoTaskCreationOnNewLead(), d.staleDealThresholdDays()
		);
	}

	public AlertRulesResponse toResponse(AlertRulesDto d) {
		return new AlertRulesResponse(
				d.highValueDealAlertEnabled(), d.highValueDealThreshold(),
				d.highValueNotificationChannels(), d.staleDealAlertEnabled(),
				d.staleDealInactivityDays(), d.churnRiskAlertEnabled()
		);
	}

	public LeadRoutingRuleResponse toResponse(LeadRoutingRuleDto d) {
		return new LeadRoutingRuleResponse(
				d.id(), d.ruleName(), d.priority(),
				d.conditionField(), d.conditionOperator(), d.conditionValue(),
				d.assignToUserId(), d.assignToTeamId(), d.active()
		);
	}
}
```

- [ ] **Step 3: Add the response direction to `TenantSettingsWebMapper`**

Delete the five `toCommand` methods that moved in Steps 1 and 2, then add:

```java
	public TenantProfileResponse toResponse(TenantProfileDto d) {
		return new TenantProfileResponse(
				d.tenantName(), d.legalName(), d.taxCode(), d.contactEmail(),
				d.contactPhone(), d.address(), d.website(), d.logoUrl()
		);
	}

	public BillingInfoResponse toResponse(BillingInfoDto d) {
		return new BillingInfoResponse(
				d.bankName(), d.bankAccountNumber(), d.bankAccountHolder(),
				d.swiftCode(), d.invoiceHeaderNote(), d.invoiceFooterNote()
		);
	}

	public LocalizationSettingsResponse toResponse(LocalizationSettingsDto d) {
		return new LocalizationSettingsResponse(
				d.defaultCurrency(), d.supportedCurrencies(), d.defaultTimezone(),
				d.dateFormat(), d.timeFormat(), d.decimalSeparator(),
				d.thousandsSeparator(), d.fiscalYearStartMonth()
		);
	}

	public CurrencyRateResponse toResponse(CurrencyRateDto d) {
		return new CurrencyRateResponse(
				d.currencyCode(), d.currencyName(), d.symbol(),
				d.exchangeRateToBase(), d.rateMode(), d.lastSyncedAt()
		);
	}

	public BusinessHoursResponse toResponse(BusinessHoursDto d) {
		return new BusinessHoursResponse(
				d.timezone(), d.workDays(), d.startTime(),
				d.endTime(), d.holidayCalendarEnabled(), d.observedHolidays()
		);
	}

	public NotificationSettingsResponse toResponse(NotificationSettingsDto d) {
		return new NotificationSettingsResponse(
				d.customSmtpEnabled(), d.smtpHost(), d.smtpPort(), d.smtpUsername(),
				d.smtpSenderEmail(), d.smtpSenderName(), d.slackWebhookEnabled(),
				d.slackWebhookUrl(), d.slackChannel(), d.teamsWebhookEnabled(),
				d.teamsWebhookUrl(), d.inAppNotificationsEnabled()
		);
	}

	public DigestScheduleResponse toResponse(DigestScheduleDto d) {
		return new DigestScheduleResponse(
				d.enabled(), d.frequency(), d.deliveryTime(), d.timezone(),
				d.recipientUserIds(), d.recipientEmails(), d.includedMetricKeys()
		);
	}

	public DocumentSequenceResponse toResponse(DocumentSequenceDto d) {
		return new DocumentSequenceResponse(
				d.entityType(), d.prefix(), d.dateFormatPattern(), d.paddingLength(),
				d.currentValue(), d.previewFormattedNumber(), d.updatedAt()
		);
	}

	public StorageUsageResponse toResponse(StorageUsageDto d) {
		return new StorageUsageResponse(
				d.databaseSizeBytes(), d.attachmentsSizeBytes(),
				d.totalAllocatedQuotaBytes(), d.usagePercentage(),
				d.totalDbRows(), d.storageBreakdownByModule()
		);
	}

	public BackupSnapshotResponse toResponse(BackupSnapshotDto d) {
		return new BackupSnapshotResponse(
				d.backupId(), d.backupFileName(), d.fileSizeBytes(), d.status(),
				d.createdAt(), d.expiresAt(), d.downloadUrl()
		);
	}
```

- [ ] **Step 4: Add the consolidated response mapping**

`ConsolidatedTenantSettingsResponse` nests security and automation responses,
which are produced by the other two mappers. Inject them:

```java
	private final TenantSecurityWebMapper securityMapper;
	private final TenantAutomationWebMapper automationMapper;

	public TenantSettingsWebMapper(
			TenantSecurityWebMapper securityMapper,
			TenantAutomationWebMapper automationMapper) {
		this.securityMapper = securityMapper;
		this.automationMapper = automationMapper;
	}

	public ConsolidatedTenantSettingsResponse toResponse(ConsolidatedTenantSettingsDto d) {
		return new ConsolidatedTenantSettingsResponse(
				d.tenantId(),
				d.tenantCode(),
				toResponse(d.profile()),
				toResponse(d.billingInfo()),
				toResponse(d.localization()),
				toResponse(d.businessHours()),
				securityMapper.toResponse(d.security()),
				securityMapper.toResponse(d.passwordPolicy()),
				automationMapper.toResponse(d.automation()),
				automationMapper.toResponse(d.alertRules()),
				toResponse(d.notifications()),
				toResponse(d.digest()),
				d.version(),
				d.updatedAt()
		);
	}
```

Adding a constructor removes the implicit no-arg one; this is the first
constructor on this class, so confirm no other code constructs it directly.

- [ ] **Step 5: Verify**

Run Check A on all three mappers.
Confirm every DTO has exactly one `toResponse`:

```bash
grep -c "public .*Response toResponse" crm/src/main/java/com/crm/platform/settings/presentation/web/TenantSettingsWebMapper.java
grep -c "public .*Response toResponse" crm/src/main/java/com/crm/platform/settings/presentation/web/TenantSecurityWebMapper.java
grep -c "public .*Response toResponse" crm/src/main/java/com/crm/platform/settings/presentation/web/TenantAutomationWebMapper.java
```

Expected: `11`, `4`, `3` — summing to 18.

Then re-run Check B, this time comparing each `toResponse` body against the DTO
accessor order. An argument transposition between two components of the same
type is the failure mode this catches, and it is invisible to the compiler.

---

### Task 6: Switch the five controllers to response types

**Files:**
- Modify: `crm/src/main/java/com/crm/platform/settings/presentation/web/TenantSettingsController.java`
- Modify: `crm/src/main/java/com/crm/platform/settings/presentation/web/TenantSecuritySettingsController.java`
- Modify: `crm/src/main/java/com/crm/platform/settings/presentation/web/TenantAutomationSettingsController.java`
- Modify: `crm/src/main/java/com/crm/platform/settings/presentation/web/TenantSequenceSettingsController.java`
- Modify: `crm/src/main/java/com/crm/platform/settings/presentation/web/TenantStorageSettingsController.java`

**Interfaces:**
- Consumes: the three mappers from Task 5.
- Produces: controllers whose signatures reference no `application.dto` type.

- [ ] **Step 1: Rewrite each endpoint's return type**

For every endpoint, change `ResponseEntity<XDto>` to `ResponseEntity<XResponse>`
and wrap the facade result in the mapper. For list endpoints, map each element.

```java
	@GetMapping("/profile")
	public ResponseEntity<TenantProfileResponse> getProfile() {
		return ResponseEntity.ok(mapper.toResponse(facade.getProfile()));
	}

	@GetMapping("/currencies")
	public ResponseEntity<List<CurrencyRateResponse>> listCurrencies() {
		return ResponseEntity.ok(facade.listCurrencies().stream()
				.map(mapper::toResponse)
				.toList());
	}
```

`TenantSecuritySettingsController` takes `TenantSecurityWebMapper`;
`TenantAutomationSettingsController` takes `TenantAutomationWebMapper`;
the other three take `TenantSettingsWebMapper`.

The `POST /notifications/test` endpoint returns
`ResponseEntity<Map<String, Object>>` built inline from `Map.of("success", ...,
"message", ...)`. Leave it exactly as it is. It is not a DTO, so it needs no
response record, and inventing one would change the JSON.

Status codes must not move: `POST /currencies` and
`POST /security/ip-whitelist` stay `201 Created`; the `DELETE` endpoints stay
`204 No Content`.

- [ ] **Step 2: Verify**

```bash
grep -rn "application\.dto" crm/src/main/java/com/crm/platform/settings/presentation/web/
```

Expected: hits only inside the three mapper files, never in a controller.

```bash
grep -rn "ResponseEntity<" crm/src/main/java/com/crm/platform/settings/presentation/web/*Controller.java | grep -c "Dto"
```

Expected: `0`.

Then re-read all five controllers and confirm every `@PostMapping` that
previously returned `HttpStatus.CREATED` still does, and every `DELETE` still
returns `noContent()`.

---

### Tasks 7–13: Split the application service, one concern at a time

Tasks 7 through 13 share a shape. Each extracts one concern from
`TenantSettingsApplicationService` into a new facade interface plus a new service
implementation, then repoints the owning controller. Do them in the listed order:
the earlier ones have no dependants, and security — the largest and the one the
consolidated PATCH permission logic depends on — comes last.

**The shape of each task, applied to every one of the seven:**

1. Create the facade interface in `application/usecase` with the exact method
   signatures given in that task.
2. Create the service class in `application/service`, annotated `@Service`,
   implementing that facade. Constructor-inject `TenantSettingsAccessGuard`,
   `TenantSettingsStore`, and whatever else that concern's methods use.
3. Move the named methods out of `TenantSettingsApplicationService` verbatim,
   keeping their `@Transactional` and `@Transactional(readOnly = true)`
   annotations exactly as they are.
4. For each method named in that task's **Produces** block as an `*Internal`
   variant — and only those — add a package-private
   `*Internal(AccessContext ctx, ...)` containing the body minus the
   `accessGuard.require(...)` line, and reduce the public method to `require`
   plus a call to the internal one. Task 14 consumes exactly these twelve; do
   not generate an internal variant for every method, as the other thirty-four
   have no second caller.
5. Delete the moved methods from `TenantSettingsApplicationService` and from
   `TenantSettingsFacade`.
6. Repoint the owning controller to the new facade.
7. Verify: Check A on the new files, Check C on each moved method name against
   `TenantSettingsApplicationService`, and confirm
   `grep -c "@Override" TenantSettingsApplicationService.java` has dropped by
   exactly the number of methods moved.

---

### Task 7: Extract the profile concern

**Files:**
- Create: `crm/src/main/java/com/crm/platform/settings/application/usecase/TenantProfileFacade.java`
- Create: `crm/src/main/java/com/crm/platform/settings/application/service/TenantProfileApplicationService.java`
- Modify: `TenantSettingsApplicationService.java` (remove `getProfile` line 172, `updateProfile` 179, `updateLogo` 197, `resetLogo` 216, `getBillingInfo` 222, `updateBillingInfo` 229, `getProfileInternal` 738, `getBillingInfoInternal` 742)
- Modify: `TenantSettingsFacade.java`, `TenantSettingsController.java`

**Interfaces:**
- Consumes: `TenantSettingsAccessGuard`, `AccessContext`, `TenantSettingsStore`, `TenantSettingDefaults`.
- Produces:

```java
package com.crm.platform.settings.application.usecase;

import com.crm.platform.settings.application.command.UpdateBillingInfoCommand;
import com.crm.platform.settings.application.command.UpdateTenantProfileCommand;
import com.crm.platform.settings.application.dto.BillingInfoDto;
import com.crm.platform.settings.application.dto.TenantProfileDto;

public interface TenantProfileFacade {

	TenantProfileDto getProfile();

	TenantProfileDto updateProfile(UpdateTenantProfileCommand command);

	TenantProfileDto updateLogo(String logoUrl);

	TenantProfileDto resetLogo();

	BillingInfoDto getBillingInfo();

	BillingInfoDto updateBillingInfo(UpdateBillingInfoCommand command);
}
```

Plus, on `TenantProfileApplicationService`, four package-private methods
consumed by Task 14:
`profileInternal(AccessContext) -> TenantProfileDto`,
`billingInfoInternal(AccessContext) -> BillingInfoDto`,
`updateProfileInternal(AccessContext, UpdateTenantProfileCommand) -> TenantProfileDto`,
`updateBillingInfoInternal(AccessContext, UpdateBillingInfoCommand) -> BillingInfoDto`.

- [ ] **Step 1: Create the facade interface** — code above.
- [ ] **Step 2: Create the service** — apply the shared shape, steps 2 through 4.
- [ ] **Step 3: Remove the six methods and two internal helpers from the god class and from `TenantSettingsFacade`.**
- [ ] **Step 4: Repoint `TenantSettingsController`** — inject `TenantProfileFacade` alongside the existing `TenantSettingsFacade` and use it for the six `/profile` endpoints.
- [ ] **Step 5: Verify** — shared shape, step 7. Expect `@Override` count to drop by 6.

---

### Task 8: Extract the localization concern

**Files:**
- Create: `application/usecase/TenantLocalizationFacade.java`
- Create: `application/service/TenantLocalizationApplicationService.java`
- Modify: `TenantSettingsApplicationService.java` (remove `getLocalization` 245, `updateLocalization` 252, `listCurrencies` 270, `addCurrency` 277, `updateCurrencyRate` 296, `deleteCurrency` 308, `getBusinessHours` 317, `updateBusinessHours` 324, `getLocalizationInternal` 746, `getBusinessHoursInternal` 750)
- Modify: `TenantSettingsFacade.java`, `TenantSettingsController.java`

**Interfaces:**
- Consumes: the same four collaborators as Task 7.
- Produces:

```java
public interface TenantLocalizationFacade {

	LocalizationSettingsDto getLocalization();

	LocalizationSettingsDto updateLocalization(UpdateLocalizationCommand command);

	List<CurrencyRateDto> listCurrencies();

	CurrencyRateDto addCurrency(UpdateCurrencyRateCommand command);

	CurrencyRateDto updateCurrencyRate(String currencyCode, UpdateCurrencyRateCommand command);

	void deleteCurrency(String currencyCode);

	BusinessHoursDto getBusinessHours();

	BusinessHoursDto updateBusinessHours(UpdateBusinessHoursCommand command);
}
```

Plus four package-private methods consumed by Task 14:
`localizationInternal(AccessContext) -> LocalizationSettingsDto`,
`businessHoursInternal(AccessContext) -> BusinessHoursDto`,
`updateLocalizationInternal(AccessContext, UpdateLocalizationCommand) -> LocalizationSettingsDto`,
`updateBusinessHoursInternal(AccessContext, UpdateBusinessHoursCommand) -> BusinessHoursDto`.

- [ ] **Step 1: Create the facade interface** — code above, with imports for `List`, the three commands, and the three DTOs.
- [ ] **Step 2: Create the service** — shared shape, steps 2 through 4.
- [ ] **Step 3: Remove the eight methods and two helpers from the god class and the facade.**
- [ ] **Step 4: Repoint `TenantSettingsController`** for `/localization`, `/currencies`, `/currencies/{currencyCode}`, `/business-hours`.
- [ ] **Step 5: Verify** — expect `@Override` count to drop by 8.

---

### Task 9: Extract the notification concern

**Files:**
- Create: `application/usecase/TenantNotificationFacade.java`
- Create: `application/service/TenantNotificationApplicationService.java`
- Modify: `TenantSettingsApplicationService.java` (remove `getNotificationSettings` 573, `updateNotificationSettings` 580, `testNotificationPing` 601, `getDigestSchedule` 608, `updateDigestSchedule` 615, `getNotificationSettingsInternal` 770, `getDigestScheduleInternal` 774)
- Modify: `TenantSettingsFacade.java`, `TenantSettingsController.java`

**Interfaces:**
- Produces:

```java
public interface TenantNotificationFacade {

	NotificationSettingsDto getNotificationSettings();

	NotificationSettingsDto updateNotificationSettings(UpdateNotificationGatewaysCommand command);

	boolean testNotificationPing(String channelType, String targetEndpoint);

	DigestScheduleDto getDigestSchedule();

	DigestScheduleDto updateDigestSchedule(UpdateDigestScheduleCommand command);
}
```

Plus four package-private methods consumed by Task 14:
`notificationSettingsInternal(AccessContext) -> NotificationSettingsDto`,
`digestScheduleInternal(AccessContext) -> DigestScheduleDto`,
`updateNotificationSettingsInternal(AccessContext, UpdateNotificationGatewaysCommand) -> NotificationSettingsDto`,
`updateDigestScheduleInternal(AccessContext, UpdateDigestScheduleCommand) -> DigestScheduleDto`.

- [ ] **Step 1: Create the facade interface** — code above.
- [ ] **Step 2: Create the service** — shared shape. `updateNotificationSettings` drops `command.smtpPassword()` on the floor; carry that behavior over unchanged and do not fix it here. See spec section 9.
- [ ] **Step 3: Remove the five methods and two helpers.**
- [ ] **Step 4: Repoint `TenantSettingsController`** for `/notifications`, `/notifications/test`, `/notifications/digest`.
- [ ] **Step 5: Verify** — expect `@Override` count to drop by 5.

---

### Task 10: Extract the document sequence concern

**Files:**
- Create: `application/usecase/DocumentSequenceFacade.java`
- Create: `application/service/DocumentSequenceApplicationService.java`
- Modify: `TenantSettingsApplicationService.java` (remove `listDocumentSequences` 632, `getDocumentSequence` 643, `updateDocumentSequence` 660, `resetDocumentSequence` 673, `toSequenceDto` 821)
- Modify: `TenantSettingsFacade.java`, `TenantSequenceSettingsController.java`

**Interfaces:**
- Consumes: `TenantSettingsAccessGuard`, `DocumentSequenceRepository`, `TimeProvider`, `TenantSettingDefaults`. This is the one concern that does not need `TenantSettingsStore` — sequences live in their own table.
- Produces:

```java
public interface DocumentSequenceFacade {

	List<DocumentSequenceDto> listDocumentSequences();

	DocumentSequenceDto getDocumentSequence(String entityType);

	DocumentSequenceDto updateDocumentSequence(String entityType, UpdateDocumentSequenceCommand command);

	DocumentSequenceDto resetDocumentSequence(String entityType, long newCounter);
}
```

No `*Internal` variants — the consolidated endpoint does not include sequences.

- [ ] **Step 1: Create the facade interface** — code above.
- [ ] **Step 2: Create the service.** Move `toSequenceDto` across as a private method. It hard-codes the literal `"202608"` in the preview string; carry it over verbatim. Fixing it is spec section 9 work, not this task's.
- [ ] **Step 3: Remove the four methods and the private helper.**
- [ ] **Step 4: Repoint `TenantSequenceSettingsController`** — this controller now depends on `DocumentSequenceFacade` alone, so drop `TenantSettingsFacade` from it entirely.
- [ ] **Step 5: Verify** — expect `@Override` count to drop by 4, and Check C on `toSequenceDto`.

---

### Task 11: Extract the storage concern

**Files:**
- Create: `application/usecase/TenantStorageFacade.java`
- Create: `application/service/TenantStorageApplicationService.java`
- Modify: `TenantSettingsApplicationService.java` (remove `getStorageUsage` 686, `triggerBackup` 707, `listBackupHistory` 722)
- Modify: `TenantSettingsFacade.java`, `TenantStorageSettingsController.java`

**Interfaces:**
- Consumes: `TenantSettingsAccessGuard`, `IdentifierGenerator`, `TimeProvider`.
- Produces:

```java
public interface TenantStorageFacade {

	StorageUsageDto getStorageUsage();

	BackupSnapshotDto triggerBackup();

	List<BackupSnapshotDto> listBackupHistory();
}
```

- [ ] **Step 1: Create the facade interface** — code above.
- [ ] **Step 2: Create the service.** All three method bodies return invented data. Move them verbatim; Task 15 adds the `PLACEHOLDER` Javadoc.
- [ ] **Step 3: Remove the three methods.**
- [ ] **Step 4: Repoint `TenantStorageSettingsController`** — it now depends on `TenantStorageFacade` alone.
- [ ] **Step 5: Verify** — expect `@Override` count to drop by 3.

---

### Task 12: Extract the automation concern and introduce the routing commands

The only concern task that also changes an application-layer signature, because
`addLeadRoutingRule` and `updateLeadRoutingRule` currently take a DTO.

**Files:**
- Create: `application/usecase/TenantAutomationFacade.java`
- Create: `application/service/TenantAutomationApplicationService.java`
- Create: `application/command/AddLeadRoutingRuleCommand.java`
- Create: `application/command/UpdateLeadRoutingRuleCommand.java`
- Modify: `TenantSettingsApplicationService.java` (remove `getAutomationSettings` 464, `updateAutomationSettings` 471, `listLeadRoutingRules` 490, `addLeadRoutingRule` 497, `updateLeadRoutingRule` 519, `deleteLeadRoutingRule` 541, `getAlertRules` 550, `updateAlertRules` 557, `getAutomationSettingsInternal` 762, `getAlertRulesInternal` 766)
- Modify: `TenantSettingsFacade.java`, `TenantAutomationSettingsController.java`, `TenantAutomationWebMapper.java`

**Interfaces:**
- Produces:

```java
package com.crm.platform.settings.application.command;

import java.util.UUID;

public record AddLeadRoutingRuleCommand(
		String ruleName,
		int priority,
		String conditionField,
		String conditionOperator,
		String conditionValue,
		UUID assignToUserId,
		UUID assignToTeamId,
		boolean active
) {}
```

```java
package com.crm.platform.settings.application.command;

import java.util.UUID;

public record UpdateLeadRoutingRuleCommand(
		UUID ruleId,
		String ruleName,
		int priority,
		String conditionField,
		String conditionOperator,
		String conditionValue,
		UUID assignToUserId,
		UUID assignToTeamId,
		boolean active
) {}
```

```java
public interface TenantAutomationFacade {

	AutomationSettingsDto getAutomationSettings();

	AutomationSettingsDto updateAutomationSettings(UpdateAutomationRulesCommand command);

	List<LeadRoutingRuleDto> listLeadRoutingRules();

	LeadRoutingRuleDto addLeadRoutingRule(AddLeadRoutingRuleCommand command);

	LeadRoutingRuleDto updateLeadRoutingRule(UUID ruleId, UpdateLeadRoutingRuleCommand command);

	void deleteLeadRoutingRule(UUID ruleId);

	AlertRulesDto getAlertRules();

	AlertRulesDto updateAlertRules(UpdateAlertRulesCommand command);
}
```

`updateLeadRoutingRule` keeps `ruleId` as both a parameter and a command
component. That is the module's existing idiom — `updateCurrencyRate(String
currencyCode, UpdateCurrencyRateCommand command)` does the same — so it is
consistent rather than redundant.

Plus four package-private methods consumed by Task 14:
`automationSettingsInternal(AccessContext) -> AutomationSettingsDto`,
`alertRulesInternal(AccessContext) -> AlertRulesDto`,
`updateAutomationSettingsInternal(AccessContext, UpdateAutomationRulesCommand) -> AutomationSettingsDto`,
`updateAlertRulesInternal(AccessContext, UpdateAlertRulesCommand) -> AlertRulesDto`.

- [ ] **Step 1: Create the two command records** — code above.
- [ ] **Step 2: Create the facade interface** — code above.
- [ ] **Step 3: Create the service.** In `addLeadRoutingRule`, the body currently reads fields off a `LeadRoutingRuleDto` parameter; change those reads to the command's accessors. The id is still generated inside the service via `identifierGenerator`, not taken from the command — `AddLeadRoutingRuleCommand` has no id component precisely so a client cannot choose one.
- [ ] **Step 4: Add the two builders to `TenantAutomationWebMapper`**

```java
	public AddLeadRoutingRuleCommand toAddCommand(AddLeadRoutingRuleRequest r) {
		return new AddLeadRoutingRuleCommand(
				r.ruleName(), r.priority(), r.conditionField(),
				r.conditionOperator(), r.conditionValue(),
				r.assignToUserId(), r.assignToTeamId(), r.active()
		);
	}

	public UpdateLeadRoutingRuleCommand toUpdateCommand(UUID ruleId, AddLeadRoutingRuleRequest r) {
		return new UpdateLeadRoutingRuleCommand(
				ruleId, r.ruleName(), r.priority(), r.conditionField(),
				r.conditionOperator(), r.conditionValue(),
				r.assignToUserId(), r.assignToTeamId(), r.active()
		);
	}
```

- [ ] **Step 5: Repoint `TenantAutomationSettingsController`.** Delete the inline `new LeadRoutingRuleDto(...)` blocks at lines 54–87 and call the mapper instead:

```java
	@PostMapping("/lead-routing/rules")
	public ResponseEntity<LeadRoutingRuleResponse> addLeadRoutingRule(
			@Valid @RequestBody AddLeadRoutingRuleRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(
				mapper.toResponse(facade.addLeadRoutingRule(mapper.toAddCommand(request))));
	}

	@PutMapping("/lead-routing/rules/{ruleId}")
	public ResponseEntity<LeadRoutingRuleResponse> updateLeadRoutingRule(
			@PathVariable UUID ruleId,
			@Valid @RequestBody AddLeadRoutingRuleRequest request) {
		return ResponseEntity.ok(mapper.toResponse(
				facade.updateLeadRoutingRule(ruleId, mapper.toUpdateCommand(ruleId, request))));
	}
```

The request type stays `AddLeadRoutingRuleRequest` for both endpoints — that is
what the controller uses today, and changing it would alter validation.

- [ ] **Step 6: Remove the eight methods and two helpers.** This controller now depends on `TenantAutomationFacade` alone.
- [ ] **Step 7: Verify** — expect `@Override` count to drop by 8. Then run Check C for `LeadRoutingRuleDto` against the controller: expected no hits, because the DTO no longer appears in `presentation/web` outside the mapper.

---

### Task 13: Extract the security concern

The largest concern, and the one whose permission requirements drive Task 14.

**Files:**
- Create: `application/usecase/TenantSecurityPolicyFacade.java`
- Create: `application/service/TenantSecurityPolicyApplicationService.java`
- Modify: `TenantSettingsApplicationService.java` (remove `getSecuritySettings` 340, `updateSecuritySettings` 347, `listIpWhitelistRules` 364, `addIpWhitelistRule` 380, `deleteIpWhitelistRule` 398, `listActiveSessions` 405, `revokeAllSessions` 425, `revokeSession` 432, `getPasswordPolicy` 439, `updatePasswordPolicy` 446, `getSecuritySettingsInternal` 754, `getPasswordPolicyInternal` 758)
- Modify: `TenantSettingsFacade.java`, `TenantSecuritySettingsController.java`

**Interfaces:**
- Consumes: `TenantSettingsAccessGuard`, `TenantSettingsStore`, `IpWhitelistRepository`, `IdentifierGenerator`, `TimeProvider`, `TenantSettingDefaults`.
- Produces:

```java
public interface TenantSecurityPolicyFacade {

	SecuritySettingsDto getSecuritySettings();

	SecuritySettingsDto updateSecuritySettings(UpdateSecurityPolicyCommand command);

	List<IpWhitelistRuleDto> listIpWhitelistRules();

	IpWhitelistRuleDto addIpWhitelistRule(AddIpWhitelistRuleCommand command);

	void deleteIpWhitelistRule(UUID ruleId);

	List<ActiveSessionDto> listActiveSessions();

	void revokeAllSessions();

	void revokeSession(UUID sessionId);

	PasswordPolicyDto getPasswordPolicy();

	PasswordPolicyDto updatePasswordPolicy(UpdatePasswordPolicyCommand command);
}
```

Plus four package-private methods consumed by Task 14:
`securitySettingsInternal(AccessContext) -> SecuritySettingsDto`,
`passwordPolicyInternal(AccessContext) -> PasswordPolicyDto`,
`updateSecuritySettingsInternal(AccessContext, UpdateSecurityPolicyCommand) -> SecuritySettingsDto`,
`updatePasswordPolicyInternal(AccessContext, UpdatePasswordPolicyCommand) -> PasswordPolicyDto`.

- [ ] **Step 1: Create the facade interface** — code above.
- [ ] **Step 2: Create the service.** Note that every method here requires `PLATFORM_SECURITY_MANAGE`, including the read methods — that is existing behavior and Task 14 depends on it being preserved exactly.
- [ ] **Step 3: Remove the ten methods and two helpers.**
- [ ] **Step 4: Repoint `TenantSecuritySettingsController`** — it now depends on `TenantSecurityPolicyFacade` alone.
- [ ] **Step 5: Verify** — expect `@Override` count to drop by 10. At this point only `getConsolidatedSettings` and `patchConsolidatedSettings` should remain in `TenantSettingsApplicationService`.

---

### Task 14: Build the overview facade and delete the god class

Carries the second of the two intentional behavior changes.

**Files:**
- Create: `application/usecase/TenantSettingsOverviewFacade.java`
- Create: `application/service/TenantSettingsOverviewApplicationService.java`
- Delete: `application/usecase/TenantSettingsFacade.java`
- Delete: `application/service/TenantSettingsApplicationService.java`
- Modify: `TenantSettingsController.java`

**Interfaces:**
- Consumes: the `*Internal` methods from Tasks 7, 8, 9, 12, 13.
- Produces:

```java
public interface TenantSettingsOverviewFacade {

	ConsolidatedTenantSettingsDto getConsolidatedSettings();

	ConsolidatedTenantSettingsDto patchConsolidatedSettings(PatchConsolidatedSettingsCommand command);
}
```

- [ ] **Step 1: Create the facade interface** — code above.

- [ ] **Step 2: Create the service, injecting the five concern service classes**

Inject the concrete classes, not the facade interfaces — the `*Internal` methods
are package-private and not on the interfaces:

```java
@Service
public class TenantSettingsOverviewApplicationService implements TenantSettingsOverviewFacade {

	private final TenantSettingsAccessGuard accessGuard;
	private final TenantProfileApplicationService profileService;
	private final TenantLocalizationApplicationService localizationService;
	private final TenantSecurityPolicyApplicationService securityService;
	private final TenantAutomationApplicationService automationService;
	private final TenantNotificationApplicationService notificationService;
	private final TimeProvider timeProvider;

	// constructor assigning all seven
}
```

- [ ] **Step 3: Implement the read side**

```java
	@Override
	@Transactional(readOnly = true)
	public ConsolidatedTenantSettingsDto getConsolidatedSettings() {
		AccessContext ctx = accessGuard.require(SystemPermission.PLATFORM_SETTINGS_READ);
		return new ConsolidatedTenantSettingsDto(
				ctx.tenantId().value(),
				"ACME_CORP",
				profileService.profileInternal(ctx),
				profileService.billingInfoInternal(ctx),
				localizationService.localizationInternal(ctx),
				localizationService.businessHoursInternal(ctx),
				securityService.securitySettingsInternal(ctx),
				securityService.passwordPolicyInternal(ctx),
				automationService.automationSettingsInternal(ctx),
				automationService.alertRulesInternal(ctx),
				notificationService.notificationSettingsInternal(ctx),
				notificationService.digestScheduleInternal(ctx),
				// version and updatedAt: copy the exact expressions from
				// TenantSettingsApplicationService.getConsolidatedSettings, lines 102-133
		);
	}
```

The literal `"ACME_CORP"` is carried over unchanged. It is a placeholder and
Task 15 marks it, but changing it here would be a third behavior change.

Read the remaining two arguments off the original method rather than inventing
them — the original is the only source of truth for how `version` and
`updatedAt` are derived.

Note that `getConsolidatedSettings` authorizes only `PLATFORM_SETTINGS_READ`,
while `securitySettingsInternal` would have required `PLATFORM_SECURITY_MANAGE`
had it been called through its public facade method. Reading security settings
through the consolidated endpoint under a weaker permission is existing
behavior — the current code does exactly this by calling
`getSecuritySettingsInternal` directly. Preserve it. Tightening it would be a
third behavior change and would break the settings page for any role that can
read settings but not manage security.

- [ ] **Step 4: Implement the write side with the permission union**

```java
	@Override
	@Transactional
	public ConsolidatedTenantSettingsDto patchConsolidatedSettings(PatchConsolidatedSettingsCommand command) {
		AccessContext ctx = requiresSecurityManage(command)
				? accessGuard.requireAll(
						SystemPermission.PLATFORM_SETTINGS_MANAGE,
						SystemPermission.PLATFORM_SECURITY_MANAGE)
				: accessGuard.require(SystemPermission.PLATFORM_SETTINGS_MANAGE);

		if (command.profile() != null) {
			profileService.updateProfileInternal(ctx, command.profile());
		}
		if (command.billingInfo() != null) {
			profileService.updateBillingInfoInternal(ctx, command.billingInfo());
		}
		if (command.localization() != null) {
			localizationService.updateLocalizationInternal(ctx, command.localization());
		}
		if (command.businessHours() != null) {
			localizationService.updateBusinessHoursInternal(ctx, command.businessHours());
		}
		if (command.security() != null) {
			securityService.updateSecuritySettingsInternal(ctx, command.security());
		}
		if (command.passwordPolicy() != null) {
			securityService.updatePasswordPolicyInternal(ctx, command.passwordPolicy());
		}
		if (command.automation() != null) {
			automationService.updateAutomationSettingsInternal(ctx, command.automation());
		}
		if (command.alertRules() != null) {
			automationService.updateAlertRulesInternal(ctx, command.alertRules());
		}
		if (command.notifications() != null) {
			notificationService.updateNotificationSettingsInternal(ctx, command.notifications());
		}
		if (command.digest() != null) {
			notificationService.updateDigestScheduleInternal(ctx, command.digest());
		}
		return getConsolidatedSettings();
	}

	private static boolean requiresSecurityManage(PatchConsolidatedSettingsCommand command) {
		return command.security() != null || command.passwordPolicy() != null;
	}
```

This is the behavior change: a caller lacking `PLATFORM_SECURITY_MANAGE` who
submits a `security` or `passwordPolicy` block is now rejected before any write,
rather than after writes that then roll back. The status stays 403 and the body
shape is unchanged.

The `*Internal` write methods needed here — `updateProfileInternal`,
`updateBillingInfoInternal`, `updateLocalizationInternal`,
`updateBusinessHoursInternal`, `updateSecuritySettingsInternal`,
`updatePasswordPolicyInternal`, `updateAutomationSettingsInternal`,
`updateAlertRulesInternal`, `updateNotificationSettingsInternal`,
`updateDigestScheduleInternal` — are the ones Tasks 7 through 13 create in their
step 4. If any is missing, add it there rather than inlining logic here.

- [ ] **Step 5: Repoint the controller and delete the god class**

`TenantSettingsController` now injects `TenantSettingsOverviewFacade`,
`TenantProfileFacade`, `TenantLocalizationFacade`, and
`TenantNotificationFacade` — four facades plus `TenantSettingsWebMapper`. Then
delete `TenantSettingsFacade.java` and `TenantSettingsApplicationService.java`.

- [ ] **Step 6: Verify**

```bash
grep -rn "TenantSettingsFacade\|TenantSettingsApplicationService" crm/src/main/java/com/crm --include=*.java
ls crm/src/main/java/com/crm/platform/settings/application/usecase/ | wc -l
ls crm/src/main/java/com/crm/platform/settings/application/service/*.java | wc -l
```

Expected: no hits; `8` facades; `11` files in `application/service` (8 services
plus `AccessContext`, `TenantSettingsAccessGuard`, `TenantSettingDefaults`).

Then confirm no service exceeds roughly 200 lines:

```bash
wc -l crm/src/main/java/com/crm/platform/settings/application/service/*.java
```

---

### Task 15: Mark the placeholder endpoints

**Files:**
- Modify: `application/usecase/TenantStorageFacade.java`
- Modify: `application/usecase/TenantSecurityPolicyFacade.java`
- Modify: `application/usecase/TenantNotificationFacade.java`
- Modify: `application/usecase/TenantSettingsOverviewFacade.java`
- Modify: `docs/api-reference.md`

**Interfaces:**
- Consumes: all eight facades.
- Produces: no new symbols.

- [ ] **Step 1: Add `PLACEHOLDER` Javadoc to each of the eight items**

One block per method, naming what real source it must eventually read from:

```java
	/**
	 * PLACEHOLDER — returns fabricated data, not a real measurement.
	 * A real implementation must read database size from
	 * pg_total_relation_size over the tenant's rows, and attachment size
	 * from the attachment store. Do not present these figures to a customer
	 * as real usage.
	 */
	StorageUsageDto getStorageUsage();
```

The eight items are `getStorageUsage`, `triggerBackup`, `listBackupHistory`
(storage); `listActiveSessions`, `revokeAllSessions`, `revokeSession`
(security — the latter two have empty bodies and do nothing);
`testNotificationPing` (notification, always returns `true`); and the
`"ACME_CORP"` literal inside `getConsolidatedSettings`, which gets an inline
comment rather than Javadoc since it is one argument, not a method.

- [ ] **Step 2: Add the warning lines to `docs/api-reference.md`**

The settings endpoints are documented from line 232 onward. Add a warning to the
rows for `GET /api/platform/settings/storage/usage`,
`POST /api/platform/settings/backup/trigger`,
`GET /api/platform/settings/backup/history`,
`GET /api/platform/settings/security/active-sessions`,
`POST /api/platform/settings/security/sessions/revoke-all`,
`POST /api/platform/settings/security/sessions/{sessionId}/revoke`, and
`POST /api/platform/settings/notifications/test`.

Match the file's existing formatting. Read the surrounding rows first and follow
whatever convention is already there for caveats; if there is none, add a
prose note beneath the endpoint table rather than a new column, since adding a
column would reflow every row.

Also note against `GET /api/platform/settings` that `tenantCode` is a fixed
placeholder value.

- [ ] **Step 3: Verify**

```bash
grep -c "PLACEHOLDER" crm/src/main/java/com/crm/platform/settings/application/usecase/*.java
grep -n "placeholder\|Placeholder\|PLACEHOLDER" docs/api-reference.md | head -20
```

Expected: 7 Javadoc blocks across the facades, plus 8 documentation notes.

---

### Task 16: Final contract verification

The only task whose deliverable is a report rather than code. It exists because
tests and builds are both unavailable, so the contract guarantee rests entirely
on this pass.

**Files:**
- Read only. No modifications.

**Interfaces:**
- Consumes: everything.
- Produces: a written report for the user.

- [ ] **Step 1: Field-by-field parity, all 18 records**

For each response record, produce a three-column comparison — response
component, DTO component, TypeScript property — and confirm all three agree on
name and order. Flag any row where they do not.

- [ ] **Step 2: Endpoint inventory**

For all 46 endpoints, confirm the URL, HTTP method, success status code, and
required permission are unchanged from the pre-refactor controllers. Use
`docs/api-reference.md` as the expected values, since it was written against the
original implementation and is not modified by this refactor except for the
placeholder notes.

- [ ] **Step 3: Layering assertions**

```bash
grep -rn "application\.dto" crm/src/main/java/com/crm/platform/settings/presentation/web/*Controller.java
grep -rn "ObjectMapper" crm/src/main/java/com/crm/platform/settings/application/
grep -rn "presentation\.web\.request" crm/src/main/java/com/crm
```

Expected: all three return nothing.

- [ ] **Step 4: Frontend untouched**

```bash
git status --porcelain crm-fe/
```

Expected: no settings-related file appears. The spec's whole contract-stability
argument is that the frontend needs no change; a modified frontend file here
means something went wrong.

- [ ] **Step 5: Report**

State plainly which checks passed, which were skipped, and that no test or build
was run because `AGENTS.md` forbids it. Do not describe the refactor as
"verified working" — it has been verified consistent, which is a weaker and more
honest claim.
