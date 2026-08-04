package com.crm.foundation.security;

import java.util.Set;

public interface DataScopeResolver {

	Set<ResolvedDataScope> resolve(String entityType);

}
