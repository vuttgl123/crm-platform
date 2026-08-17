package com.crm.privacy.application.usecase;

import java.util.List;

import com.crm.privacy.application.command.CreateRetentionPolicyCommand;
import com.crm.privacy.application.command.UpdateRetentionPolicyCommand;
import com.crm.privacy.application.dto.RetentionPolicyDetails;
import com.crm.privacy.domain.RetentionPolicyId;

public interface RetentionPolicyFacade {

	RetentionPolicyDetails create(CreateRetentionPolicyCommand command);

	RetentionPolicyDetails get(RetentionPolicyId id);

	List<RetentionPolicyDetails> list();

	RetentionPolicyDetails update(UpdateRetentionPolicyCommand command);

	void delete(RetentionPolicyId id, long version);

}
