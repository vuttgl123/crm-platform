package com.crm.customer.accountaddress.infrastructure.persistence;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountaddress.application.port.AccountAddressRepository;
import com.crm.customer.accountaddress.application.query.AccountAddressSearchQuery;
import com.crm.customer.accountaddress.domain.AccountAddress;
import com.crm.customer.accountaddress.domain.AccountAddressId;
import com.crm.customer.accountaddress.domain.AccountAddressType;
import com.crm.customer.infrastructure.persistence.AccountScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcAccountAddressRepository implements AccountAddressRepository {

	private static final String ADDRESS_PROJECTION = """
			SELECT ad.tenant_id, ad.id, aa.account_id,
			       ad.address_line_1, ad.address_line_2,
			       ad.locality, ad.administrative_area, ad.postal_code,
			       ad.country_code, ad.latitude, ad.longitude,
			       ad.formatted_address, ad.validation_status,
			       aa.address_type, aa.is_primary, aa.valid_from, aa.valid_to,
			       ad.created_at, ad.created_by,
			       ad.updated_at, ad.updated_by, ad.version
			""";

	private static final String SCOPED_ADDRESS_FROM = """
			FROM crm_account_addresses aa
			JOIN crm_addresses ad
			  ON ad.tenant_id = aa.tenant_id
			 AND ad.id = aa.address_id
			 AND ad.deleted_at IS NULL
			JOIN crm_accounts a
			  ON a.tenant_id = aa.tenant_id
			 AND a.id = aa.account_id
			 AND a.deleted_at IS NULL
			""";

	private final JdbcClient jdbcClient;

	public JdbcAccountAddressRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public boolean accountAccessible(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		return jdbcClient.sql(scope.cte() + """
				SELECT a.id
				FROM crm_accounts a
				WHERE a.tenant_id = :tenantId
				  AND a.id = :accountId
				  AND a.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("a")))
				.params(accountParameters(scope, tenantId, accountId))
				.query(String.class)
				.optional()
				.isPresent();
	}

	@Override
	public boolean lockAccount(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		String sql = scope.cte() + """
				SELECT a.id
				FROM crm_accounts a
				WHERE a.tenant_id = :tenantId
				  AND a.id = :accountId
				  AND a.deleted_at IS NULL
				  AND (%s)
				FOR UPDATE
				""".formatted(scope.predicate("a"));
		return jdbcClient.sql(sql)
				.params(accountParameters(scope, tenantId, accountId))
				.query(String.class)
				.optional()
				.isPresent();
	}

	@Override
	public Optional<AccountAddress> findById(TenantId tenantId,
			AccountId accountId, AccountAddressId addressId, ActorId actorId,
			AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = accountParameters(scope, tenantId,
				accountId);
		parameters.put("addressId", addressId.toString());
		String sql = scope.cte() + ADDRESS_PROJECTION + SCOPED_ADDRESS_FROM + """
				WHERE aa.tenant_id = :tenantId
				  AND aa.account_id = :accountId
				  AND aa.address_id = :addressId
				  AND (%s)
				""".formatted(scope.predicate("a"));
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(AccountAddressJdbcMapper::mapAddress)
				.optional();
	}

	@Override
	public List<AccountAddress> findAll(TenantId tenantId, ActorId actorId,
			AccountAddressSearchQuery query, LocalDate currentDate,
			AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = accountParameters(scope, tenantId,
				query.accountId());
		parameters.put("currentDate", currentDate);
		String typeFilter = query.addressType() == null
				? ""
				: "  AND aa.address_type = :addressType\n";
		if (query.addressType() != null) {
			parameters.put("addressType", query.addressType().name());
		}
		String currentFilter = query.includeHistory()
				? ""
				: "  AND (aa.valid_from IS NULL OR aa.valid_from <= :currentDate)\n"
						+ "  AND aa.valid_to IS NULL\n";
		String sql = scope.cte() + ADDRESS_PROJECTION + SCOPED_ADDRESS_FROM + """
				WHERE aa.tenant_id = :tenantId
				  AND aa.account_id = :accountId
				  AND (%s)
				""".formatted(scope.predicate("a")) + typeFilter + currentFilter + """
				ORDER BY aa.address_type ASC,
				         CASE
				           WHEN (aa.valid_from IS NULL OR aa.valid_from <= :currentDate)
				                AND aa.valid_to IS NULL THEN 0
				           ELSE 1
				         END ASC,
				         aa.is_primary DESC,
				         (aa.valid_from IS NULL) ASC,
				         aa.valid_from DESC,
				         ad.created_at ASC,
				         ad.id ASC
				""";
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(AccountAddressJdbcMapper::mapAddress)
				.list();
	}

	@Override
	public Optional<AccountAddress> findCurrentPrimary(TenantId tenantId,
			AccountId accountId, AccountAddressType addressType,
			AccountAddressId excludedAddressId, LocalDate currentDate,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = accountParameters(scope, tenantId,
				accountId);
		parameters.put("addressType", addressType.name());
		parameters.put("currentDate", currentDate);
		String excludedAddressFilter = "";
		if (excludedAddressId != null) {
			excludedAddressFilter = "  AND aa.address_id <> :excludedAddressId\n";
			parameters.put("excludedAddressId", excludedAddressId.toString());
		}
		String sql = scope.cte() + ADDRESS_PROJECTION + SCOPED_ADDRESS_FROM + """
				WHERE aa.tenant_id = :tenantId
				  AND aa.account_id = :accountId
				  AND aa.address_type = :addressType
				  AND aa.is_primary = true
				  AND (aa.valid_from IS NULL OR aa.valid_from <= :currentDate)
				  AND aa.valid_to IS NULL
				""" + excludedAddressFilter + """
				  AND (%s)
				""".formatted(scope.predicate("a"));
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(AccountAddressJdbcMapper::mapAddress)
				.optional();
	}

	@Override
	public void insert(AccountAddress address) {
		int addressAffectedRows = jdbcClient.sql("""
				INSERT INTO crm_addresses (
				  tenant_id, id, address_line_1, address_line_2,
				  locality, administrative_area, postal_code, country_code,
				  latitude, longitude, formatted_address, validation_status,
				  created_at, updated_at, created_by, updated_by, version
				) VALUES (
				  :tenantId, :addressId, :addressLine1, :addressLine2,
				  :locality, :administrativeArea, :postalCode, :countryCode,
				  :latitude, :longitude, :formattedAddress, :validationStatus,
				  :createdAt, :updatedAt, :createdBy, :updatedBy, :version
				)
				""")
				.params(addressInsertParameters(address))
				.update();
		if (addressAffectedRows != 1) {
			throw new IllegalStateException(
					"Account address content insert must affect exactly one row");
		}

		int associationAffectedRows = jdbcClient.sql("""
				INSERT INTO crm_account_addresses (
				  tenant_id, account_id, address_id, address_type,
				  is_primary, valid_from, valid_to, created_at, created_by
				) VALUES (
				  :tenantId, :accountId, :addressId, :addressType,
				  :isPrimary, :validFrom, NULL, :createdAt, :createdBy
				)
				""")
				.params(associationInsertParameters(address))
				.update();
		if (associationAffectedRows != 1) {
			throw new IllegalStateException(
					"Account address association insert must affect exactly one row");
		}
	}

	@Override
	public int update(AccountAddress address,
			AccountAddressType persistedAddressType, long expectedVersion,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = mutationParameters(scope, address,
				persistedAddressType, expectedVersion);
		int addressAffectedRows = jdbcClient.sql(scope.cte() + """
				UPDATE crm_addresses ad
				JOIN crm_account_addresses aa
				  ON aa.tenant_id = ad.tenant_id
				 AND aa.address_id = ad.id
				JOIN crm_accounts a
				  ON a.tenant_id = aa.tenant_id
				 AND a.id = aa.account_id
				 AND a.deleted_at IS NULL
				SET ad.address_line_1 = :addressLine1,
				    ad.address_line_2 = :addressLine2,
				    ad.locality = :locality,
				    ad.administrative_area = :administrativeArea,
				    ad.postal_code = :postalCode,
				    ad.country_code = :countryCode,
				    ad.latitude = :latitude,
				    ad.longitude = :longitude,
				    ad.formatted_address = :formattedAddress,
				    ad.updated_by = :updatedBy
				WHERE ad.tenant_id = :tenantId
				  AND ad.id = :addressId
				  AND ad.deleted_at IS NULL
				  AND ad.version = :expectedVersion
				  AND aa.account_id = :accountId
				  AND aa.address_type = :persistedAddressType
				  AND (%s)
				""".formatted(scope.predicate("a")))
				.params(parameters)
				.update();
		if (addressAffectedRows == 0) {
			return 0;
		}
		if (addressAffectedRows != 1) {
			throw new IllegalStateException(
					"Account address content update must affect exactly one row");
		}

		int associationAffectedRows = jdbcClient.sql(scope.cte() + """
				UPDATE crm_account_addresses aa
				JOIN crm_accounts a
				  ON a.tenant_id = aa.tenant_id
				 AND a.id = aa.account_id
				 AND a.deleted_at IS NULL
				JOIN crm_addresses ad
				  ON ad.tenant_id = aa.tenant_id
				 AND ad.id = aa.address_id
				 AND ad.deleted_at IS NULL
				SET aa.address_type = :addressType,
				    aa.is_primary = :isPrimary,
				    aa.valid_from = :validFrom,
				    aa.valid_to = :validTo
				WHERE aa.tenant_id = :tenantId
				  AND aa.account_id = :accountId
				  AND aa.address_id = :addressId
				  AND aa.address_type = :persistedAddressType
				  AND (%s)
				""".formatted(scope.predicate("a")))
				.params(parameters)
				.update();
		if (associationAffectedRows != 1) {
			throw new IllegalStateException(
					"Account address association update must affect exactly one row");
		}
		return associationAffectedRows;
	}

	private static Map<String, Object> accountParameters(AccountScopeSql scope,
			TenantId tenantId, AccountId accountId) {
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("accountId", accountId.toString());
		return parameters;
	}

	private static Map<String, Object> addressInsertParameters(
			AccountAddress address) {
		Map<String, Object> parameters = addressContentParameters(address);
		parameters.put("validationStatus", address.validationStatus().name());
		parameters.put("createdAt",
				AccountAddressJdbcMapper.timestamp(address.createdAt()));
		parameters.put("updatedAt",
				AccountAddressJdbcMapper.timestamp(address.updatedAt()));
		parameters.put("createdBy", actorId(address.createdBy()));
		parameters.put("version", address.version());
		return parameters;
	}

	private static Map<String, Object> associationInsertParameters(
			AccountAddress address) {
		Map<String, Object> parameters = associationParameters(address);
		parameters.put("createdAt",
				AccountAddressJdbcMapper.timestamp(address.createdAt()));
		parameters.put("createdBy", actorId(address.createdBy()));
		return parameters;
	}

	private static Map<String, Object> mutationParameters(AccountScopeSql scope,
			AccountAddress address, AccountAddressType persistedAddressType,
			long expectedVersion) {
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.putAll(addressContentParameters(address));
		parameters.putAll(associationParameters(address));
		parameters.put("persistedAddressType", persistedAddressType.name());
		parameters.put("expectedVersion", expectedVersion);
		return parameters;
	}

	private static Map<String, Object> addressContentParameters(
			AccountAddress address) {
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", address.tenantId().toString());
		parameters.put("accountId", address.accountId().toString());
		parameters.put("addressId", address.id().toString());
		parameters.put("addressLine1", address.addressLine1());
		parameters.put("addressLine2", address.addressLine2());
		parameters.put("locality", address.locality());
		parameters.put("administrativeArea", address.administrativeArea());
		parameters.put("postalCode", address.postalCode());
		parameters.put("countryCode", address.countryCode());
		parameters.put("latitude", address.latitude());
		parameters.put("longitude", address.longitude());
		parameters.put("formattedAddress", address.formattedAddress());
		parameters.put("updatedBy", actorId(address.updatedBy()));
		return parameters;
	}

	private static Map<String, Object> associationParameters(
			AccountAddress address) {
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", address.tenantId().toString());
		parameters.put("accountId", address.accountId().toString());
		parameters.put("addressId", address.id().toString());
		parameters.put("addressType", address.addressType().name());
		parameters.put("isPrimary", address.isPrimary());
		parameters.put("validFrom", address.validFrom());
		parameters.put("validTo", address.validTo());
		return parameters;
	}

	private static String actorId(ActorId value) {
		return value == null ? null : value.toString();
	}

}
