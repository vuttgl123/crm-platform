package com.crm.marketing.campaign.application.service;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.lead.domain.LeadId;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.marketing.campaign.application.command.AddCampaignMemberCommand;
import com.crm.marketing.campaign.application.command.CreateCampaignCommand;
import com.crm.marketing.campaign.application.command.UpdateCampaignCommand;
import com.crm.marketing.campaign.application.command.UpdateCampaignMemberStatusCommand;
import com.crm.marketing.campaign.application.dto.CampaignDetails;
import com.crm.marketing.campaign.application.dto.CampaignMemberDetails;
import com.crm.marketing.campaign.application.dto.CampaignPerformanceMetrics;
import com.crm.marketing.campaign.application.dto.CampaignSummary;
import com.crm.marketing.campaign.application.port.CampaignRepository;
import com.crm.marketing.campaign.application.query.CampaignSearchQuery;
import com.crm.marketing.campaign.application.usecase.CampaignFacade;
import com.crm.marketing.campaign.domain.Campaign;
import com.crm.marketing.campaign.domain.CampaignErrorCode;
import com.crm.marketing.campaign.domain.CampaignId;
import com.crm.marketing.campaign.domain.CampaignMember;
import com.crm.marketing.campaign.domain.CampaignMemberId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CampaignApplicationService implements CampaignFacade {

	private final CampaignRepository campaignRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public CampaignApplicationService(
			CampaignRepository campaignRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.campaignRepository = campaignRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public CampaignDetails create(CreateCampaignCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.MARKETING_CAMPAIGN_WRITE);

		String code = command.campaignCode().trim().toUpperCase();
		if (campaignRepository.existsByCode(tenantId, code)) {
			throw new ResourceConflict(CampaignErrorCode.CAMPAIGN_CODE_ALREADY_EXISTS.code());
		}

		if (command.startAt() != null && command.endAt() != null && command.endAt().isBefore(command.startAt())) {
			throw new ResourceConflict(CampaignErrorCode.INVALID_CAMPAIGN_DATES.code());
		}

		Instant now = timeProvider.now();
		CampaignId id = new CampaignId(identifierGenerator.nextId());
		ActorId ownerUserId = command.ownerUserId() != null ? new ActorId(command.ownerUserId()) : actorId;

		Campaign campaign = Campaign.create(
				tenantId,
				id,
				code,
				command.name(),
				command.campaignType(),
				ownerUserId,
				command.startAt(),
				command.endAt(),
				command.budget(),
				command.expectedRevenue(),
				command.currencyCode(),
				command.description(),
				command.utmSource(),
				command.utmMedium(),
				command.utmCampaign(),
				actorId,
				now
		);

		try {
			campaignRepository.insert(campaign);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(CampaignErrorCode.CAMPAIGN_CODE_ALREADY_EXISTS.code());
		}

		return CampaignDetails.from(campaign, CampaignPerformanceMetrics.empty());
	}

	@Override
	@Transactional(readOnly = true)
	public CampaignDetails get(CampaignId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.MARKETING_CAMPAIGN_READ);

		Campaign campaign = campaignRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(CampaignErrorCode.CAMPAIGN_NOT_FOUND.code()));

		CampaignPerformanceMetrics metrics = campaignRepository.calculateMetrics(tenantId, id);
		return CampaignDetails.from(campaign, metrics);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<CampaignSummary> search(CampaignSearchQuery query) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.MARKETING_CAMPAIGN_READ);
		return campaignRepository.search(tenantId, query != null ? query : new CampaignSearchQuery(null, null, null, null, null, null, null));
	}

	@Override
	@Transactional
	public CampaignDetails update(UpdateCampaignCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.MARKETING_CAMPAIGN_WRITE);

		Campaign campaign = campaignRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(CampaignErrorCode.CAMPAIGN_NOT_FOUND.code()));

		if (campaign.version() != command.version()) {
			throw new ResourceConflict(CampaignErrorCode.CAMPAIGN_VERSION_CONFLICT.code());
		}

		if (command.startAt() != null && command.endAt() != null && command.endAt().isBefore(command.startAt())) {
			throw new ResourceConflict(CampaignErrorCode.INVALID_CAMPAIGN_DATES.code());
		}

		ActorId ownerUserId = command.ownerUserId() != null ? new ActorId(command.ownerUserId()) : campaign.ownerUserId();

		campaign.update(
				command.name(),
				command.campaignType(),
				command.status(),
				ownerUserId,
				command.startAt(),
				command.endAt(),
				command.budget(),
				command.actualCost(),
				command.expectedRevenue(),
				command.currencyCode(),
				command.description(),
				command.utmSource(),
				command.utmMedium(),
				command.utmCampaign(),
				actorId,
				timeProvider.now()
		);

		campaignRepository.update(campaign);
		CampaignPerformanceMetrics metrics = campaignRepository.calculateMetrics(tenantId, command.id());
		return CampaignDetails.from(campaign, metrics);
	}

	@Override
	@Transactional
	public void delete(CampaignId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.MARKETING_CAMPAIGN_WRITE);

		Campaign campaign = campaignRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(CampaignErrorCode.CAMPAIGN_NOT_FOUND.code()));

		if (campaign.version() != version) {
			throw new ResourceConflict(CampaignErrorCode.CAMPAIGN_VERSION_CONFLICT.code());
		}

		campaign.markDeleted(actorId, timeProvider.now());
		campaignRepository.update(campaign);
	}

	@Override
	@Transactional
	public CampaignMemberDetails addMember(AddCampaignMemberCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.MARKETING_CAMPAIGN_WRITE);

		campaignRepository.findById(tenantId, command.campaignId())
				.orElseThrow(() -> new DomainResourceNotFound(CampaignErrorCode.CAMPAIGN_NOT_FOUND.code()));

		if ((command.leadId() == null && command.contactId() == null)
				|| (command.leadId() != null && command.contactId() != null)) {
			throw new ResourceConflict(CampaignErrorCode.INVALID_CAMPAIGN_MEMBER_TARGET.code());
		}

		LeadId leadId = command.leadId() != null ? new LeadId(command.leadId()) : null;
		ContactId contactId = command.contactId() != null ? new ContactId(command.contactId()) : null;

		if (leadId != null && campaignRepository.existsMemberByLead(tenantId, command.campaignId(), leadId)) {
			throw new ResourceConflict(CampaignErrorCode.CAMPAIGN_MEMBER_ALREADY_EXISTS.code());
		}
		if (contactId != null && campaignRepository.existsMemberByContact(tenantId, command.campaignId(), contactId)) {
			throw new ResourceConflict(CampaignErrorCode.CAMPAIGN_MEMBER_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		CampaignMemberId memberId = new CampaignMemberId(identifierGenerator.nextId());

		CampaignMember member = CampaignMember.create(
				tenantId,
				memberId,
				command.campaignId(),
				leadId,
				contactId,
				command.memberStatus(),
				command.sourceDetail(),
				command.metadata(),
				actorId,
				now
		);

		try {
			campaignRepository.insertMember(member);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(CampaignErrorCode.CAMPAIGN_MEMBER_ALREADY_EXISTS.code());
		}

		return new CampaignMemberDetails(
				member.id().value(),
				member.campaignId().value(),
				leadId != null ? leadId.value() : null,
				null, null, null,
				contactId != null ? contactId.value() : null,
				null, null,
				member.memberStatus(),
				member.sourceDetail(),
				member.firstRespondedAt(),
				member.lastEngagedAt(),
				member.metadata(),
				actorId.value(),
				now,
				actorId.value(),
				now,
				member.version()
		);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<CampaignMemberDetails> listMembers(CampaignId campaignId, PageQuery page) {
		Objects.requireNonNull(campaignId, "campaignId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.MARKETING_CAMPAIGN_READ);

		campaignRepository.findById(tenantId, campaignId)
				.orElseThrow(() -> new DomainResourceNotFound(CampaignErrorCode.CAMPAIGN_NOT_FOUND.code()));

		return campaignRepository.findMembers(tenantId, campaignId, page != null ? page : PageQuery.defaultPage());
	}

	@Override
	@Transactional
	public CampaignMemberDetails updateMemberStatus(UpdateCampaignMemberStatusCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.MARKETING_CAMPAIGN_WRITE);

		campaignRepository.findById(tenantId, command.campaignId())
				.orElseThrow(() -> new DomainResourceNotFound(CampaignErrorCode.CAMPAIGN_NOT_FOUND.code()));

		CampaignMember member = campaignRepository.findMemberById(tenantId, command.memberId())
				.orElseThrow(() -> new DomainResourceNotFound(CampaignErrorCode.CAMPAIGN_MEMBER_NOT_FOUND.code()));

		if (!member.campaignId().equals(command.campaignId())) {
			throw new DomainResourceNotFound(CampaignErrorCode.CAMPAIGN_MEMBER_NOT_FOUND.code());
		}

		if (member.version() != command.version()) {
			throw new ResourceConflict(CampaignErrorCode.CAMPAIGN_VERSION_CONFLICT.code());
		}

		Instant now = timeProvider.now();
		member.updateStatus(
				command.memberStatus(),
				command.sourceDetail(),
				command.metadata(),
				actorId,
				now
		);

		campaignRepository.updateMember(member);

		return new CampaignMemberDetails(
				member.id().value(),
				member.campaignId().value(),
				member.leadId() != null ? member.leadId().value() : null,
				null, null, null,
				member.contactId() != null ? member.contactId().value() : null,
				null, null,
				member.memberStatus(),
				member.sourceDetail(),
				member.firstRespondedAt(),
				member.lastEngagedAt(),
				member.metadata(),
				member.auditInfo().createdBy() != null ? member.auditInfo().createdBy().value() : null,
				member.auditInfo().createdAt(),
				actorId.value(),
				now,
				member.version()
		);
	}

	@Override
	@Transactional
	public void removeMember(CampaignId campaignId, CampaignMemberId memberId) {
		Objects.requireNonNull(campaignId, "campaignId must not be null");
		Objects.requireNonNull(memberId, "memberId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.MARKETING_CAMPAIGN_WRITE);

		CampaignMember member = campaignRepository.findMemberById(tenantId, memberId)
				.orElseThrow(() -> new DomainResourceNotFound(CampaignErrorCode.CAMPAIGN_MEMBER_NOT_FOUND.code()));

		if (!member.campaignId().equals(campaignId)) {
			throw new DomainResourceNotFound(CampaignErrorCode.CAMPAIGN_MEMBER_NOT_FOUND.code());
		}

		campaignRepository.deleteMember(tenantId, memberId);
	}

}
