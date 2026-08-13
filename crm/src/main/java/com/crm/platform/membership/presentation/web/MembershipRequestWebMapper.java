package com.crm.platform.membership.presentation.web;

import java.util.Objects;

import com.crm.platform.membership.application.command.ApproveMembershipRequestCommand;
import com.crm.platform.membership.application.command.RejectMembershipRequestCommand;
import com.crm.platform.membership.application.command.SubmitMembershipRequestCommand;
import com.crm.platform.membership.application.dto.ApprovedMembershipDetails;
import com.crm.platform.membership.application.dto.MembershipRequestDetails;
import com.crm.platform.membership.application.dto.RoleReference;
import com.crm.platform.membership.application.dto.UserReference;
import com.crm.platform.membership.application.query.MembershipRequestSearchQuery;
import com.crm.platform.membership.domain.MembershipRequestId;
import com.crm.platform.membership.domain.MembershipRequestStatus;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.stereotype.Component;

@Component
public final class MembershipRequestWebMapper {

	public SubmitMembershipRequestCommand toSubmitCommand(
			SubmitMembershipRequestRequest request) {
		Objects.requireNonNull(request, "request must not be null");
		return new SubmitMembershipRequestCommand(
				request.tenantCode(), request.message());
	}

	public MembershipRequestSearchQuery toSearchQuery(
			MembershipRequestSearchRequest request) {
		Objects.requireNonNull(request, "request must not be null");
		MembershipRequestStatus status = request.status() == null
				? MembershipRequestStatus.PENDING : request.status();
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null ? PageQuery.DEFAULT_SIZE : request.size();
		return new MembershipRequestSearchQuery(status,
				new PageQuery(page, size));
	}

	public ApproveMembershipRequestCommand toApproveCommand(
			MembershipRequestId id, ApproveMembershipRequestRequest request) {
		Objects.requireNonNull(request, "request must not be null");
		return new ApproveMembershipRequestCommand(id, request.version(),
				request.roleIds(), request.reviewNote());
	}

	public RejectMembershipRequestCommand toRejectCommand(
			MembershipRequestId id, RejectMembershipRequestRequest request) {
		Objects.requireNonNull(request, "request must not be null");
		return new RejectMembershipRequestCommand(id, request.version(),
				request.reason());
	}

	public MembershipRequestSubmissionResponse toSubmissionResponse(
			MembershipRequestDetails details) {
		Objects.requireNonNull(details, "details must not be null");
		return new MembershipRequestSubmissionResponse(
				details.id().value(),
				new MembershipRequestSubmissionResponse.Tenant(
						details.tenant().id().value(),
						details.tenant().tenantCode(),
						details.tenant().displayName()),
				details.status(), details.message(), details.requestedAt(),
				details.reviewedAt(), details.reviewNote(), details.version());
	}

	public MembershipRequestReviewResponse toReviewResponse(
			MembershipRequestDetails details) {
		Objects.requireNonNull(details, "details must not be null");
		return new MembershipRequestReviewResponse(
				details.id().value(), toRequester(details.requester()),
				details.status(), details.message(), details.requestedAt(),
				details.reviewedAt(), toReviewer(details.reviewer()),
				details.reviewNote(), details.version());
	}

	public ApprovedMembershipResponse toApprovedResponse(
			ApprovedMembershipDetails details) {
		Objects.requireNonNull(details, "details must not be null");
		return new ApprovedMembershipResponse(details.tenantId().value(),
				toApprovedUser(details.user()), details.status(),
				details.tenantAdmin(), details.joinedAt(), details.roles().stream()
						.map(this::toRole)
						.toList(),
				details.version());
	}

	public PageResult<MembershipRequestReviewResponse> toReviewPage(
			PageResult<MembershipRequestDetails> page) {
		Objects.requireNonNull(page, "page must not be null");
		return new PageResult<>(page.items().stream()
				.map(this::toReviewResponse)
				.toList(), page.page(), page.size(), page.totalElements(),
				page.totalPages());
	}

	private static MembershipRequestReviewResponse.Requester toRequester(
			UserReference user) {
		return new MembershipRequestReviewResponse.Requester(
				user.id().value(), user.email(), user.displayName());
	}

	private static MembershipRequestReviewResponse.Reviewer toReviewer(
			UserReference user) {
		return user == null ? null
				: new MembershipRequestReviewResponse.Reviewer(
						user.id().value(), user.displayName());
	}

	private static ApprovedMembershipResponse.User toApprovedUser(
			UserReference user) {
		return new ApprovedMembershipResponse.User(
				user.id().value(), user.email(), user.displayName());
	}

	private ApprovedMembershipResponse.Role toRole(RoleReference role) {
		return new ApprovedMembershipResponse.Role(role.id(), role.roleCode(),
				role.name());
	}

}
