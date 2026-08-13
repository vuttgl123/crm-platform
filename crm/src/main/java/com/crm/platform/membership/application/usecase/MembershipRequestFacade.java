package com.crm.platform.membership.application.usecase;

import com.crm.platform.membership.application.command.ApproveMembershipRequestCommand;
import com.crm.platform.membership.application.command.RejectMembershipRequestCommand;
import com.crm.platform.membership.application.command.SubmitMembershipRequestCommand;
import com.crm.platform.membership.application.dto.ApprovedMembershipDetails;
import com.crm.platform.membership.application.dto.MembershipRequestDetails;
import com.crm.platform.membership.application.query.MembershipRequestSearchQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;

import java.util.List;
import java.util.UUID;

public interface MembershipRequestFacade {

	MembershipRequestDetails submit(SubmitMembershipRequestCommand command);

	PageResult<MembershipRequestDetails> search(
			MembershipRequestSearchQuery query);

	ApprovedMembershipDetails approve(ApproveMembershipRequestCommand command);

	MembershipRequestDetails reject(RejectMembershipRequestCommand command);

	void updateMemberRoles(ActorId targetUserId, List<UUID> roleIds);

}
