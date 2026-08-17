package com.crm.customer.tag.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.tag.application.dto.EntityTagDetails;
import com.crm.customer.tag.application.dto.TagDetails;
import com.crm.customer.tag.domain.EntityTag;
import com.crm.customer.tag.domain.EntityTagId;
import com.crm.customer.tag.domain.Tag;
import com.crm.customer.tag.domain.TagId;
import com.crm.sharedkernel.domain.TenantId;

public interface TagRepository {

	Optional<Tag> findById(TenantId tenantId, TagId id);

	Optional<Tag> findByKey(TenantId tenantId, String tagKey);

	boolean existsByKey(TenantId tenantId, String tagKey);

	List<TagDetails> findAll(TenantId tenantId);

	void insert(Tag tag);

	void update(Tag tag);

	void insertEntityTag(EntityTag entityTag);

	void deleteEntityTag(TenantId tenantId, EntityTagId id);

	Optional<EntityTag> findEntityTag(TenantId tenantId, EntityTagId id);

	List<EntityTagDetails> findEntityTagsByTarget(
			TenantId tenantId,
			UUID accountId,
			UUID contactId,
			UUID leadId,
			UUID opportunityId,
			UUID activityId,
			UUID ticketId
	);

	boolean existsEntityTag(
			TenantId tenantId,
			TagId tagId,
			UUID accountId,
			UUID contactId,
			UUID leadId,
			UUID opportunityId,
			UUID activityId,
			UUID ticketId
	);

}
