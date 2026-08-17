package com.crm.sales.contract.infrastructure.persistence;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.sales.contract.application.dto.ContractSummary;
import com.crm.sales.contract.domain.Contract;
import com.crm.sales.contract.domain.ContractId;
import com.crm.sales.contract.domain.ContractStatus;
import com.crm.sales.contract.domain.ContractType;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class ContractJdbcMapper {

	private ContractJdbcMapper() {
	}

	public static Contract mapContract(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		ContractId id = ContractId.from(rs.getObject("id", UUID.class));
		String contractNumber = rs.getString("contract_number");
		AccountId accountId = AccountId.from(rs.getObject("account_id", UUID.class));

		UUID contactUuid = rs.getObject("contact_id", UUID.class);
		ContactId contactId = contactUuid != null ? ContactId.from(contactUuid) : null;

		UUID oppUuid = rs.getObject("opportunity_id", UUID.class);
		OpportunityId opportunityId = oppUuid != null ? OpportunityId.from(oppUuid) : null;

		UUID quoteUuid = rs.getObject("quote_id", UUID.class);
		QuoteId quoteId = quoteUuid != null ? QuoteId.from(quoteUuid) : null;

		UUID orderUuid = rs.getObject("order_id", UUID.class);
		OrderId orderId = orderUuid != null ? OrderId.from(orderUuid) : null;

		UUID ownerUuid = rs.getObject("owner_user_id", UUID.class);
		ActorId ownerUserId = ownerUuid != null ? new ActorId(ownerUuid) : null;

		String typeStr = rs.getString("contract_type");
		ContractType contractType = typeStr != null ? ContractType.valueOf(typeStr) : ContractType.CUSTOMER;

		String statusStr = rs.getString("status");
		ContractStatus status = statusStr != null ? ContractStatus.valueOf(statusStr) : ContractStatus.DRAFT;

		String currencyCode = rs.getString("currency_code");
		BigDecimal contractValue = rs.getBigDecimal("contract_value");

		Date effectiveFromDate = rs.getDate("effective_from");
		LocalDate effectiveFrom = effectiveFromDate != null ? effectiveFromDate.toLocalDate() : null;
		Date effectiveToDate = rs.getDate("effective_to");
		LocalDate effectiveTo = effectiveToDate != null ? effectiveToDate.toLocalDate() : null;

		boolean autoRenew = rs.getBoolean("auto_renew");
		int renewalDays = rs.getInt("renewal_notice_days");
		Integer renewalNoticeDays = rs.wasNull() ? null : renewalDays;

		Timestamp signedAtTs = rs.getTimestamp("signed_at");
		Instant signedAt = signedAtTs != null ? signedAtTs.toInstant() : null;

		Timestamp terminatedAtTs = rs.getTimestamp("terminated_at");
		Instant terminatedAt = terminatedAtTs != null ? terminatedAtTs.toInstant() : null;

		String terminationReason = rs.getString("termination_reason");
		String documentReference = rs.getString("document_reference");
		String termsSnapshot = rs.getString("terms_snapshot");

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new Contract(tenantId, id, contractNumber, accountId, contactId,
				opportunityId, quoteId, orderId, ownerUserId, contractType, status,
				currencyCode, contractValue, effectiveFrom, effectiveTo, autoRenew,
				renewalNoticeDays, signedAt, terminatedAt, terminationReason,
				documentReference, termsSnapshot, auditInfo, version);
	}

	public static ContractSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String contractNumber = rs.getString("contract_number");
		UUID accountId = rs.getObject("account_id", UUID.class);
		String accountName = rs.getString("account_name");
		UUID contactId = rs.getObject("contact_id", UUID.class);
		String contactName = rs.getString("contact_name");

		String typeStr = rs.getString("contract_type");
		ContractType contractType = typeStr != null ? ContractType.valueOf(typeStr) : ContractType.CUSTOMER;

		String statusStr = rs.getString("status");
		ContractStatus status = statusStr != null ? ContractStatus.valueOf(statusStr) : ContractStatus.DRAFT;

		String currencyCode = rs.getString("currency_code");
		BigDecimal contractValue = rs.getBigDecimal("contract_value");

		Date effectiveFromDate = rs.getDate("effective_from");
		LocalDate effectiveFrom = effectiveFromDate != null ? effectiveFromDate.toLocalDate() : null;
		Date effectiveToDate = rs.getDate("effective_to");
		LocalDate effectiveTo = effectiveToDate != null ? effectiveToDate.toLocalDate() : null;

		boolean autoRenew = rs.getBoolean("auto_renew");

		Timestamp signedAtTs = rs.getTimestamp("signed_at");
		Instant signedAt = signedAtTs != null ? signedAtTs.toInstant() : null;

		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();
		long version = rs.getLong("version");

		return new ContractSummary(id, contractNumber, accountId, accountName, contactId,
				contactName, contractType, status, currencyCode, contractValue,
				effectiveFrom, effectiveTo, autoRenew, signedAt, updatedAt, version);
	}

}
