package com.crm.platform.membership.presentation.web;

import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import jakarta.validation.Valid;
import com.crm.platform.membership.application.dto.ApprovedMembershipDetails;
import com.crm.platform.membership.application.dto.MembershipRequestDetails;
import com.crm.platform.membership.application.usecase.MembershipRequestFacade;
import com.crm.platform.membership.domain.MembershipRequestId;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/membership-requests")
public final class MembershipRequestController {

	private final MembershipRequestFacade membershipRequests;
	private final MembershipRequestWebMapper mapper;

	public MembershipRequestController(MembershipRequestFacade membershipRequests,
			MembershipRequestWebMapper mapper) {
		this.membershipRequests = membershipRequests;
		this.mapper = mapper;
	}

	@PostMapping
	public ResponseEntity<MembershipRequestSubmissionResponse> submit(
			@Valid @RequestBody SubmitMembershipRequestRequest request) {
		MembershipRequestDetails details = membershipRequests.submit(
				mapper.toSubmitCommand(request));
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(mapper.toSubmissionResponse(details));
	}

	@GetMapping
	public PageResult<MembershipRequestReviewResponse> search(
			@Valid @ModelAttribute MembershipRequestSearchRequest request) {
		return mapper.toReviewPage(membershipRequests.search(
				mapper.toSearchQuery(request)));
	}

	@PostMapping("/{id}/approve")
	public ApprovedMembershipResponse approve(@PathVariable UUID id,
			@Valid @RequestBody ApproveMembershipRequestRequest request) {
		ApprovedMembershipDetails details = membershipRequests.approve(
				mapper.toApproveCommand(new MembershipRequestId(id), request));
		return mapper.toApprovedResponse(details);
	}

	@PostMapping("/{id}/reject")
	public MembershipRequestReviewResponse reject(@PathVariable UUID id,
			@Valid @RequestBody RejectMembershipRequestRequest request) {
		MembershipRequestDetails details = membershipRequests.reject(
				mapper.toRejectCommand(new MembershipRequestId(id), request));
		return mapper.toReviewResponse(details);
	}

	@org.springframework.web.bind.annotation.PutMapping("/users/{userId}/roles")
	public ResponseEntity<Void> updateUserRoles(@PathVariable UUID userId,
			@Valid @RequestBody UpdateUserRolesRequest request) {
		membershipRequests.updateMemberRoles(
				new ActorId(userId), request.roleIds());
		return ResponseEntity.noContent().build();
	}

}
