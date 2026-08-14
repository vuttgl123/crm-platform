package com.crm.foundation.security;

public enum SystemPermission {

	CRM_ACCOUNT_READ("crm_account.read"),
	CRM_ACCOUNT_WRITE("crm_account.write"),
	CRM_CONTACT_READ("crm_contact.read"),
	CRM_CONTACT_WRITE("crm_contact.write"),
	CRM_LEAD_READ("crm_lead.read"),
	CRM_LEAD_WRITE("crm_lead.write"),
	CRM_OPPORTUNITY_READ("crm_opportunity.read"),
	CRM_OPPORTUNITY_WRITE("crm_opportunity.write"),
	CRM_ACTIVITY_READ("crm_activity.read"),
	CRM_ACTIVITY_WRITE("crm_activity.write"),
	SALES_QUOTE_READ("sales_quote.read"),
	SALES_QUOTE_WRITE("sales_quote.write"),
	SALES_QUOTE_APPROVE("sales_quote.approve"),
	SALES_ORDER_READ("sales_order.read"),
	SALES_ORDER_WRITE("sales_order.write"),
	SERVICE_TICKET_READ("service_ticket.read"),
	SERVICE_TICKET_WRITE("service_ticket.write"),
	PRIVACY_CONSENT_READ("privacy_consent.read"),
	PRIVACY_CONSENT_WRITE("privacy_consent.write"),
	AUDIT_READ("audit_read"),
	PLATFORM_USER_MANAGE("platform_user.manage"),
	PLATFORM_MEMBERSHIP_READ("platform_membership.read"),
	PLATFORM_MEMBERSHIP_APPROVE("platform_membership.approve"),
	PLATFORM_ROLE_READ("platform_role.read"),
	PLATFORM_ROLE_ASSIGN("platform_role.assign"),
	PLATFORM_ROLE_MANAGE("platform_role.manage");

	private final String code;

	SystemPermission(String code) {
		this.code = code;
	}

	public String code() {
		return code;
	}

	@Override
	public String toString() {
		return code;
	}

}
