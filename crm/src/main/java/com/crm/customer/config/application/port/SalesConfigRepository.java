package com.crm.customer.config.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.customer.config.application.dto.LeadSourceDetails;
import com.crm.customer.config.application.dto.LeadStatusDetails;
import com.crm.customer.config.application.dto.OpportunityLostReasonDetails;
import com.crm.customer.config.domain.LeadSource;
import com.crm.customer.config.domain.LeadSourceId;
import com.crm.customer.config.domain.LeadStatus;
import com.crm.customer.config.domain.LeadStatusId;
import com.crm.customer.config.domain.OpportunityLostReason;
import com.crm.customer.config.domain.OpportunityLostReasonId;
import com.crm.sharedkernel.domain.TenantId;

public interface SalesConfigRepository {

	Optional<LeadSource> findLeadSourceById(TenantId tenantId, LeadSourceId id);

	Optional<LeadSource> findLeadSourceByCode(TenantId tenantId, String sourceCode);

	boolean existsLeadSourceByCode(TenantId tenantId, String sourceCode);

	List<LeadSourceDetails> findAllLeadSources(TenantId tenantId);

	void insertLeadSource(LeadSource leadSource);

	void updateLeadSource(LeadSource leadSource);

	Optional<LeadStatus> findLeadStatusById(TenantId tenantId, LeadStatusId id);

	Optional<LeadStatus> findLeadStatusByCode(TenantId tenantId, String statusCode);

	boolean existsLeadStatusByCode(TenantId tenantId, String statusCode);

	List<LeadStatusDetails> findAllLeadStatuses(TenantId tenantId);

	void insertLeadStatus(LeadStatus leadStatus);

	void updateLeadStatus(LeadStatus leadStatus);

	Optional<OpportunityLostReason> findLostReasonById(TenantId tenantId, OpportunityLostReasonId id);

	Optional<OpportunityLostReason> findLostReasonByCode(TenantId tenantId, String reasonCode);

	boolean existsLostReasonByCode(TenantId tenantId, String reasonCode);

	List<OpportunityLostReasonDetails> findAllLostReasons(TenantId tenantId);

	void insertLostReason(OpportunityLostReason reason);

	void updateLostReason(OpportunityLostReason reason);

}
