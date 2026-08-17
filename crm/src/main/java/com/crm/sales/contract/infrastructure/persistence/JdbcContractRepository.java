package com.crm.sales.contract.infrastructure.persistence;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.crm.sales.contract.application.dto.ContractSummary;
import com.crm.sales.contract.application.port.ContractRepository;
import com.crm.sales.contract.application.query.ContractSearchQuery;
import com.crm.sales.contract.domain.Contract;
import com.crm.sales.contract.domain.ContractId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcContractRepository implements ContractRepository {

	private static final String CONTRACT_SELECT = """
			SELECT c.tenant_id, c.id, c.contract_number, c.account_id, c.contact_id,
			       c.opportunity_id, c.quote_id, c.order_id, c.owner_user_id,
			       c.contract_type, c.status, c.currency_code, c.contract_value,
			       c.effective_from, c.effective_to, c.auto_renew, c.renewal_notice_days,
			       c.signed_at, c.terminated_at, c.termination_reason, c.document_reference,
			       c.terms_snapshot, c.created_at, c.updated_at, c.created_by, c.updated_by, c.version
			FROM sales.contracts c
			""";

	private static final String SUMMARY_SELECT = """
			SELECT c.id, c.contract_number, c.account_id, a.name AS account_name,
			       c.contact_id,
			       NULLIF(TRIM(CONCAT(ct.first_name, ' ', ct.last_name)), '') AS contact_name,
			       c.contract_type, c.status, c.currency_code, c.contract_value,
			       c.effective_from, c.effective_to, c.auto_renew, c.signed_at,
			       c.updated_at, c.version
			FROM sales.contracts c
			JOIN crm.accounts a ON a.tenant_id = c.tenant_id AND a.id = c.account_id
			LEFT JOIN crm.contacts ct ON ct.tenant_id = c.tenant_id AND ct.id = c.contact_id
			""";

	private final JdbcClient jdbcClient;

	public JdbcContractRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Contract> findById(TenantId tenantId, ContractId id) {
		String sql = CONTRACT_SELECT + """
				WHERE c.tenant_id = :tenantId
				  AND c.id = :id
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(ContractJdbcMapper::mapContract)
				.optional();
	}

	@Override
	public Optional<Contract> findByContractNumber(TenantId tenantId, String contractNumber) {
		String sql = CONTRACT_SELECT + """
				WHERE c.tenant_id = :tenantId
				  AND c.contract_number = :contractNumber
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("contractNumber", contractNumber)
				.query(ContractJdbcMapper::mapContract)
				.optional();
	}

	@Override
	public boolean existsByContractNumber(TenantId tenantId, String contractNumber) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM sales.contracts c
				WHERE c.tenant_id = :tenantId
				  AND c.contract_number = :contractNumber
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("contractNumber", contractNumber)
				.query(Boolean.class)
				.single());
	}

	@Override
	public PageResult<ContractSummary> search(TenantId tenantId, ContractSearchQuery query) {
		PageQuery page = query.page() != null ? query.page() : PageQuery.defaultPage();
		Map<String, Object> params = new HashMap<>();
		params.put("tenantId", tenantId.value());

		StringBuilder whereClause = new StringBuilder(" WHERE c.tenant_id = :tenantId ");

		if (query.search() != null && !query.search().isBlank()) {
			params.put("search", "%" + query.search().trim().toLowerCase() + "%");
			whereClause.append(" AND (LOWER(c.contract_number) LIKE :search OR LOWER(a.name) LIKE :search OR LOWER(COALESCE(c.document_reference, '')) LIKE :search) ");
		}
		if (query.accountId() != null) {
			params.put("accountId", query.accountId());
			whereClause.append(" AND c.account_id = :accountId ");
		}
		if (query.status() != null) {
			params.put("status", query.status().name());
			whereClause.append(" AND c.status = :status ");
		}
		if (query.contractType() != null) {
			params.put("contractType", query.contractType().name());
			whereClause.append(" AND c.contract_type = :contractType ");
		}
		if (query.effectiveFrom() != null) {
			params.put("effectiveFrom", Date.valueOf(query.effectiveFrom()));
			whereClause.append(" AND c.effective_from >= :effectiveFrom ");
		}
		if (query.effectiveTo() != null) {
			params.put("effectiveTo", Date.valueOf(query.effectiveTo()));
			whereClause.append(" AND c.effective_to <= :effectiveTo ");
		}

		String countSql = "SELECT COUNT(*) FROM sales.contracts c JOIN crm.accounts a ON a.tenant_id = c.tenant_id AND a.id = c.account_id " + whereClause;
		Long totalElements = jdbcClient.sql(countSql)
				.params(params)
				.query(Long.class)
				.single();
		long total = totalElements != null ? totalElements : 0L;

		params.put("limit", page.size());
		params.put("offset", page.offset());

		String dataSql = SUMMARY_SELECT + whereClause + " ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset";
		List<ContractSummary> content = jdbcClient.sql(dataSql)
				.params(params)
				.query(ContractJdbcMapper::mapSummary)
				.list();

		return PageResult.of(content, total, page);
	}

	@Override
	public void insert(Contract contract) {
		String sql = """
				INSERT INTO sales.contracts (
				    tenant_id, id, contract_number, account_id, contact_id,
				    opportunity_id, quote_id, order_id, owner_user_id,
				    contract_type, status, currency_code, contract_value,
				    effective_from, effective_to, auto_renew, renewal_notice_days,
				    signed_at, terminated_at, termination_reason, document_reference,
				    terms_snapshot, created_at, updated_at, created_by, updated_by, version
				) VALUES (
				    :tenantId, :id, :contractNumber, :accountId, :contactId,
				    :opportunityId, :quoteId, :orderId, :ownerUserId,
				    :contractType, :status, :currencyCode, :contractValue,
				    :effectiveFrom, :effectiveTo, :autoRenew, :renewalNoticeDays,
				    :signedAt, :terminatedAt, :terminationReason, :documentReference,
				    :termsSnapshot::jsonb, :createdAt, :updatedAt, :createdBy, :updatedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", contract.tenantId().value())
				.param("id", contract.id().value())
				.param("contractNumber", contract.contractNumber())
				.param("accountId", contract.accountId().value())
				.param("contactId", contract.contactId() != null ? contract.contactId().value() : null)
				.param("opportunityId", contract.opportunityId() != null ? contract.opportunityId().value() : null)
				.param("quoteId", contract.quoteId() != null ? contract.quoteId().value() : null)
				.param("orderId", contract.orderId() != null ? contract.orderId().value() : null)
				.param("ownerUserId", contract.ownerUserId() != null ? contract.ownerUserId().value() : null)
				.param("contractType", contract.contractType().name())
				.param("status", contract.status().name())
				.param("currencyCode", contract.currencyCode())
				.param("contractValue", contract.contractValue())
				.param("effectiveFrom", contract.effectiveFrom() != null ? Date.valueOf(contract.effectiveFrom()) : null)
				.param("effectiveTo", contract.effectiveTo() != null ? Date.valueOf(contract.effectiveTo()) : null)
				.param("autoRenew", contract.autoRenew())
				.param("renewalNoticeDays", contract.renewalNoticeDays())
				.param("signedAt", contract.signedAt() != null ? Timestamp.from(contract.signedAt()) : null)
				.param("terminatedAt", contract.terminatedAt() != null ? Timestamp.from(contract.terminatedAt()) : null)
				.param("terminationReason", contract.terminationReason())
				.param("documentReference", contract.documentReference())
				.param("termsSnapshot", contract.termsSnapshot())
				.param("createdAt", Timestamp.from(contract.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(contract.auditInfo().updatedAt()))
				.param("createdBy", contract.auditInfo().createdBy() != null ? contract.auditInfo().createdBy().value() : null)
				.param("updatedBy", contract.auditInfo().updatedBy() != null ? contract.auditInfo().updatedBy().value() : null)
				.param("version", contract.version())
				.update();
	}

	@Override
	public void update(Contract contract) {
		String sql = """
				UPDATE sales.contracts
				SET account_id = :accountId,
				    contact_id = :contactId,
				    opportunity_id = :opportunityId,
				    quote_id = :quoteId,
				    order_id = :orderId,
				    owner_user_id = :ownerUserId,
				    contract_type = :contractType,
				    status = :status,
				    currency_code = :currencyCode,
				    contract_value = :contractValue,
				    effective_from = :effectiveFrom,
				    effective_to = :effectiveTo,
				    auto_renew = :autoRenew,
				    renewal_notice_days = :renewalNoticeDays,
				    signed_at = :signedAt,
				    terminated_at = :terminatedAt,
				    termination_reason = :terminationReason,
				    document_reference = :documentReference,
				    terms_snapshot = :termsSnapshot::jsonb,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", contract.tenantId().value())
				.param("id", contract.id().value())
				.param("accountId", contract.accountId().value())
				.param("contactId", contract.contactId() != null ? contract.contactId().value() : null)
				.param("opportunityId", contract.opportunityId() != null ? contract.opportunityId().value() : null)
				.param("quoteId", contract.quoteId() != null ? contract.quoteId().value() : null)
				.param("orderId", contract.orderId() != null ? contract.orderId().value() : null)
				.param("ownerUserId", contract.ownerUserId() != null ? contract.ownerUserId().value() : null)
				.param("contractType", contract.contractType().name())
				.param("status", contract.status().name())
				.param("currencyCode", contract.currencyCode())
				.param("contractValue", contract.contractValue())
				.param("effectiveFrom", contract.effectiveFrom() != null ? Date.valueOf(contract.effectiveFrom()) : null)
				.param("effectiveTo", contract.effectiveTo() != null ? Date.valueOf(contract.effectiveTo()) : null)
				.param("autoRenew", contract.autoRenew())
				.param("renewalNoticeDays", contract.renewalNoticeDays())
				.param("signedAt", contract.signedAt() != null ? Timestamp.from(contract.signedAt()) : null)
				.param("terminatedAt", contract.terminatedAt() != null ? Timestamp.from(contract.terminatedAt()) : null)
				.param("terminationReason", contract.terminationReason())
				.param("documentReference", contract.documentReference())
				.param("termsSnapshot", contract.termsSnapshot())
				.param("updatedAt", Timestamp.from(contract.auditInfo().updatedAt()))
				.param("updatedBy", contract.auditInfo().updatedBy() != null ? contract.auditInfo().updatedBy().value() : null)
				.param("newVersion", contract.version())
				.param("expectedVersion", contract.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("Contract update failed due to version mismatch");
		}
	}

	@Override
	public void delete(TenantId tenantId, ContractId id, long version) {
		String sql = """
				DELETE FROM sales.contracts
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :version
				""";
		int deleted = jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.param("version", version)
				.update();
		if (deleted == 0) {
			throw new IllegalStateException("Contract delete failed due to version mismatch");
		}
	}

}
