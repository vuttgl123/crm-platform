-- ============================================================================
-- Scalable multi-tenant CRM database for MySQL 8.0.16+
-- Converted from docs/crm_postgresql18.sql without modifying the source file.
--
-- Compatibility decisions:
--   * PostgreSQL schemas are flattened into table-name prefixes.
--   * UUID values use CHAR(36) and default to UUID().
--   * TIMESTAMPTZ values use UTC DATETIME(6).
--   * JSONB and PostgreSQL arrays use MySQL JSON.
--   * PostgreSQL partial unique indexes use MySQL functional key parts.
--   * GIN/trigram search indexes use InnoDB FULLTEXT indexes.
--   * Append/event tables are not partitioned so InnoDB foreign keys remain valid.
--   * PostgreSQL column-list SET NULL actions on composite tenant foreign keys
--     become RESTRICT because MySQL cannot null only the nullable key component.
--   * MySQL 8.0 has no PostgreSQL-style row-level security. Every application
--     query must include tenant_id, and application authorization must enforce it.
--   * Generic PostgreSQL row-to-JSON audit triggers have no generic MySQL
--     equivalent. Business writes should append to audit_audit_events in the
--     same transaction. The explicit audit_log_data_access procedure is provided.
-- ============================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET time_zone = '+00:00';
SET SESSION sql_mode = CONCAT_WS(',', @@SESSION.sql_mode, 'NO_BACKSLASH_ESCAPES');
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS crm_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE crm_platform;


CREATE TABLE platform_tenants (
                                  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
                                  tenant_code VARCHAR(320) NOT NULL,
                                  legal_name VARCHAR(255) NOT NULL CHECK (TRIM(legal_name) <> ''),
                                  display_name VARCHAR(255) NOT NULL CHECK (TRIM(display_name) <> ''),
                                  default_currency_code CHAR(3) NOT NULL CHECK (REGEXP_LIKE(default_currency_code, '^[A-Z]{3}$')),
                                  default_country_code CHAR(2) NOT NULL CHECK (REGEXP_LIKE(default_country_code, '^[A-Z]{2}$')),
                                  default_language_code VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (REGEXP_LIKE(default_language_code, '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$')),
                                  default_timezone VARCHAR(255) NOT NULL DEFAULT 'UTC',
                                  data_region VARCHAR(255),
                                  status VARCHAR(255) NOT NULL DEFAULT 'ACTIVE'
                                      CHECK (status IN ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CLOSED')),
                                  plan_code VARCHAR(191),
                                  retention_days INT CHECK (retention_days IS NULL OR retention_days >= 0),
                                  metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                  created_by CHAR(36),
                                  updated_by CHAR(36),
                                  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                  CONSTRAINT uq_tenants_tenant_code UNIQUE (tenant_code)
) ENGINE=InnoDB;

CREATE TABLE platform_users (
                                id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
                                email VARCHAR(320) NOT NULL,
                                display_name VARCHAR(255) NOT NULL CHECK (TRIM(display_name) <> ''),
                                given_name VARCHAR(255),
                                family_name VARCHAR(255),
                                preferred_language_code VARCHAR(10) CHECK (REGEXP_LIKE(preferred_language_code, '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$')),
                                external_subject VARCHAR(255),
                                identity_provider VARCHAR(255),
                                status VARCHAR(255) NOT NULL DEFAULT 'ACTIVE'
                                    CHECK (status IN ('INVITED', 'ACTIVE', 'LOCKED', 'DISABLED')),
                                last_login_at DATETIME(6),
                                metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                created_by CHAR(36),
                                updated_by CHAR(36),
                                version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE platform_tenant_memberships (
                                             tenant_id CHAR(36) NOT NULL,
                                             user_id CHAR(36) NOT NULL,
                                             membership_status VARCHAR(191) NOT NULL DEFAULT 'ACTIVE'
                                                 CHECK (membership_status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED')),
                                             employee_reference VARCHAR(191),
                                             job_title VARCHAR(255),
                                             locale VARCHAR(10) CHECK (REGEXP_LIKE(locale, '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$')),
                                             timezone VARCHAR(255),
                                             joined_at DATETIME(6),
                                             removed_at DATETIME(6),
                                             is_tenant_admin BOOLEAN NOT NULL DEFAULT false,
                                             metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                             created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                             updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                             created_by CHAR(36),
                                             updated_by CHAR(36),
                                             version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                             PRIMARY KEY (tenant_id, user_id),
                                             FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                             FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE RESTRICT,
                                             CHECK (removed_at IS NULL OR membership_status = 'REMOVED')
) ENGINE=InnoDB;

CREATE TABLE platform_teams (
                                tenant_id CHAR(36) NOT NULL,
                                id CHAR(36) NOT NULL DEFAULT (UUID()),
                                name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                description LONGTEXT,
                                parent_team_id CHAR(36),
                                manager_user_id CHAR(36),
                                status VARCHAR(255) NOT NULL DEFAULT 'ACTIVE'
                                    CHECK (status IN ('ACTIVE', 'INACTIVE')),
                                created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                created_by CHAR(36),
                                updated_by CHAR(36),
                                deleted_at DATETIME(6),
                                deleted_by CHAR(36),
                                version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                PRIMARY KEY (tenant_id, id),
                                FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                FOREIGN KEY (tenant_id, parent_team_id)
                                    REFERENCES platform_teams(tenant_id, id) ON DELETE RESTRICT,
                                FOREIGN KEY (tenant_id, manager_user_id)
                                    REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE platform_team_members (
                                       tenant_id CHAR(36) NOT NULL,
                                       team_id CHAR(36) NOT NULL,
                                       user_id CHAR(36) NOT NULL,
                                       member_role VARCHAR(255),
                                       is_primary BOOLEAN NOT NULL DEFAULT false,
                                       joined_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                       left_at DATETIME(6),
                                       created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                       created_by CHAR(36),
                                       PRIMARY KEY (tenant_id, team_id, user_id),
                                       FOREIGN KEY (tenant_id, team_id)
                                           REFERENCES platform_teams(tenant_id, id) ON DELETE CASCADE,
                                       FOREIGN KEY (tenant_id, user_id)
                                           REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE CASCADE,
                                       CHECK (left_at IS NULL OR left_at >= joined_at)
) ENGINE=InnoDB;

CREATE TABLE platform_permissions (
                                      permission_code VARCHAR(191) PRIMARY KEY,
                                      description LONGTEXT NOT NULL CHECK (TRIM(description) <> ''),
                                      module_code VARCHAR(191) NOT NULL,
                                      risk_level VARCHAR(255) NOT NULL DEFAULT 'NORMAL'
                                          CHECK (risk_level IN ('NORMAL', 'SENSITIVE', 'PRIVILEGED')),
                                      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;

CREATE TABLE platform_roles (
                                tenant_id CHAR(36) NOT NULL,
                                id CHAR(36) NOT NULL DEFAULT (UUID()),
                                role_code VARCHAR(191) NOT NULL,
                                name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                description LONGTEXT,
                                is_system BOOLEAN NOT NULL DEFAULT false,
                                status VARCHAR(255) NOT NULL DEFAULT 'ACTIVE'
                                    CHECK (status IN ('ACTIVE', 'INACTIVE')),
                                created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                created_by CHAR(36),
                                updated_by CHAR(36),
                                deleted_at DATETIME(6),
                                deleted_by CHAR(36),
                                version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                PRIMARY KEY (tenant_id, id),
                                FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE platform_role_permissions (
                                           tenant_id CHAR(36) NOT NULL,
                                           role_id CHAR(36) NOT NULL,
                                           permission_code VARCHAR(191) NOT NULL,
                                           granted_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                           granted_by CHAR(36),
                                           PRIMARY KEY (tenant_id, role_id, permission_code),
                                           FOREIGN KEY (tenant_id, role_id)
                                               REFERENCES platform_roles(tenant_id, id) ON DELETE CASCADE,
                                           FOREIGN KEY (permission_code)
                                               REFERENCES platform_permissions(permission_code) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE platform_user_roles (
                                     tenant_id CHAR(36) NOT NULL,
                                     user_id CHAR(36) NOT NULL,
                                     role_id CHAR(36) NOT NULL,
                                     valid_from DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                     valid_to DATETIME(6),
                                     assigned_by CHAR(36),
                                     created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                     PRIMARY KEY (tenant_id, user_id, role_id),
                                     FOREIGN KEY (tenant_id, user_id)
                                         REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE CASCADE,
                                     FOREIGN KEY (tenant_id, role_id)
                                         REFERENCES platform_roles(tenant_id, id) ON DELETE CASCADE,
                                     CHECK (valid_to IS NULL OR valid_to > valid_from)
) ENGINE=InnoDB;

CREATE TABLE platform_role_data_scopes (
                                           tenant_id CHAR(36) NOT NULL,
                                           id CHAR(36) NOT NULL DEFAULT (UUID()),
                                           role_id CHAR(36) NOT NULL,
                                           entity_type VARCHAR(191) NOT NULL,
                                           scope_type VARCHAR(191) NOT NULL
                                               CHECK (scope_type IN ('OWN', 'TEAM', 'TEAM_TREE', 'TENANT')),
                                           team_id CHAR(36),
                                           created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                           created_by CHAR(36),
                                           PRIMARY KEY (tenant_id, id),
                                           FOREIGN KEY (tenant_id, role_id)
                                               REFERENCES platform_roles(tenant_id, id) ON DELETE CASCADE,
                                           FOREIGN KEY (tenant_id, team_id)
                                               REFERENCES platform_teams(tenant_id, id) ON DELETE CASCADE,
                                           CHECK ((scope_type IN ('TEAM', 'TEAM_TREE') AND team_id IS NOT NULL)
                                               OR (scope_type IN ('OWN', 'TENANT') AND team_id IS NULL))
) ENGINE=InnoDB;

CREATE TABLE platform_tenant_settings (
                                          tenant_id CHAR(36) NOT NULL,
                                          setting_key VARCHAR(191) NOT NULL,
                                          setting_value JSON NOT NULL,
                                          is_secret_reference BOOLEAN NOT NULL DEFAULT false,
                                          updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                          updated_by CHAR(36),
                                          version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                          PRIMARY KEY (tenant_id, setting_key),
                                          FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE platform_document_counters (
                                            tenant_id CHAR(36) NOT NULL,
                                            counter_key VARCHAR(191) NOT NULL,
                                            current_value bigint NOT NULL DEFAULT 0 CHECK (current_value >= 0),
                                            updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                            PRIMARY KEY (tenant_id, counter_key),
                                            FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE crm_lead_sources (
                                  tenant_id CHAR(36) NOT NULL,
                                  id CHAR(36) NOT NULL DEFAULT (UUID()),
                                  source_code VARCHAR(191) NOT NULL,
                                  name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                  description LONGTEXT,
                                  is_active BOOLEAN NOT NULL DEFAULT true,
                                  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                  created_by CHAR(36),
                                  updated_by CHAR(36),
                                  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                  PRIMARY KEY (tenant_id, id),
                                  FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                  UNIQUE (tenant_id, source_code)
) ENGINE=InnoDB;

CREATE TABLE crm_lead_statuses (
                                   tenant_id CHAR(36) NOT NULL,
                                   id CHAR(36) NOT NULL DEFAULT (UUID()),
                                   status_code VARCHAR(191) NOT NULL,
                                   name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                   status_category VARCHAR(255) NOT NULL
                                       CHECK (status_category IN ('OPEN', 'QUALIFIED', 'DISQUALIFIED', 'CONVERTED')),
                                   display_order INT NOT NULL DEFAULT 0,
                                   is_default BOOLEAN NOT NULL DEFAULT false,
                                   is_terminal BOOLEAN NOT NULL DEFAULT false,
                                   is_active BOOLEAN NOT NULL DEFAULT true,
                                   created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                   updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                   created_by CHAR(36),
                                   updated_by CHAR(36),
                                   version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                   PRIMARY KEY (tenant_id, id),
                                   FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                   UNIQUE (tenant_id, status_code)
) ENGINE=InnoDB;

CREATE TABLE crm_opportunity_lost_reasons (
                                              tenant_id CHAR(36) NOT NULL,
                                              id CHAR(36) NOT NULL DEFAULT (UUID()),
                                              reason_code VARCHAR(191) NOT NULL,
                                              name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                              description LONGTEXT,
                                              is_active BOOLEAN NOT NULL DEFAULT true,
                                              created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                              updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                              created_by CHAR(36),
                                              updated_by CHAR(36),
                                              version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                              PRIMARY KEY (tenant_id, id),
                                              FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                              UNIQUE (tenant_id, reason_code)
) ENGINE=InnoDB;

CREATE TABLE crm_accounts (
                              tenant_id CHAR(36) NOT NULL,
                              id CHAR(36) NOT NULL DEFAULT (UUID()),
                              account_number VARCHAR(191) NOT NULL,
                              account_type VARCHAR(191) NOT NULL DEFAULT 'ORGANIZATION'
                                  CHECK (account_type IN ('ORGANIZATION', 'PERSON', 'PARTNER', 'RESELLER', 'SUPPLIER')),
                              legal_name VARCHAR(255),
                              display_name VARCHAR(255) NOT NULL CHECK (TRIM(display_name) <> ''),
                              parent_account_id CHAR(36),
                              owner_user_id CHAR(36),
                              owner_team_id CHAR(36),
                              lifecycle_stage VARCHAR(255) NOT NULL DEFAULT 'PROSPECT'
                                  CHECK (lifecycle_stage IN ('PROSPECT', 'QUALIFIED', 'CUSTOMER', 'CHURNED', 'INACTIVE')),
                              industry_code VARCHAR(191),
                              tax_identifier VARCHAR(255),
                              registration_number VARCHAR(191),
                              website TEXT,
                              annual_revenue DECIMAL(20,6) CHECK (annual_revenue >= 0),
                              revenue_currency_code CHAR(3) CHECK (REGEXP_LIKE(revenue_currency_code, '^[A-Z]{3}$')),
                              employee_count INT CHECK (employee_count IS NULL OR employee_count >= 0),
                              source_id CHAR(36),
                              description LONGTEXT,
                              preferred_language_code VARCHAR(10) CHECK (REGEXP_LIKE(preferred_language_code, '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$')),
                              do_not_contact BOOLEAN NOT NULL DEFAULT false,
                              custom_summary JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(custom_summary) = 'OBJECT'),
                              created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                              updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                              created_by CHAR(36),
                              updated_by CHAR(36),
                              deleted_at DATETIME(6),
                              deleted_by CHAR(36),
                              version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                              PRIMARY KEY (tenant_id, id),
                              FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                              FOREIGN KEY (tenant_id, parent_account_id)
                                  REFERENCES crm_accounts(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, owner_user_id)
                                  REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, owner_team_id)
                                  REFERENCES platform_teams(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, source_id)
                                  REFERENCES crm_lead_sources(tenant_id, id) ON DELETE RESTRICT,
                              CHECK (annual_revenue IS NULL OR revenue_currency_code IS NOT NULL)
) ENGINE=InnoDB;

CREATE TABLE crm_account_relationships (
                                           tenant_id CHAR(36) NOT NULL,
                                           id CHAR(36) NOT NULL DEFAULT (UUID()),
                                           account_id CHAR(36) NOT NULL,
                                           related_account_id CHAR(36) NOT NULL,
                                           relationship_type VARCHAR(191) NOT NULL,
                                           valid_from date,
                                           valid_to date,
                                           description LONGTEXT,
                                           created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                           created_by CHAR(36),
                                           PRIMARY KEY (tenant_id, id),
                                           FOREIGN KEY (tenant_id, account_id)
                                               REFERENCES crm_accounts(tenant_id, id) ON DELETE CASCADE,
                                           FOREIGN KEY (tenant_id, related_account_id)
                                               REFERENCES crm_accounts(tenant_id, id) ON DELETE CASCADE,
                                           UNIQUE (tenant_id, account_id, related_account_id, relationship_type),
                                           CHECK (account_id <> related_account_id),
                                           CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
) ENGINE=InnoDB;

CREATE TABLE crm_contacts (
                              tenant_id CHAR(36) NOT NULL,
                              id CHAR(36) NOT NULL DEFAULT (UUID()),
                              contact_number VARCHAR(191) NOT NULL,
                              account_id CHAR(36),
                              owner_user_id CHAR(36),
                              owner_team_id CHAR(36),
                              honorific VARCHAR(255),
                              given_name VARCHAR(255),
                              middle_name VARCHAR(255),
                              family_name VARCHAR(255),
                              display_name VARCHAR(255) NOT NULL CHECK (TRIM(display_name) <> ''),
                              job_title VARCHAR(255),
                              department VARCHAR(255),
                              preferred_language_code VARCHAR(10) CHECK (REGEXP_LIKE(preferred_language_code, '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$')),
                              preferred_contact_channel VARCHAR(255)
                                  CHECK (preferred_contact_channel IS NULL OR preferred_contact_channel IN
                                                                              ('EMAIL', 'PHONE', 'MOBILE', 'SMS', 'WHATSAPP', 'OTHER')),
                              lifecycle_stage VARCHAR(255) NOT NULL DEFAULT 'PROSPECT'
                                  CHECK (lifecycle_stage IN ('PROSPECT', 'QUALIFIED', 'CUSTOMER', 'CHURNED', 'INACTIVE')),
                              date_of_birth date,
                              do_not_contact BOOLEAN NOT NULL DEFAULT false,
                              description LONGTEXT,
                              created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                              updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                              created_by CHAR(36),
                              updated_by CHAR(36),
                              deleted_at DATETIME(6),
                              deleted_by CHAR(36),
                              version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                              PRIMARY KEY (tenant_id, id),
                              FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                              FOREIGN KEY (tenant_id, account_id)
                                  REFERENCES crm_accounts(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, owner_user_id)
                                  REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, owner_team_id)
                                  REFERENCES platform_teams(tenant_id, id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE crm_communication_channels (
                                            tenant_id CHAR(36) NOT NULL,
                                            id CHAR(36) NOT NULL DEFAULT (UUID()),
                                            account_id CHAR(36),
                                            contact_id CHAR(36),
                                            channel_type VARCHAR(191) NOT NULL
                                                CHECK (channel_type IN ('EMAIL', 'PHONE', 'MOBILE', 'SMS', 'WHATSAPP', 'LINKEDIN', 'OTHER')),
                                            raw_value VARCHAR(255) NOT NULL CHECK (TRIM(raw_value) <> ''),
                                            normalized_value VARCHAR(255),
                                            label VARCHAR(255),
                                            is_primary BOOLEAN NOT NULL DEFAULT false,
                                            is_verified BOOLEAN NOT NULL DEFAULT false,
                                            verified_at DATETIME(6),
                                            do_not_use BOOLEAN NOT NULL DEFAULT false,
                                            metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                            created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                            updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                            created_by CHAR(36),
                                            updated_by CHAR(36),
                                            deleted_at DATETIME(6),
                                            deleted_by CHAR(36),
                                            version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                            PRIMARY KEY (tenant_id, id),
                                            FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                            FOREIGN KEY (tenant_id, account_id)
                                                REFERENCES crm_accounts(tenant_id, id) ON DELETE CASCADE,
                                            FOREIGN KEY (tenant_id, contact_id)
                                                REFERENCES crm_contacts(tenant_id, id) ON DELETE CASCADE,
                                            CHECK (((account_id IS NOT NULL) + (contact_id IS NOT NULL)) = 1),
                                            CHECK (verified_at IS NULL OR is_verified),
                                            CHECK (channel_type <> 'EMAIL' OR LOCATE('@', raw_value) > 1),
                                            CHECK (channel_type NOT IN ('PHONE', 'MOBILE', 'SMS', 'WHATSAPP')
                                                OR normalized_value IS NULL
                                                OR REGEXP_LIKE(normalized_value, '^\+[1-9][0-9]{1,14}$'))
    ) ENGINE=InnoDB;

CREATE TABLE crm_addresses (
                               tenant_id CHAR(36) NOT NULL,
                               id CHAR(36) NOT NULL DEFAULT (UUID()),
                               address_line_1 VARCHAR(255),
                               address_line_2 VARCHAR(255),
                               locality VARCHAR(255),
                               administrative_area VARCHAR(255),
                               postal_code VARCHAR(191),
                               country_code CHAR(2) NOT NULL CHECK (REGEXP_LIKE(country_code, '^[A-Z]{2}$')),
                               latitude numeric(9,6) CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
                               longitude numeric(9,6) CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
                               formatted_address VARCHAR(255),
                               validation_status VARCHAR(191) NOT NULL DEFAULT 'UNVERIFIED'
                                   CHECK (validation_status IN ('UNVERIFIED', 'VALID', 'INVALID', 'PARTIAL')),
                               created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                               updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                               created_by CHAR(36),
                               updated_by CHAR(36),
                               deleted_at DATETIME(6),
                               deleted_by CHAR(36),
                               version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                               PRIMARY KEY (tenant_id, id),
                               FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                               CHECK (((address_line_1 IS NOT NULL) + (locality IS NOT NULL) + (administrative_area IS NOT NULL) + (postal_code IS NOT NULL) + (formatted_address IS NOT NULL)) >= 1)
) ENGINE=InnoDB;

CREATE TABLE crm_account_addresses (
                                       tenant_id CHAR(36) NOT NULL,
                                       account_id CHAR(36) NOT NULL,
                                       address_id CHAR(36) NOT NULL,
                                       address_type VARCHAR(191) NOT NULL
                                           CHECK (address_type IN ('BILLING', 'SHIPPING', 'OFFICE', 'REGISTERED', 'OTHER')),
                                       is_primary BOOLEAN NOT NULL DEFAULT false,
                                       valid_from date,
                                       valid_to date,
                                       created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                       created_by CHAR(36),
                                       PRIMARY KEY (tenant_id, account_id, address_id, address_type),
                                       FOREIGN KEY (tenant_id, account_id)
                                           REFERENCES crm_accounts(tenant_id, id) ON DELETE CASCADE,
                                       FOREIGN KEY (tenant_id, address_id)
                                           REFERENCES crm_addresses(tenant_id, id) ON DELETE CASCADE,
                                       CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
) ENGINE=InnoDB;

CREATE TABLE crm_contact_addresses (
                                       tenant_id CHAR(36) NOT NULL,
                                       contact_id CHAR(36) NOT NULL,
                                       address_id CHAR(36) NOT NULL,
                                       address_type VARCHAR(191) NOT NULL
                                           CHECK (address_type IN ('HOME', 'OFFICE', 'MAILING', 'OTHER')),
                                       is_primary BOOLEAN NOT NULL DEFAULT false,
                                       valid_from date,
                                       valid_to date,
                                       created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                       created_by CHAR(36),
                                       PRIMARY KEY (tenant_id, contact_id, address_id, address_type),
                                       FOREIGN KEY (tenant_id, contact_id)
                                           REFERENCES crm_contacts(tenant_id, id) ON DELETE CASCADE,
                                       FOREIGN KEY (tenant_id, address_id)
                                           REFERENCES crm_addresses(tenant_id, id) ON DELETE CASCADE,
                                       CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
) ENGINE=InnoDB;

CREATE TABLE crm_leads (
                           tenant_id CHAR(36) NOT NULL,
                           id CHAR(36) NOT NULL DEFAULT (UUID()),
                           lead_number VARCHAR(191) NOT NULL,
                           status_id CHAR(36) NOT NULL,
                           source_id CHAR(36),
                           owner_user_id CHAR(36),
                           owner_team_id CHAR(36),
                           rating VARCHAR(255) CHECK (rating IS NULL OR rating IN ('HOT', 'WARM', 'COLD')),
                           account_name VARCHAR(255),
                           company_name VARCHAR(255),
                           honorific VARCHAR(255),
                           given_name VARCHAR(255),
                           family_name VARCHAR(255),
                           display_name VARCHAR(255) NOT NULL CHECK (TRIM(display_name) <> ''),
                           email VARCHAR(320),
                           phone_e164 VARCHAR(16) CHECK (REGEXP_LIKE(phone_e164, '^\+[1-9][0-9]{1,14}$')),
                           job_title VARCHAR(255),
                           website TEXT,
                           country_code CHAR(2) CHECK (REGEXP_LIKE(country_code, '^[A-Z]{2}$')),
                           preferred_language_code VARCHAR(10) CHECK (REGEXP_LIKE(preferred_language_code, '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$')),
                           estimated_value DECIMAL(20,6) CHECK (estimated_value >= 0),
                           currency_code CHAR(3) CHECK (REGEXP_LIKE(currency_code, '^[A-Z]{3}$')),
                           qualification_notes LONGTEXT,
                           disqualification_reason LONGTEXT,
                           converted_at DATETIME(6),
                           converted_by CHAR(36),
                           converted_account_id CHAR(36),
                           converted_contact_id CHAR(36),
                           converted_opportunity_id CHAR(36),
                           created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                           updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                           created_by CHAR(36),
                           updated_by CHAR(36),
                           deleted_at DATETIME(6),
                           deleted_by CHAR(36),
                           version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                           PRIMARY KEY (tenant_id, id),
                           FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                           FOREIGN KEY (tenant_id, status_id)
                               REFERENCES crm_lead_statuses(tenant_id, id) ON DELETE RESTRICT,
                           FOREIGN KEY (tenant_id, source_id)
                               REFERENCES crm_lead_sources(tenant_id, id) ON DELETE RESTRICT,
                           FOREIGN KEY (tenant_id, owner_user_id)
                               REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                           FOREIGN KEY (tenant_id, owner_team_id)
                               REFERENCES platform_teams(tenant_id, id) ON DELETE RESTRICT,
                           FOREIGN KEY (tenant_id, converted_account_id)
                               REFERENCES crm_accounts(tenant_id, id) ON DELETE RESTRICT,
                           FOREIGN KEY (tenant_id, converted_contact_id)
                               REFERENCES crm_contacts(tenant_id, id) ON DELETE RESTRICT,
                           CHECK (estimated_value IS NULL OR currency_code IS NOT NULL),
                           CHECK ((converted_at IS NULL AND converted_account_id IS NULL
                               AND converted_contact_id IS NULL AND converted_opportunity_id IS NULL)
                               OR converted_at IS NOT NULL)
) ENGINE=InnoDB;

CREATE TABLE crm_lead_status_history (
                                         tenant_id CHAR(36) NOT NULL,
                                         id CHAR(36) NOT NULL DEFAULT (UUID()),
                                         lead_id CHAR(36) NOT NULL,
                                         previous_status_id CHAR(36),
                                         new_status_id CHAR(36) NOT NULL,
                                         reason VARCHAR(255),
                                         changed_by CHAR(36),
                                         changed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                         PRIMARY KEY (tenant_id, id),
                                         FOREIGN KEY (tenant_id, lead_id)
                                             REFERENCES crm_leads(tenant_id, id) ON DELETE CASCADE,
                                         FOREIGN KEY (tenant_id, previous_status_id)
                                             REFERENCES crm_lead_statuses(tenant_id, id) ON DELETE RESTRICT,
                                         FOREIGN KEY (tenant_id, new_status_id)
                                             REFERENCES crm_lead_statuses(tenant_id, id) ON DELETE RESTRICT,
                                         FOREIGN KEY (tenant_id, changed_by)
                                             REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                         CHECK (previous_status_id IS NULL OR previous_status_id <> new_status_id)
) ENGINE=InnoDB;

CREATE TABLE crm_pipelines (
                               tenant_id CHAR(36) NOT NULL,
                               id CHAR(36) NOT NULL DEFAULT (UUID()),
                               pipeline_code VARCHAR(191) NOT NULL,
                               name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                               pipeline_type VARCHAR(191) NOT NULL DEFAULT 'SALES'
                                   CHECK (pipeline_type IN ('SALES', 'RENEWAL', 'PARTNERSHIP', 'CUSTOM')),
                               is_default BOOLEAN NOT NULL DEFAULT false,
                               is_active BOOLEAN NOT NULL DEFAULT true,
                               created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                               updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                               created_by CHAR(36),
                               updated_by CHAR(36),
                               version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                               PRIMARY KEY (tenant_id, id),
                               FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                               UNIQUE (tenant_id, pipeline_code)
) ENGINE=InnoDB;

CREATE TABLE crm_pipeline_stages (
                                     tenant_id CHAR(36) NOT NULL,
                                     id CHAR(36) NOT NULL DEFAULT (UUID()),
                                     pipeline_id CHAR(36) NOT NULL,
                                     stage_code VARCHAR(191) NOT NULL,
                                     name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                     display_order INT NOT NULL CHECK (display_order >= 0),
                                     default_probability DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (default_probability >= 0 AND default_probability <= 100),
                                     stage_category VARCHAR(255) NOT NULL DEFAULT 'OPEN'
                                         CHECK (stage_category IN ('OPEN', 'WON', 'LOST')),
                                     forecast_category VARCHAR(255) NOT NULL DEFAULT 'PIPELINE'
                                         CHECK (forecast_category IN ('OMITTED', 'PIPELINE', 'BEST_CASE', 'COMMIT', 'CLOSED')),
                                     is_active BOOLEAN NOT NULL DEFAULT true,
                                     created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                     updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                     created_by CHAR(36),
                                     updated_by CHAR(36),
                                     version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                     PRIMARY KEY (tenant_id, id),
                                     UNIQUE (tenant_id, pipeline_id, id),
                                     UNIQUE (tenant_id, pipeline_id, stage_code),
                                     UNIQUE (tenant_id, pipeline_id, display_order),
                                     FOREIGN KEY (tenant_id, pipeline_id)
                                         REFERENCES crm_pipelines(tenant_id, id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE crm_opportunities (
                                   tenant_id CHAR(36) NOT NULL,
                                   id CHAR(36) NOT NULL DEFAULT (UUID()),
                                   opportunity_number VARCHAR(191) NOT NULL,
                                   name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                   account_id CHAR(36) NOT NULL,
                                   pipeline_id CHAR(36) NOT NULL,
                                   current_stage_id CHAR(36) NOT NULL,
                                   owner_user_id CHAR(36),
                                   owner_team_id CHAR(36),
                                   source_id CHAR(36),
                                   primary_contact_id CHAR(36),
                                   opportunity_type VARCHAR(191) NOT NULL DEFAULT 'NEW_BUSINESS'
                                       CHECK (opportunity_type IN ('NEW_BUSINESS', 'UPSELL', 'CROSS_SELL', 'RENEWAL', 'PARTNERSHIP', 'OTHER')),
                                   status VARCHAR(255) NOT NULL DEFAULT 'OPEN'
                                       CHECK (status IN ('OPEN', 'WON', 'LOST', 'CANCELLED')),
                                   amount DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (amount >= 0),
                                   currency_code CHAR(3) NOT NULL CHECK (REGEXP_LIKE(currency_code, '^[A-Z]{3}$')),
                                   probability DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
                                   expected_close_date date,
                                   actual_close_date date,
                                   next_step VARCHAR(255),
                                   description LONGTEXT,
                                   lost_reason_id CHAR(36),
                                   lost_reason_notes VARCHAR(255),
                                   campaign_id CHAR(36),
                                   created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                   updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                   created_by CHAR(36),
                                   updated_by CHAR(36),
                                   deleted_at DATETIME(6),
                                   deleted_by CHAR(36),
                                   version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                   PRIMARY KEY (tenant_id, id),
                                   FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                   FOREIGN KEY (tenant_id, account_id)
                                       REFERENCES crm_accounts(tenant_id, id) ON DELETE RESTRICT,
                                   FOREIGN KEY (tenant_id, pipeline_id)
                                       REFERENCES crm_pipelines(tenant_id, id) ON DELETE RESTRICT,
                                   FOREIGN KEY (tenant_id, pipeline_id, current_stage_id)
                                       REFERENCES crm_pipeline_stages(tenant_id, pipeline_id, id) ON DELETE RESTRICT,
                                   FOREIGN KEY (tenant_id, owner_user_id)
                                       REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                   FOREIGN KEY (tenant_id, owner_team_id)
                                       REFERENCES platform_teams(tenant_id, id) ON DELETE RESTRICT,
                                   FOREIGN KEY (tenant_id, source_id)
                                       REFERENCES crm_lead_sources(tenant_id, id) ON DELETE RESTRICT,
                                   FOREIGN KEY (tenant_id, primary_contact_id)
                                       REFERENCES crm_contacts(tenant_id, id) ON DELETE RESTRICT,
                                   FOREIGN KEY (tenant_id, lost_reason_id)
                                       REFERENCES crm_opportunity_lost_reasons(tenant_id, id) ON DELETE RESTRICT,
                                   CHECK ((status = 'LOST' AND lost_reason_id IS NOT NULL) OR status <> 'LOST'),
                                   CHECK (actual_close_date IS NULL OR status IN ('WON', 'LOST', 'CANCELLED'))
) ENGINE=InnoDB;

CREATE TABLE crm_opportunity_contacts (
                                          tenant_id CHAR(36) NOT NULL,
                                          opportunity_id CHAR(36) NOT NULL,
                                          contact_id CHAR(36) NOT NULL,
                                          contact_role VARCHAR(255) NOT NULL DEFAULT 'OTHER',
                                          is_primary BOOLEAN NOT NULL DEFAULT false,
                                          influence_level VARCHAR(255)
                                              CHECK (influence_level IS NULL OR influence_level IN ('LOW', 'MEDIUM', 'HIGH')),
                                          created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                          created_by CHAR(36),
                                          PRIMARY KEY (tenant_id, opportunity_id, contact_id),
                                          FOREIGN KEY (tenant_id, opportunity_id)
                                              REFERENCES crm_opportunities(tenant_id, id) ON DELETE CASCADE,
                                          FOREIGN KEY (tenant_id, contact_id)
                                              REFERENCES crm_contacts(tenant_id, id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE crm_opportunity_stage_history (
                                               tenant_id CHAR(36) NOT NULL,
                                               id CHAR(36) NOT NULL DEFAULT (UUID()),
                                               opportunity_id CHAR(36) NOT NULL,
                                               pipeline_id CHAR(36) NOT NULL,
                                               from_stage_id CHAR(36),
                                               to_stage_id CHAR(36) NOT NULL,
                                               changed_by CHAR(36),
                                               changed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                               reason VARCHAR(255),
                                               PRIMARY KEY (tenant_id, id),
                                               FOREIGN KEY (tenant_id, opportunity_id)
                                                   REFERENCES crm_opportunities(tenant_id, id) ON DELETE CASCADE,
                                               FOREIGN KEY (tenant_id, pipeline_id, from_stage_id)
                                                   REFERENCES crm_pipeline_stages(tenant_id, pipeline_id, id) ON DELETE RESTRICT,
                                               FOREIGN KEY (tenant_id, pipeline_id, to_stage_id)
                                                   REFERENCES crm_pipeline_stages(tenant_id, pipeline_id, id) ON DELETE RESTRICT,
                                               FOREIGN KEY (tenant_id, changed_by)
                                                   REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                               CHECK (from_stage_id IS NULL OR from_stage_id <> to_stage_id)
) ENGINE=InnoDB;

CREATE TABLE crm_activities (
                                tenant_id CHAR(36) NOT NULL,
                                id CHAR(36) NOT NULL DEFAULT (UUID()),
                                activity_type VARCHAR(191) NOT NULL
                                    CHECK (activity_type IN ('CALL', 'EMAIL', 'MEETING', 'TASK', 'MESSAGE', 'DEMO', 'FOLLOW_UP', 'OTHER')),
                                subject VARCHAR(255) NOT NULL CHECK (TRIM(subject) <> ''),
                                description LONGTEXT,
                                direction VARCHAR(255) CHECK (direction IS NULL OR direction IN ('INBOUND', 'OUTBOUND', 'INTERNAL')),
                                status VARCHAR(255) NOT NULL DEFAULT 'PLANNED'
                                    CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DEFERRED')),
                                priority VARCHAR(255) NOT NULL DEFAULT 'NORMAL'
                                    CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
                                owner_user_id CHAR(36),
                                assigned_team_id CHAR(36),
                                scheduled_start_at DATETIME(6),
                                scheduled_end_at DATETIME(6),
                                completed_at DATETIME(6),
                                duration_seconds INT CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
                                outcome_code VARCHAR(191),
                                external_reference VARCHAR(191),
                                recurrence_rule VARCHAR(255),
                                metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                created_by CHAR(36),
                                updated_by CHAR(36),
                                deleted_at DATETIME(6),
                                deleted_by CHAR(36),
                                version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                PRIMARY KEY (tenant_id, id),
                                FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                FOREIGN KEY (tenant_id, owner_user_id)
                                    REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                FOREIGN KEY (tenant_id, assigned_team_id)
                                    REFERENCES platform_teams(tenant_id, id) ON DELETE RESTRICT,
                                CHECK (scheduled_end_at IS NULL OR scheduled_start_at IS NULL OR scheduled_end_at >= scheduled_start_at),
                                CHECK (completed_at IS NULL OR status = 'COMPLETED')
) ENGINE=InnoDB;

CREATE TABLE crm_activity_participants (
                                           tenant_id CHAR(36) NOT NULL,
                                           activity_id CHAR(36) NOT NULL,
                                           id CHAR(36) NOT NULL DEFAULT (UUID()),
                                           user_id CHAR(36),
                                           contact_id CHAR(36),
                                           external_email VARCHAR(320),
                                           participant_role VARCHAR(255) NOT NULL DEFAULT 'ATTENDEE'
                                               CHECK (participant_role IN ('ORGANIZER', 'ATTENDEE', 'REQUIRED', 'OPTIONAL', 'CC', 'BCC')),
                                           participation_status VARCHAR(191)
                                               CHECK (participation_status IS NULL OR participation_status IN
                                                                                      ('NEEDS_ACTION', 'ACCEPTED', 'DECLINED', 'TENTATIVE')),
                                           created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                           PRIMARY KEY (tenant_id, id),
                                           FOREIGN KEY (tenant_id, activity_id)
                                               REFERENCES crm_activities(tenant_id, id) ON DELETE CASCADE,
                                           FOREIGN KEY (tenant_id, user_id)
                                               REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE CASCADE,
                                           FOREIGN KEY (tenant_id, contact_id)
                                               REFERENCES crm_contacts(tenant_id, id) ON DELETE CASCADE,
                                           CHECK (((user_id IS NOT NULL) + (contact_id IS NOT NULL) + (external_email IS NOT NULL)) = 1)
) ENGINE=InnoDB;

CREATE TABLE crm_activity_links (
                                    tenant_id CHAR(36) NOT NULL,
                                    id CHAR(36) NOT NULL DEFAULT (UUID()),
                                    activity_id CHAR(36) NOT NULL,
                                    account_id CHAR(36),
                                    contact_id CHAR(36),
                                    lead_id CHAR(36),
                                    opportunity_id CHAR(36),
                                    ticket_id CHAR(36),
                                    relation_role VARCHAR(255),
                                    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                    created_by CHAR(36),
                                    PRIMARY KEY (tenant_id, id),
                                    FOREIGN KEY (tenant_id, activity_id)
                                        REFERENCES crm_activities(tenant_id, id) ON DELETE CASCADE,
                                    FOREIGN KEY (tenant_id, account_id)
                                        REFERENCES crm_accounts(tenant_id, id) ON DELETE CASCADE,
                                    FOREIGN KEY (tenant_id, contact_id)
                                        REFERENCES crm_contacts(tenant_id, id) ON DELETE CASCADE,
                                    FOREIGN KEY (tenant_id, lead_id)
                                        REFERENCES crm_leads(tenant_id, id) ON DELETE CASCADE,
                                    FOREIGN KEY (tenant_id, opportunity_id)
                                        REFERENCES crm_opportunities(tenant_id, id) ON DELETE CASCADE,
                                    CHECK (((account_id IS NOT NULL) + (contact_id IS NOT NULL) + (lead_id IS NOT NULL) + (opportunity_id IS NOT NULL) + (ticket_id IS NOT NULL)) = 1)
) ENGINE=InnoDB;

CREATE TABLE crm_notes (
                           tenant_id CHAR(36) NOT NULL,
                           id CHAR(36) NOT NULL DEFAULT (UUID()),
                           title VARCHAR(255),
                           body LONGTEXT NOT NULL CHECK (TRIM(body) <> ''),
                           visibility VARCHAR(255) NOT NULL DEFAULT 'TENANT'
                               CHECK (visibility IN ('PRIVATE', 'TEAM', 'TENANT')),
                           owner_user_id CHAR(36),
                           account_id CHAR(36),
                           contact_id CHAR(36),
                           lead_id CHAR(36),
                           opportunity_id CHAR(36),
                           activity_id CHAR(36),
                           ticket_id CHAR(36),
                           created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                           updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                           created_by CHAR(36),
                           updated_by CHAR(36),
                           deleted_at DATETIME(6),
                           deleted_by CHAR(36),
                           version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                           PRIMARY KEY (tenant_id, id),
                           FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                           FOREIGN KEY (tenant_id, owner_user_id)
                               REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                           FOREIGN KEY (tenant_id, account_id)
                               REFERENCES crm_accounts(tenant_id, id) ON DELETE CASCADE,
                           FOREIGN KEY (tenant_id, contact_id)
                               REFERENCES crm_contacts(tenant_id, id) ON DELETE CASCADE,
                           FOREIGN KEY (tenant_id, lead_id)
                               REFERENCES crm_leads(tenant_id, id) ON DELETE CASCADE,
                           FOREIGN KEY (tenant_id, opportunity_id)
                               REFERENCES crm_opportunities(tenant_id, id) ON DELETE CASCADE,
                           FOREIGN KEY (tenant_id, activity_id)
                               REFERENCES crm_activities(tenant_id, id) ON DELETE CASCADE,
                           CHECK (((account_id IS NOT NULL) + (contact_id IS NOT NULL) + (lead_id IS NOT NULL) + (opportunity_id IS NOT NULL) + (activity_id IS NOT NULL) + (ticket_id IS NOT NULL)) = 1)
) ENGINE=InnoDB;

CREATE TABLE crm_tags (
                          tenant_id CHAR(36) NOT NULL,
                          id CHAR(36) NOT NULL DEFAULT (UUID()),
                          tag_key VARCHAR(191) NOT NULL,
                          name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                          description LONGTEXT,
                          color_hex varchar(7) CHECK (color_hex IS NULL OR REGEXP_LIKE(color_hex, '^#[0-9A-Fa-f]{6}$')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_by CHAR(36),
  updated_by CHAR(36),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
  UNIQUE (tenant_id, tag_key)
) ENGINE=InnoDB;

CREATE TABLE crm_entity_tags (
                                 tenant_id CHAR(36) NOT NULL,
                                 tag_id CHAR(36) NOT NULL,
                                 id CHAR(36) NOT NULL DEFAULT (UUID()),
                                 account_id CHAR(36),
                                 contact_id CHAR(36),
                                 lead_id CHAR(36),
                                 opportunity_id CHAR(36),
                                 activity_id CHAR(36),
                                 ticket_id CHAR(36),
                                 created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                 created_by CHAR(36),
                                 PRIMARY KEY (tenant_id, id),
                                 FOREIGN KEY (tenant_id, tag_id)
                                     REFERENCES crm_tags(tenant_id, id) ON DELETE CASCADE,
                                 FOREIGN KEY (tenant_id, account_id)
                                     REFERENCES crm_accounts(tenant_id, id) ON DELETE CASCADE,
                                 FOREIGN KEY (tenant_id, contact_id)
                                     REFERENCES crm_contacts(tenant_id, id) ON DELETE CASCADE,
                                 FOREIGN KEY (tenant_id, lead_id)
                                     REFERENCES crm_leads(tenant_id, id) ON DELETE CASCADE,
                                 FOREIGN KEY (tenant_id, opportunity_id)
                                     REFERENCES crm_opportunities(tenant_id, id) ON DELETE CASCADE,
                                 FOREIGN KEY (tenant_id, activity_id)
                                     REFERENCES crm_activities(tenant_id, id) ON DELETE CASCADE,
                                 CHECK (((account_id IS NOT NULL) + (contact_id IS NOT NULL) + (lead_id IS NOT NULL) + (opportunity_id IS NOT NULL) + (activity_id IS NOT NULL) + (ticket_id IS NOT NULL)) = 1)
) ENGINE=InnoDB;

CREATE TABLE crm_custom_field_definitions (
                                              tenant_id CHAR(36) NOT NULL,
                                              id CHAR(36) NOT NULL DEFAULT (UUID()),
                                              entity_type VARCHAR(191) NOT NULL
                                                  CHECK (entity_type IN ('ACCOUNT', 'CONTACT', 'LEAD', 'OPPORTUNITY', 'ACTIVITY', 'TICKET', 'PRODUCT')),
                                              field_key VARCHAR(191) NOT NULL,
                                              display_name VARCHAR(255) NOT NULL CHECK (TRIM(display_name) <> ''),
                                              data_type VARCHAR(191) NOT NULL
                                                  CHECK (data_type IN ('TEXT', 'LONG_TEXT', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'DATETIME', 'EMAIL', 'PHONE', 'URL', 'SELECT', 'MULTI_SELECT', 'JSON')),
                                              description LONGTEXT,
                                              validation_rules JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(validation_rules) = 'OBJECT'),
                                              option_values JSON NOT NULL DEFAULT (JSON_ARRAY())
    CHECK (JSON_TYPE(option_values) = 'ARRAY'),
                                              is_required BOOLEAN NOT NULL DEFAULT false,
                                              is_searchable BOOLEAN NOT NULL DEFAULT false,
                                              is_sensitive BOOLEAN NOT NULL DEFAULT false,
                                              is_active BOOLEAN NOT NULL DEFAULT true,
                                              display_order INT NOT NULL DEFAULT 0,
                                              created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                              updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                              created_by CHAR(36),
                                              updated_by CHAR(36),
                                              version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                              PRIMARY KEY (tenant_id, id),
                                              FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                              UNIQUE (tenant_id, entity_type, field_key)
) ENGINE=InnoDB;

CREATE TABLE crm_custom_field_values (
                                         tenant_id CHAR(36) NOT NULL,
                                         id CHAR(36) NOT NULL DEFAULT (UUID()),
                                         definition_id CHAR(36) NOT NULL,
                                         entity_type VARCHAR(191) NOT NULL
                                             CHECK (entity_type IN ('ACCOUNT', 'CONTACT', 'LEAD', 'OPPORTUNITY', 'ACTIVITY', 'TICKET', 'PRODUCT', 'QUOTE', 'ORDER', 'CONTRACT')),
                                         entity_id CHAR(36) NOT NULL,
                                         value_jsonb JSON NOT NULL,
                                         search_text VARCHAR(255),
                                         created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                         updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                         created_by CHAR(36),
                                         updated_by CHAR(36),
                                         version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                         PRIMARY KEY (tenant_id, id),
                                         FOREIGN KEY (tenant_id, definition_id)
                                             REFERENCES crm_custom_field_definitions(tenant_id, id) ON DELETE CASCADE,
                                         UNIQUE (tenant_id, definition_id, entity_id)
) ENGINE=InnoDB;

CREATE TABLE catalog_product_categories (
                                            tenant_id CHAR(36) NOT NULL,
                                            id CHAR(36) NOT NULL DEFAULT (UUID()),
                                            category_code VARCHAR(191) NOT NULL,
                                            name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                            parent_category_id CHAR(36),
                                            description LONGTEXT,
                                            is_active BOOLEAN NOT NULL DEFAULT true,
                                            created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                            updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                            created_by CHAR(36),
                                            updated_by CHAR(36),
                                            version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                            PRIMARY KEY (tenant_id, id),
                                            FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                            FOREIGN KEY (tenant_id, parent_category_id)
                                                REFERENCES catalog_product_categories(tenant_id, id)
                                                ON DELETE RESTRICT,
                                            UNIQUE (tenant_id, category_code)
) ENGINE=InnoDB;

CREATE TABLE catalog_products (
                                  tenant_id CHAR(36) NOT NULL,
                                  id CHAR(36) NOT NULL DEFAULT (UUID()),
                                  sku VARCHAR(255) NOT NULL,
                                  name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                  description LONGTEXT,
                                  category_id CHAR(36),
                                  product_type VARCHAR(191) NOT NULL DEFAULT 'PRODUCT'
                                      CHECK (product_type IN ('PRODUCT', 'SERVICE', 'SUBSCRIPTION', 'BUNDLE')),
                                  unit_of_measure VARCHAR(255) NOT NULL DEFAULT 'EA',
                                  tax_category VARCHAR(255),
                                  standard_cost DECIMAL(20,6) CHECK (standard_cost >= 0),
                                  cost_currency_code CHAR(3) CHECK (REGEXP_LIKE(cost_currency_code, '^[A-Z]{3}$')),
                                  is_active BOOLEAN NOT NULL DEFAULT true,
                                  metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                  created_by CHAR(36),
                                  updated_by CHAR(36),
                                  deleted_at DATETIME(6),
                                  deleted_by CHAR(36),
                                  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                  PRIMARY KEY (tenant_id, id),
                                  FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                  FOREIGN KEY (tenant_id, category_id)
                                      REFERENCES catalog_product_categories(tenant_id, id)
                                      ON DELETE RESTRICT,
                                  CHECK (standard_cost IS NULL OR cost_currency_code IS NOT NULL)
) ENGINE=InnoDB;

CREATE TABLE catalog_price_books (
                                     tenant_id CHAR(36) NOT NULL,
                                     id CHAR(36) NOT NULL DEFAULT (UUID()),
                                     price_book_code VARCHAR(191) NOT NULL,
                                     name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                     currency_code CHAR(3) NOT NULL CHECK (REGEXP_LIKE(currency_code, '^[A-Z]{3}$')),
                                     valid_from date,
                                     valid_to date,
                                     is_default BOOLEAN NOT NULL DEFAULT false,
                                     is_active BOOLEAN NOT NULL DEFAULT true,
                                     created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                     updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                     created_by CHAR(36),
                                     updated_by CHAR(36),
                                     version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                     PRIMARY KEY (tenant_id, id),
                                     FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                     UNIQUE (tenant_id, price_book_code),
                                     CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
) ENGINE=InnoDB;

CREATE TABLE catalog_price_book_items (
                                          tenant_id CHAR(36) NOT NULL,
                                          id CHAR(36) NOT NULL DEFAULT (UUID()),
                                          price_book_id CHAR(36) NOT NULL,
                                          product_id CHAR(36) NOT NULL,
                                          unit_price DECIMAL(20,6) NOT NULL CHECK (unit_price >= 0),
                                          minimum_quantity DECIMAL(20,6) NOT NULL DEFAULT 1 CHECK (minimum_quantity > 0),
                                          valid_from date,
                                          valid_to date,
                                          created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                          updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                          created_by CHAR(36),
                                          updated_by CHAR(36),
                                          version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                          PRIMARY KEY (tenant_id, id),
                                          FOREIGN KEY (tenant_id, price_book_id)
                                              REFERENCES catalog_price_books(tenant_id, id) ON DELETE CASCADE,
                                          FOREIGN KEY (tenant_id, product_id)
                                              REFERENCES catalog_products(tenant_id, id) ON DELETE RESTRICT,
                                          UNIQUE (tenant_id, price_book_id, product_id, minimum_quantity, valid_from),
                                          CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
) ENGINE=InnoDB;

CREATE TABLE sales_quotes (
                              tenant_id CHAR(36) NOT NULL,
                              id CHAR(36) NOT NULL DEFAULT (UUID()),
                              quote_number VARCHAR(191) NOT NULL,
                              revision_number INT NOT NULL DEFAULT 1 CHECK (revision_number > 0),
                              previous_quote_id CHAR(36),
                              account_id CHAR(36) NOT NULL,
                              contact_id CHAR(36),
                              opportunity_id CHAR(36),
                              price_book_id CHAR(36),
                              owner_user_id CHAR(36),
                              status VARCHAR(255) NOT NULL DEFAULT 'DRAFT'
                                  CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED')),
                              currency_code CHAR(3) NOT NULL CHECK (REGEXP_LIKE(currency_code, '^[A-Z]{3}$')),
                              exchange_rate_to_tenant_currency numeric(20,10)
                                  CHECK (exchange_rate_to_tenant_currency IS NULL OR exchange_rate_to_tenant_currency > 0),
                              issue_date date NOT NULL DEFAULT (CURRENT_DATE),
                              valid_until date,
                              payment_terms VARCHAR(255),
                              delivery_terms VARCHAR(255),
                              customer_reference VARCHAR(191),
                              billing_address_snapshot JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(billing_address_snapshot) = 'OBJECT'),
                              shipping_address_snapshot JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(shipping_address_snapshot) = 'OBJECT'),
                              subtotal DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
                              discount_total DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
                              tax_total DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
                              shipping_total DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (shipping_total >= 0),
                              grand_total DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (grand_total >= 0),
                              notes LONGTEXT,
                              approved_at DATETIME(6),
                              approved_by CHAR(36),
                              accepted_at DATETIME(6),
                              rejected_at DATETIME(6),
                              created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                              updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                              created_by CHAR(36),
                              updated_by CHAR(36),
                              version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                              PRIMARY KEY (tenant_id, id),
                              FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                              FOREIGN KEY (tenant_id, previous_quote_id)
                                  REFERENCES sales_quotes(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, account_id)
                                  REFERENCES crm_accounts(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, contact_id)
                                  REFERENCES crm_contacts(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, opportunity_id)
                                  REFERENCES crm_opportunities(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, price_book_id)
                                  REFERENCES catalog_price_books(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, owner_user_id)
                                  REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, approved_by)
                                  REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                              CHECK (valid_until IS NULL OR valid_until >= issue_date),
                              CHECK (approved_at IS NULL OR status IN ('APPROVED', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
                              CHECK (accepted_at IS NULL OR status = 'ACCEPTED'),
                              CHECK (rejected_at IS NULL OR status = 'REJECTED')
) ENGINE=InnoDB;

CREATE TABLE sales_quote_items (
                                   tenant_id CHAR(36) NOT NULL,
                                   id CHAR(36) NOT NULL DEFAULT (UUID()),
                                   quote_id CHAR(36) NOT NULL,
                                   line_number INT NOT NULL CHECK (line_number > 0),
                                   product_id CHAR(36),
                                   sku_snapshot VARCHAR(255),
                                   name_snapshot VARCHAR(255) NOT NULL CHECK (TRIM(name_snapshot) <> ''),
                                   description_snapshot VARCHAR(255),
                                   unit_of_measure_snapshot VARCHAR(255),
                                   quantity DECIMAL(20,6) NOT NULL CHECK (quantity > 0),
                                   unit_price DECIMAL(20,6) NOT NULL CHECK (unit_price >= 0),
                                   discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
                                   discount_amount DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
                                   tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (tax_percent >= 0 AND tax_percent <= 100),
                                   tax_amount DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
                                   line_subtotal DECIMAL(20,6) NOT NULL CHECK (line_subtotal >= 0),
                                   line_total DECIMAL(20,6) NOT NULL CHECK (line_total >= 0),
                                   metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                   created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                   updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                   created_by CHAR(36),
                                   updated_by CHAR(36),
                                   version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                   PRIMARY KEY (tenant_id, id),
                                   FOREIGN KEY (tenant_id, quote_id)
                                       REFERENCES sales_quotes(tenant_id, id) ON DELETE CASCADE,
                                   FOREIGN KEY (tenant_id, product_id)
                                       REFERENCES catalog_products(tenant_id, id) ON DELETE RESTRICT,
                                   UNIQUE (tenant_id, quote_id, line_number)
) ENGINE=InnoDB;

CREATE TABLE sales_quote_approvals (
                                       tenant_id CHAR(36) NOT NULL,
                                       id CHAR(36) NOT NULL DEFAULT (UUID()),
                                       quote_id CHAR(36) NOT NULL,
                                       approval_level INT NOT NULL DEFAULT 1 CHECK (approval_level > 0),
                                       approver_user_id CHAR(36) NOT NULL,
                                       status VARCHAR(255) NOT NULL DEFAULT 'PENDING'
                                           CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
                                       decision_note VARCHAR(255),
                                       requested_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                       decided_at DATETIME(6),
                                       created_by CHAR(36),
                                       PRIMARY KEY (tenant_id, id),
                                       FOREIGN KEY (tenant_id, quote_id)
                                           REFERENCES sales_quotes(tenant_id, id) ON DELETE CASCADE,
                                       FOREIGN KEY (tenant_id, approver_user_id)
                                           REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                       UNIQUE (tenant_id, quote_id, approval_level, approver_user_id),
                                       CHECK (decided_at IS NULL OR status IN ('APPROVED', 'REJECTED', 'CANCELLED'))
) ENGINE=InnoDB;

CREATE TABLE sales_orders (
                              tenant_id CHAR(36) NOT NULL,
                              id CHAR(36) NOT NULL DEFAULT (UUID()),
                              order_number VARCHAR(191) NOT NULL,
                              account_id CHAR(36) NOT NULL,
                              contact_id CHAR(36),
                              opportunity_id CHAR(36),
                              quote_id CHAR(36),
                              owner_user_id CHAR(36),
                              status VARCHAR(255) NOT NULL DEFAULT 'DRAFT'
                                  CHECK (status IN ('DRAFT', 'CONFIRMED', 'PROCESSING', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED')),
                              currency_code CHAR(3) NOT NULL CHECK (REGEXP_LIKE(currency_code, '^[A-Z]{3}$')),
                              order_date date NOT NULL DEFAULT (CURRENT_DATE),
                              requested_delivery_date date,
                              customer_reference VARCHAR(191),
                              billing_address_snapshot JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(billing_address_snapshot) = 'OBJECT'),
                              shipping_address_snapshot JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(shipping_address_snapshot) = 'OBJECT'),
                              subtotal DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
                              discount_total DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
                              tax_total DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
                              shipping_total DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (shipping_total >= 0),
                              grand_total DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (grand_total >= 0),
                              confirmed_at DATETIME(6),
                              fulfilled_at DATETIME(6),
                              cancelled_at DATETIME(6),
                              cancellation_reason VARCHAR(255),
                              created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                              updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                              created_by CHAR(36),
                              updated_by CHAR(36),
                              version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                              PRIMARY KEY (tenant_id, id),
                              FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                              FOREIGN KEY (tenant_id, account_id)
                                  REFERENCES crm_accounts(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, contact_id)
                                  REFERENCES crm_contacts(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, opportunity_id)
                                  REFERENCES crm_opportunities(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, quote_id)
                                  REFERENCES sales_quotes(tenant_id, id) ON DELETE RESTRICT,
                              FOREIGN KEY (tenant_id, owner_user_id)
                                  REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                              UNIQUE (tenant_id, order_number),
                              CHECK (requested_delivery_date IS NULL OR requested_delivery_date >= order_date),
                              CHECK (confirmed_at IS NULL OR status <> 'DRAFT'),
                              CHECK (fulfilled_at IS NULL OR status = 'FULFILLED'),
                              CHECK (cancelled_at IS NULL OR status = 'CANCELLED')
) ENGINE=InnoDB;

CREATE TABLE sales_order_items (
                                   tenant_id CHAR(36) NOT NULL,
                                   id CHAR(36) NOT NULL DEFAULT (UUID()),
                                   order_id CHAR(36) NOT NULL,
                                   line_number INT NOT NULL CHECK (line_number > 0),
                                   product_id CHAR(36),
                                   quote_item_id CHAR(36),
                                   sku_snapshot VARCHAR(255),
                                   name_snapshot VARCHAR(255) NOT NULL CHECK (TRIM(name_snapshot) <> ''),
                                   description_snapshot VARCHAR(255),
                                   unit_of_measure_snapshot VARCHAR(255),
                                   quantity DECIMAL(20,6) NOT NULL CHECK (quantity > 0),
                                   fulfilled_quantity numeric(20,6) NOT NULL DEFAULT 0 CHECK (fulfilled_quantity >= 0),
                                   unit_price DECIMAL(20,6) NOT NULL CHECK (unit_price >= 0),
                                   discount_amount DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
                                   tax_amount DECIMAL(20,6) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
                                   line_total DECIMAL(20,6) NOT NULL CHECK (line_total >= 0),
                                   created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                   updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                   created_by CHAR(36),
                                   updated_by CHAR(36),
                                   version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                   PRIMARY KEY (tenant_id, id),
                                   FOREIGN KEY (tenant_id, order_id)
                                       REFERENCES sales_orders(tenant_id, id) ON DELETE CASCADE,
                                   FOREIGN KEY (tenant_id, product_id)
                                       REFERENCES catalog_products(tenant_id, id) ON DELETE RESTRICT,
                                   FOREIGN KEY (tenant_id, quote_item_id)
                                       REFERENCES sales_quote_items(tenant_id, id) ON DELETE RESTRICT,
                                   UNIQUE (tenant_id, order_id, line_number),
                                   CHECK (fulfilled_quantity <= quantity)
) ENGINE=InnoDB;

CREATE TABLE sales_contracts (
                                 tenant_id CHAR(36) NOT NULL,
                                 id CHAR(36) NOT NULL DEFAULT (UUID()),
                                 contract_number VARCHAR(191) NOT NULL,
                                 account_id CHAR(36) NOT NULL,
                                 contact_id CHAR(36),
                                 opportunity_id CHAR(36),
                                 quote_id CHAR(36),
                                 order_id CHAR(36),
                                 owner_user_id CHAR(36),
                                 contract_type VARCHAR(191) NOT NULL DEFAULT 'CUSTOMER'
                                     CHECK (contract_type IN ('CUSTOMER', 'SUBSCRIPTION', 'SERVICE', 'FRAMEWORK', 'NDA', 'OTHER')),
                                 status VARCHAR(255) NOT NULL DEFAULT 'DRAFT'
                                     CHECK (status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'SENT_FOR_SIGNATURE', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'CANCELLED')),
                                 currency_code CHAR(3) CHECK (REGEXP_LIKE(currency_code, '^[A-Z]{3}$')),
                                 contract_value DECIMAL(20,6) CHECK (contract_value >= 0),
                                 effective_from date,
                                 effective_to date,
                                 auto_renew BOOLEAN NOT NULL DEFAULT false,
                                 renewal_notice_days INT CHECK (renewal_notice_days IS NULL OR renewal_notice_days >= 0),
                                 signed_at DATETIME(6),
                                 terminated_at DATETIME(6),
                                 termination_reason VARCHAR(255),
                                 document_reference VARCHAR(191),
                                 terms_snapshot JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(terms_snapshot) = 'OBJECT'),
                                 created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                 updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                 created_by CHAR(36),
                                 updated_by CHAR(36),
                                 version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                 PRIMARY KEY (tenant_id, id),
                                 FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                 FOREIGN KEY (tenant_id, account_id)
                                     REFERENCES crm_accounts(tenant_id, id) ON DELETE RESTRICT,
                                 FOREIGN KEY (tenant_id, contact_id)
                                     REFERENCES crm_contacts(tenant_id, id) ON DELETE RESTRICT,
                                 FOREIGN KEY (tenant_id, opportunity_id)
                                     REFERENCES crm_opportunities(tenant_id, id) ON DELETE RESTRICT,
                                 FOREIGN KEY (tenant_id, quote_id)
                                     REFERENCES sales_quotes(tenant_id, id) ON DELETE RESTRICT,
                                 FOREIGN KEY (tenant_id, order_id)
                                     REFERENCES sales_orders(tenant_id, id) ON DELETE RESTRICT,
                                 FOREIGN KEY (tenant_id, owner_user_id)
                                     REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                 UNIQUE (tenant_id, contract_number),
                                 CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from),
                                 CHECK (contract_value IS NULL OR currency_code IS NOT NULL),
                                 CHECK (signed_at IS NULL OR status IN ('ACTIVE', 'EXPIRED', 'TERMINATED')),
                                 CHECK (terminated_at IS NULL OR status = 'TERMINATED')
) ENGINE=InnoDB;

CREATE TABLE marketing_campaigns (
                                     tenant_id CHAR(36) NOT NULL,
                                     id CHAR(36) NOT NULL DEFAULT (UUID()),
                                     campaign_code VARCHAR(191) NOT NULL,
                                     name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                     campaign_type VARCHAR(191) NOT NULL
                                         CHECK (campaign_type IN ('EMAIL', 'EVENT', 'WEBINAR', 'ADVERTISING', 'SOCIAL', 'PARTNER', 'DIRECT_MAIL', 'OTHER')),
                                     status VARCHAR(255) NOT NULL DEFAULT 'PLANNED'
                                         CHECK (status IN ('PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
                                     owner_user_id CHAR(36),
                                     start_at DATETIME(6),
                                     end_at DATETIME(6),
                                     budget DECIMAL(20,6) CHECK (budget >= 0),
                                     actual_cost DECIMAL(20,6) CHECK (actual_cost >= 0),
                                     currency_code CHAR(3) CHECK (REGEXP_LIKE(currency_code, '^[A-Z]{3}$')),
                                     expected_revenue DECIMAL(20,6) CHECK (expected_revenue >= 0),
                                     description LONGTEXT,
                                     utm_source VARCHAR(255),
                                     utm_medium VARCHAR(255),
                                     utm_campaign VARCHAR(255),
                                     created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                     updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                     created_by CHAR(36),
                                     updated_by CHAR(36),
                                     deleted_at DATETIME(6),
                                     deleted_by CHAR(36),
                                     version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                     PRIMARY KEY (tenant_id, id),
                                     FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                     FOREIGN KEY (tenant_id, owner_user_id)
                                         REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                     CHECK (end_at IS NULL OR start_at IS NULL OR end_at >= start_at),
                                     CHECK (((budget IS NOT NULL) + (actual_cost IS NOT NULL) + (expected_revenue IS NOT NULL)) = 0 OR currency_code IS NOT NULL)
) ENGINE=InnoDB;

CREATE TABLE marketing_campaign_members (
                                            tenant_id CHAR(36) NOT NULL,
                                            id CHAR(36) NOT NULL DEFAULT (UUID()),
                                            campaign_id CHAR(36) NOT NULL,
                                            lead_id CHAR(36),
                                            contact_id CHAR(36),
                                            member_status VARCHAR(191) NOT NULL DEFAULT 'SENT'
                                                CHECK (member_status IN ('PLANNED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'RESPONDED', 'ATTENDED', 'BOUNCED', 'OPTED_OUT')),
                                            source_detail VARCHAR(255),
                                            first_responded_at DATETIME(6),
                                            last_engaged_at DATETIME(6),
                                            metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                            created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                            updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                            created_by CHAR(36),
                                            updated_by CHAR(36),
                                            version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                            PRIMARY KEY (tenant_id, id),
                                            FOREIGN KEY (tenant_id, campaign_id)
                                                REFERENCES marketing_campaigns(tenant_id, id) ON DELETE CASCADE,
                                            FOREIGN KEY (tenant_id, lead_id)
                                                REFERENCES crm_leads(tenant_id, id) ON DELETE CASCADE,
                                            FOREIGN KEY (tenant_id, contact_id)
                                                REFERENCES crm_contacts(tenant_id, id) ON DELETE CASCADE,
                                            CHECK (((lead_id IS NOT NULL) + (contact_id IS NOT NULL)) = 1)
) ENGINE=InnoDB;

CREATE TABLE service_ticket_categories (
                                           tenant_id CHAR(36) NOT NULL,
                                           id CHAR(36) NOT NULL DEFAULT (UUID()),
                                           category_code VARCHAR(191) NOT NULL,
                                           name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                           parent_category_id CHAR(36),
                                           default_team_id CHAR(36),
                                           description LONGTEXT,
                                           is_active BOOLEAN NOT NULL DEFAULT true,
                                           created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                           updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                           created_by CHAR(36),
                                           updated_by CHAR(36),
                                           version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                           PRIMARY KEY (tenant_id, id),
                                           FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                           FOREIGN KEY (tenant_id, parent_category_id)
                                               REFERENCES service_ticket_categories(tenant_id, id)
                                               ON DELETE RESTRICT,
                                           FOREIGN KEY (tenant_id, default_team_id)
                                               REFERENCES platform_teams(tenant_id, id)
                                               ON DELETE RESTRICT,
                                           UNIQUE (tenant_id, category_code)
) ENGINE=InnoDB;

CREATE TABLE service_sla_policies (
                                      tenant_id CHAR(36) NOT NULL,
                                      id CHAR(36) NOT NULL DEFAULT (UUID()),
                                      policy_code VARCHAR(191) NOT NULL,
                                      name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                      priority VARCHAR(255) NOT NULL
                                          CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
                                      first_response_minutes INT NOT NULL CHECK (first_response_minutes > 0),
                                      resolution_minutes INT NOT NULL CHECK (resolution_minutes > 0),
                                      business_hours_calendar_key VARCHAR(191),
                                      pause_on_statuses JSON NOT NULL DEFAULT (JSON_ARRAY('WAITING_CUSTOMER')),
                                      is_default BOOLEAN NOT NULL DEFAULT false,
                                      is_active BOOLEAN NOT NULL DEFAULT true,
                                      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                      updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                      created_by CHAR(36),
                                      updated_by CHAR(36),
                                      version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                      PRIMARY KEY (tenant_id, id),
                                      FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                      UNIQUE (tenant_id, policy_code),
                                      CHECK (resolution_minutes >= first_response_minutes)
) ENGINE=InnoDB;

CREATE TABLE service_tickets (
                                 tenant_id CHAR(36) NOT NULL,
                                 id CHAR(36) NOT NULL DEFAULT (UUID()),
                                 ticket_number VARCHAR(191) NOT NULL,
                                 account_id CHAR(36),
                                 contact_id CHAR(36),
                                 subject VARCHAR(255) NOT NULL CHECK (TRIM(subject) <> ''),
                                 description LONGTEXT,
                                 channel VARCHAR(255) NOT NULL DEFAULT 'WEB'
                                     CHECK (channel IN ('EMAIL', 'PHONE', 'WEB', 'CHAT', 'SOCIAL', 'API', 'INTERNAL', 'OTHER')),
                                 category_id CHAR(36),
                                 priority VARCHAR(255) NOT NULL DEFAULT 'NORMAL'
                                     CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
                                 severity VARCHAR(255)
                                     CHECK (severity IS NULL OR severity IN ('S1', 'S2', 'S3', 'S4')),
                                 status VARCHAR(255) NOT NULL DEFAULT 'NEW'
                                     CHECK (status IN ('NEW', 'OPEN', 'PENDING', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED')),
                                 assigned_user_id CHAR(36),
                                 assigned_team_id CHAR(36),
                                 owner_user_id CHAR(36),
                                 sla_policy_id CHAR(36),
                                 external_reference VARCHAR(191),
                                 first_response_due_at DATETIME(6),
                                 resolution_due_at DATETIME(6),
                                 first_responded_at DATETIME(6),
                                 resolved_at DATETIME(6),
                                 closed_at DATETIME(6),
                                 satisfaction_score SMALLINT CHECK (satisfaction_score IS NULL OR satisfaction_score BETWEEN 1 AND 5),
                                 satisfaction_comment VARCHAR(255),
                                 created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                 updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                 created_by CHAR(36),
                                 updated_by CHAR(36),
                                 version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                 PRIMARY KEY (tenant_id, id),
                                 FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                 FOREIGN KEY (tenant_id, account_id)
                                     REFERENCES crm_accounts(tenant_id, id) ON DELETE RESTRICT,
                                 FOREIGN KEY (tenant_id, contact_id)
                                     REFERENCES crm_contacts(tenant_id, id) ON DELETE RESTRICT,
                                 FOREIGN KEY (tenant_id, category_id)
                                     REFERENCES service_ticket_categories(tenant_id, id) ON DELETE RESTRICT,
                                 FOREIGN KEY (tenant_id, assigned_user_id)
                                     REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                 FOREIGN KEY (tenant_id, assigned_team_id)
                                     REFERENCES platform_teams(tenant_id, id) ON DELETE RESTRICT,
                                 FOREIGN KEY (tenant_id, owner_user_id)
                                     REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                 FOREIGN KEY (tenant_id, sla_policy_id)
                                     REFERENCES service_sla_policies(tenant_id, id) ON DELETE RESTRICT,
                                 UNIQUE (tenant_id, ticket_number),
                                 CHECK (((account_id IS NOT NULL) + (contact_id IS NOT NULL)) >= 1),
                                 CHECK (resolved_at IS NULL OR status IN ('RESOLVED', 'CLOSED')),
                                 CHECK (closed_at IS NULL OR status = 'CLOSED')
) ENGINE=InnoDB;

CREATE TABLE service_ticket_comments (
                                         tenant_id CHAR(36) NOT NULL,
                                         id CHAR(36) NOT NULL DEFAULT (UUID()),
                                         ticket_id CHAR(36) NOT NULL,
                                         author_user_id CHAR(36),
                                         author_contact_id CHAR(36),
                                         body LONGTEXT NOT NULL CHECK (TRIM(body) <> ''),
                                         visibility VARCHAR(255) NOT NULL DEFAULT 'PUBLIC'
                                             CHECK (visibility IN ('PUBLIC', 'INTERNAL')),
                                         channel VARCHAR(255),
                                         external_message_id VARCHAR(255),
                                         created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                         updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                         created_by CHAR(36),
                                         updated_by CHAR(36),
                                         deleted_at DATETIME(6),
                                         deleted_by CHAR(36),
                                         version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                         PRIMARY KEY (tenant_id, id),
                                         FOREIGN KEY (tenant_id, ticket_id)
                                             REFERENCES service_tickets(tenant_id, id) ON DELETE CASCADE,
                                         FOREIGN KEY (tenant_id, author_user_id)
                                             REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                         FOREIGN KEY (tenant_id, author_contact_id)
                                             REFERENCES crm_contacts(tenant_id, id) ON DELETE RESTRICT,
                                         CHECK (((author_user_id IS NOT NULL) + (author_contact_id IS NOT NULL)) <= 1)
) ENGINE=InnoDB;

CREATE TABLE service_ticket_events (
                                       tenant_id CHAR(36) NOT NULL,
                                       occurred_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                       id CHAR(36) NOT NULL DEFAULT (UUID()),
                                       ticket_id CHAR(36) NOT NULL,
                                       event_type VARCHAR(191) NOT NULL,
                                       field_name VARCHAR(255),
                                       old_value JSON,
                                       new_value JSON,
                                       actor_user_id CHAR(36),
                                       request_id CHAR(36),
                                       metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                       PRIMARY KEY (tenant_id, occurred_at, id),
                                       FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                       FOREIGN KEY (tenant_id, ticket_id)
                                           REFERENCES service_tickets(tenant_id, id) ON DELETE CASCADE,
                                       FOREIGN KEY (tenant_id, actor_user_id)
                                           REFERENCES platform_tenant_memberships(tenant_id, user_id)
                                           ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE privacy_consents (
                                  tenant_id CHAR(36) NOT NULL,
                                  id CHAR(36) NOT NULL DEFAULT (UUID()),
                                  account_id CHAR(36),
                                  contact_id CHAR(36),
                                  lead_id CHAR(36),
                                  channel VARCHAR(255) NOT NULL
                                      CHECK (channel IN ('EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'PUSH', 'POSTAL', 'OTHER')),
                                  purpose VARCHAR(255) NOT NULL,
                                  lawful_basis VARCHAR(255) NOT NULL
                                      CHECK (lawful_basis IN ('CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS')),
                                  consent_status VARCHAR(191) NOT NULL
                                      CHECK (consent_status IN ('GRANTED', 'DENIED', 'WITHDRAWN', 'EXPIRED')),
                                  policy_version VARCHAR(255),
                                  source VARCHAR(255),
                                  proof_reference VARCHAR(191),
                                  captured_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                  effective_from DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                  expires_at DATETIME(6),
                                  withdrawn_at DATETIME(6),
                                  recorded_by CHAR(36),
                                  metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                  PRIMARY KEY (tenant_id, id),
                                  FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                  FOREIGN KEY (tenant_id, account_id)
                                      REFERENCES crm_accounts(tenant_id, id) ON DELETE CASCADE,
                                  FOREIGN KEY (tenant_id, contact_id)
                                      REFERENCES crm_contacts(tenant_id, id) ON DELETE CASCADE,
                                  FOREIGN KEY (tenant_id, lead_id)
                                      REFERENCES crm_leads(tenant_id, id) ON DELETE CASCADE,
                                  FOREIGN KEY (tenant_id, recorded_by)
                                      REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                  CHECK (((account_id IS NOT NULL) + (contact_id IS NOT NULL) + (lead_id IS NOT NULL)) = 1),
                                  CHECK (expires_at IS NULL OR expires_at > effective_from),
                                  CHECK (withdrawn_at IS NULL OR consent_status = 'WITHDRAWN')
) ENGINE=InnoDB;

CREATE TABLE privacy_retention_policies (
                                            tenant_id CHAR(36) NOT NULL,
                                            id CHAR(36) NOT NULL DEFAULT (UUID()),
                                            entity_type VARCHAR(191) NOT NULL,
                                            purpose VARCHAR(255) NOT NULL,
                                            retention_days INT NOT NULL CHECK (retention_days >= 0),
                                            action_on_expiry VARCHAR(255) NOT NULL
                                                CHECK (action_on_expiry IN ('DELETE', 'ANONYMIZE', 'ARCHIVE', 'REVIEW')),
                                            legal_basis VARCHAR(255),
                                            is_active BOOLEAN NOT NULL DEFAULT true,
                                            created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                            updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                            created_by CHAR(36),
                                            updated_by CHAR(36),
                                            version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                            PRIMARY KEY (tenant_id, id),
                                            FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                            UNIQUE (tenant_id, entity_type, purpose)
) ENGINE=InnoDB;

CREATE TABLE privacy_data_subject_requests (
                                               tenant_id CHAR(36) NOT NULL,
                                               id CHAR(36) NOT NULL DEFAULT (UUID()),
                                               request_number VARCHAR(191) NOT NULL,
                                               request_type VARCHAR(191) NOT NULL
                                                   CHECK (request_type IN ('ACCESS', 'RECTIFICATION', 'ERASURE', 'RESTRICTION', 'PORTABILITY', 'OBJECTION')),
                                               account_id CHAR(36),
                                               contact_id CHAR(36),
                                               lead_id CHAR(36),
                                               requester_email VARCHAR(320),
                                               status VARCHAR(255) NOT NULL DEFAULT 'RECEIVED'
                                                   CHECK (status IN ('RECEIVED', 'IDENTITY_VERIFICATION', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED')),
                                               received_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                               due_at DATETIME(6),
                                               completed_at DATETIME(6),
                                               assigned_user_id CHAR(36),
                                               verification_reference VARCHAR(191),
                                               resolution_summary VARCHAR(255),
                                               rejection_reason LONGTEXT,
                                               created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                               updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                               created_by CHAR(36),
                                               updated_by CHAR(36),
                                               version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                               PRIMARY KEY (tenant_id, id),
                                               FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                               FOREIGN KEY (tenant_id, account_id)
                                                   REFERENCES crm_accounts(tenant_id, id) ON DELETE RESTRICT,
                                               FOREIGN KEY (tenant_id, contact_id)
                                                   REFERENCES crm_contacts(tenant_id, id) ON DELETE RESTRICT,
                                               FOREIGN KEY (tenant_id, lead_id)
                                                   REFERENCES crm_leads(tenant_id, id) ON DELETE RESTRICT,
                                               FOREIGN KEY (tenant_id, assigned_user_id)
                                                   REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                               UNIQUE (tenant_id, request_number),
                                               CHECK (((account_id IS NOT NULL) + (contact_id IS NOT NULL) + (lead_id IS NOT NULL) + (requester_email IS NOT NULL)) >= 1),
                                               CHECK (due_at IS NULL OR due_at >= received_at),
                                               CHECK (completed_at IS NULL OR status = 'COMPLETED')
) ENGINE=InnoDB;

CREATE TABLE privacy_legal_holds (
                                     tenant_id CHAR(36) NOT NULL,
                                     id CHAR(36) NOT NULL DEFAULT (UUID()),
                                     hold_code VARCHAR(191) NOT NULL,
                                     name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                     entity_type VARCHAR(191) NOT NULL,
                                     entity_id CHAR(36),
                                     scope_filter JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(scope_filter) = 'OBJECT'),
                                     reason VARCHAR(255) NOT NULL CHECK (TRIM(reason) <> ''),
                                     effective_from DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                     released_at DATETIME(6),
                                     released_by CHAR(36),
                                     created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                     created_by CHAR(36),
                                     PRIMARY KEY (tenant_id, id),
                                     FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                     FOREIGN KEY (tenant_id, released_by)
                                         REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                     UNIQUE (tenant_id, hold_code),
                                     CHECK (released_at IS NULL OR released_at >= effective_from)
) ENGINE=InnoDB;

CREATE TABLE integration_external_id_mappings (
                                                  tenant_id CHAR(36) NOT NULL,
                                                  id CHAR(36) NOT NULL DEFAULT (UUID()),
                                                  integration_key VARCHAR(191) NOT NULL,
                                                  entity_type VARCHAR(191) NOT NULL,
                                                  internal_entity_id CHAR(36) NOT NULL,
                                                  external_entity_id VARCHAR(255) NOT NULL,
                                                  external_version VARCHAR(255),
                                                  last_synced_at DATETIME(6),
                                                  metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                                  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                                  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                                  created_by CHAR(36),
                                                  updated_by CHAR(36),
                                                  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                                  PRIMARY KEY (tenant_id, id),
                                                  FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                                  UNIQUE (tenant_id, integration_key, entity_type, external_entity_id),
                                                  UNIQUE (tenant_id, integration_key, entity_type, internal_entity_id)
) ENGINE=InnoDB;

CREATE TABLE integration_outbox_events (
                                           tenant_id CHAR(36) NOT NULL,
                                           created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                           id CHAR(36) NOT NULL DEFAULT (UUID()),
                                           aggregate_type VARCHAR(191) NOT NULL,
                                           aggregate_id CHAR(36) NOT NULL,
                                           event_type VARCHAR(191) NOT NULL,
                                           event_version INT NOT NULL DEFAULT 1 CHECK (event_version > 0),
                                           payload JSON NOT NULL CHECK (JSON_TYPE(payload) = 'OBJECT'),
                                           headers JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(headers) = 'OBJECT'),
                                           correlation_id CHAR(36),
                                           causation_id CHAR(36),
                                           deduplication_key VARCHAR(191),
                                           status VARCHAR(255) NOT NULL DEFAULT 'PENDING'
                                               CHECK (status IN ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED', 'DEAD')),
                                           available_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                           locked_at DATETIME(6),
                                           locked_by VARCHAR(255),
                                           published_at DATETIME(6),
                                           retry_count INT NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
                                           last_error VARCHAR(255),
                                           PRIMARY KEY (tenant_id, created_at, id),
                                           FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                           CHECK (published_at IS NULL OR status = 'PUBLISHED')
) ENGINE=InnoDB;

CREATE TABLE integration_webhook_subscriptions (
                                                   tenant_id CHAR(36) NOT NULL,
                                                   id CHAR(36) NOT NULL DEFAULT (UUID()),
                                                   name VARCHAR(255) NOT NULL CHECK (TRIM(name) <> ''),
                                                   endpoint_url TEXT NOT NULL CHECK (TRIM(endpoint_url) <> ''),
                                                   event_types JSON NOT NULL CHECK (JSON_LENGTH(event_types) > 0),
                                                   secret_reference VARCHAR(191),
                                                   signature_algorithm VARCHAR(255) NOT NULL DEFAULT 'HMAC_SHA256'
                                                       CHECK (signature_algorithm IN ('HMAC_SHA256', 'HMAC_SHA512', 'NONE')),
                                                   custom_headers JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(custom_headers) = 'OBJECT'),
                                                   timeout_seconds INT NOT NULL DEFAULT 10 CHECK (timeout_seconds BETWEEN 1 AND 120),
                                                   max_retries INT NOT NULL DEFAULT 8 CHECK (max_retries BETWEEN 0 AND 100),
                                                   status VARCHAR(255) NOT NULL DEFAULT 'ACTIVE'
                                                       CHECK (status IN ('ACTIVE', 'PAUSED', 'DISABLED')),
                                                   last_success_at DATETIME(6),
                                                   last_failure_at DATETIME(6),
                                                   created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                                   updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                                   created_by CHAR(36),
                                                   updated_by CHAR(36),
                                                   version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                                   PRIMARY KEY (tenant_id, id),
                                                   FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE integration_webhook_deliveries (
                                                tenant_id CHAR(36) NOT NULL,
                                                created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                                id CHAR(36) NOT NULL DEFAULT (UUID()),
                                                subscription_id CHAR(36) NOT NULL,
                                                outbox_event_id CHAR(36),
                                                event_type VARCHAR(191) NOT NULL,
                                                attempt_number INT NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
                                                request_headers JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(request_headers) = 'OBJECT'),
                                                response_status INT CHECK (response_status IS NULL OR response_status BETWEEN 100 AND 599),
                                                response_headers JSON,
                                                response_body_excerpt VARCHAR(255),
                                                status VARCHAR(255) NOT NULL DEFAULT 'PENDING'
                                                    CHECK (status IN ('PENDING', 'SENDING', 'SUCCEEDED', 'FAILED', 'DEAD')),
                                                next_attempt_at DATETIME(6),
                                                started_at DATETIME(6),
                                                completed_at DATETIME(6),
                                                duration_ms INT CHECK (duration_ms IS NULL OR duration_ms >= 0),
                                                error_message LONGTEXT,
                                                PRIMARY KEY (tenant_id, created_at, id),
                                                FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                                FOREIGN KEY (tenant_id, subscription_id)
                                                    REFERENCES integration_webhook_subscriptions(tenant_id, id) ON DELETE CASCADE,
                                                CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
) ENGINE=InnoDB;

CREATE TABLE integration_idempotency_keys (
                                              tenant_id CHAR(36) NOT NULL,
                                              idempotency_key VARCHAR(191) NOT NULL,
                                              operation_scope VARCHAR(255) NOT NULL,
                                              request_hash VARCHAR(255) NOT NULL,
                                              response_status INT,
                                              response_body JSON,
                                              resource_type VARCHAR(191),
                                              resource_id CHAR(36),
                                              locked_until DATETIME(6),
                                              created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                              expires_at DATETIME(6) NOT NULL,
                                              PRIMARY KEY (tenant_id, operation_scope, idempotency_key),
                                              FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                              CHECK (expires_at > created_at)
) ENGINE=InnoDB;

CREATE TABLE integration_import_jobs (
                                         tenant_id CHAR(36) NOT NULL,
                                         id CHAR(36) NOT NULL DEFAULT (UUID()),
                                         job_type VARCHAR(191) NOT NULL,
                                         source_type VARCHAR(191) NOT NULL
                                             CHECK (source_type IN ('CSV', 'XLSX', 'API', 'CONNECTOR', 'OTHER')),
                                         source_reference VARCHAR(191),
                                         target_entity_type VARCHAR(191) NOT NULL,
                                         status VARCHAR(255) NOT NULL DEFAULT 'PENDING'
                                             CHECK (status IN ('PENDING', 'VALIDATING', 'RUNNING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED', 'CANCELLED')),
                                         total_rows bigint CHECK (total_rows IS NULL OR total_rows >= 0),
                                         processed_rows bigint NOT NULL DEFAULT 0 CHECK (processed_rows >= 0),
                                         success_rows bigint NOT NULL DEFAULT 0 CHECK (success_rows >= 0),
                                         error_rows bigint NOT NULL DEFAULT 0 CHECK (error_rows >= 0),
                                         mapping_config JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(mapping_config) = 'OBJECT'),
                                         error_report_reference VARCHAR(191),
                                         started_at DATETIME(6),
                                         completed_at DATETIME(6),
                                         requested_by CHAR(36),
                                         created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                         updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                         created_by CHAR(36),
                                         updated_by CHAR(36),
                                         version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
                                         PRIMARY KEY (tenant_id, id),
                                         FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                         FOREIGN KEY (tenant_id, requested_by)
                                             REFERENCES platform_tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT,
                                         CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at),
                                         CHECK (success_rows + error_rows <= processed_rows),
                                         CHECK (total_rows IS NULL OR processed_rows <= total_rows)
) ENGINE=InnoDB;

CREATE TABLE audit_audit_events (
                                    tenant_id CHAR(36) NOT NULL,
                                    occurred_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                    id CHAR(36) NOT NULL DEFAULT (UUID()),
                                    schema_name VARCHAR(255) NOT NULL,
                                    table_name VARCHAR(255) NOT NULL,
                                    aggregate_type VARCHAR(191) NOT NULL,
                                    aggregate_id CHAR(36),
                                    action VARCHAR(255) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_fields JSON NOT NULL DEFAULT (JSON_ARRAY())
    CHECK (JSON_TYPE(changed_fields) = 'ARRAY'),
  old_values JSON,
  new_values JSON,
  actor_user_id CHAR(36),
  actor_type VARCHAR(191) NOT NULL DEFAULT 'USER'
    CHECK (actor_type IN ('USER', 'SYSTEM', 'INTEGRATION', 'SUPPORT')),
  request_id CHAR(36),
  correlation_id CHAR(36),
  source_ip VARCHAR(45),
  user_agent VARCHAR(255),
  application_name VARCHAR(255),
  PRIMARY KEY (tenant_id, occurred_at, id),
  FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, actor_user_id)
    REFERENCES platform_tenant_memberships(tenant_id, user_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE audit_data_access_events (
                                          tenant_id CHAR(36) NOT NULL,
                                          occurred_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                          id CHAR(36) NOT NULL DEFAULT (UUID()),
                                          entity_type VARCHAR(191) NOT NULL,
                                          entity_id CHAR(36),
                                          access_type VARCHAR(191) NOT NULL
                                              CHECK (access_type IN ('VIEW', 'EXPORT', 'DOWNLOAD', 'SEARCH', 'DECRYPT')),
                                          fields_accessed JSON NOT NULL DEFAULT (JSON_ARRAY()),
                                          actor_user_id CHAR(36),
                                          actor_type VARCHAR(191) NOT NULL DEFAULT 'USER'
                                              CHECK (actor_type IN ('USER', 'SYSTEM', 'INTEGRATION', 'SUPPORT')),
                                          purpose VARCHAR(255),
                                          legal_basis VARCHAR(255),
                                          request_id CHAR(36),
                                          source_ip VARCHAR(45),
                                          user_agent VARCHAR(255),
                                          metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
    CHECK (JSON_TYPE(metadata) = 'OBJECT'),
                                          PRIMARY KEY (tenant_id, occurred_at, id),
                                          FOREIGN KEY (tenant_id) REFERENCES platform_tenants(id) ON DELETE CASCADE,
                                          FOREIGN KEY (tenant_id, actor_user_id)
                                              REFERENCES platform_tenant_memberships(tenant_id, user_id)
                                              ON DELETE RESTRICT
) ENGINE=InnoDB;

ALTER TABLE crm_leads
    ADD CONSTRAINT fk_leads_converted_opportunity
        FOREIGN KEY (tenant_id, converted_opportunity_id)
            REFERENCES crm_opportunities(tenant_id, id) ON DELETE RESTRICT;

ALTER TABLE crm_opportunities
    ADD CONSTRAINT fk_opportunities_campaign
        FOREIGN KEY (tenant_id, campaign_id)
            REFERENCES marketing_campaigns(tenant_id, id)
            ON DELETE RESTRICT;

ALTER TABLE crm_activity_links
    ADD CONSTRAINT fk_activity_links_ticket
        FOREIGN KEY (tenant_id, ticket_id)
            REFERENCES service_tickets(tenant_id, id) ON DELETE CASCADE;

ALTER TABLE crm_notes
    ADD CONSTRAINT fk_notes_ticket
        FOREIGN KEY (tenant_id, ticket_id)
            REFERENCES service_tickets(tenant_id, id) ON DELETE CASCADE;

ALTER TABLE crm_entity_tags
    ADD CONSTRAINT fk_entity_tags_ticket
        FOREIGN KEY (tenant_id, ticket_id)
            REFERENCES service_tickets(tenant_id, id) ON DELETE CASCADE;

CREATE INDEX idx_tenant_memberships_user
    ON platform_tenant_memberships (user_id, membership_status);

CREATE INDEX idx_team_members_user
    ON platform_team_members (tenant_id, user_id);

CREATE INDEX idx_user_roles_active
    ON platform_user_roles (tenant_id, user_id, valid_from, valid_to);

CREATE INDEX idx_role_permissions_permission
    ON platform_role_permissions (tenant_id, permission_code, role_id);

CREATE INDEX idx_accounts_owner_stage
    ON crm_accounts (tenant_id, owner_user_id, lifecycle_stage);

CREATE INDEX idx_accounts_parent
    ON crm_accounts (tenant_id, parent_account_id);

CREATE INDEX idx_accounts_updated
    ON crm_accounts (tenant_id, updated_at DESC);

CREATE INDEX idx_contacts_account
    ON crm_contacts (tenant_id, account_id);

CREATE INDEX idx_contacts_owner_stage
    ON crm_contacts (tenant_id, owner_user_id, lifecycle_stage);

CREATE INDEX idx_contacts_updated
    ON crm_contacts (tenant_id, updated_at DESC);

CREATE INDEX idx_channels_account
    ON crm_communication_channels (tenant_id, account_id, channel_type);

CREATE INDEX idx_channels_contact
    ON crm_communication_channels (tenant_id, contact_id, channel_type);

CREATE INDEX idx_channels_normalized
    ON crm_communication_channels (tenant_id, channel_type, normalized_value);

CREATE INDEX idx_leads_owner_status
    ON crm_leads (tenant_id, owner_user_id, status_id, created_at DESC);

CREATE INDEX idx_leads_source
    ON crm_leads (tenant_id, source_id, created_at DESC);

CREATE INDEX idx_leads_email
    ON crm_leads (tenant_id, email);

CREATE INDEX idx_leads_phone
    ON crm_leads (tenant_id, phone_e164);

CREATE INDEX idx_lead_status_history_timeline
    ON crm_lead_status_history (tenant_id, lead_id, changed_at DESC);

CREATE INDEX idx_opportunities_pipeline_stage_owner
    ON crm_opportunities (tenant_id, pipeline_id, current_stage_id, owner_user_id);

CREATE INDEX idx_opportunities_expected_close
    ON crm_opportunities (tenant_id, expected_close_date, owner_user_id);

CREATE INDEX idx_opportunities_account
    ON crm_opportunities (tenant_id, account_id, status);

CREATE INDEX idx_opportunity_stage_history_timeline
    ON crm_opportunity_stage_history (tenant_id, opportunity_id, changed_at DESC);

CREATE INDEX idx_opportunity_stage_history_stage
    ON crm_opportunity_stage_history (tenant_id, to_stage_id, changed_at DESC);

CREATE INDEX idx_activities_owner_schedule
    ON crm_activities (tenant_id, owner_user_id, scheduled_start_at);

CREATE INDEX idx_activities_team_schedule
    ON crm_activities (tenant_id, assigned_team_id, scheduled_start_at);

CREATE INDEX idx_activities_created
    ON crm_activities (tenant_id, created_at DESC);

CREATE INDEX idx_activities_type_created
    ON crm_activities (tenant_id, activity_type, created_at DESC);

CREATE INDEX idx_activity_participants_activity
    ON crm_activity_participants (tenant_id, activity_id);

CREATE INDEX idx_activity_participants_contact
    ON crm_activity_participants (tenant_id, contact_id);

CREATE INDEX idx_activity_links_activity
    ON crm_activity_links (tenant_id, activity_id);

CREATE INDEX idx_activity_links_account
    ON crm_activity_links (tenant_id, account_id, activity_id);

CREATE INDEX idx_activity_links_contact
    ON crm_activity_links (tenant_id, contact_id, activity_id);

CREATE INDEX idx_activity_links_lead
    ON crm_activity_links (tenant_id, lead_id, activity_id);

CREATE INDEX idx_activity_links_opportunity
    ON crm_activity_links (tenant_id, opportunity_id, activity_id);

CREATE INDEX idx_activity_links_ticket
    ON crm_activity_links (tenant_id, ticket_id, activity_id);

CREATE INDEX idx_notes_account
    ON crm_notes (tenant_id, account_id, created_at DESC);

CREATE INDEX idx_notes_contact
    ON crm_notes (tenant_id, contact_id, created_at DESC);

CREATE INDEX idx_notes_lead
    ON crm_notes (tenant_id, lead_id, created_at DESC);

CREATE INDEX idx_notes_opportunity
    ON crm_notes (tenant_id, opportunity_id, created_at DESC);

CREATE INDEX idx_entity_tags_tag
    ON crm_entity_tags (tenant_id, tag_id);

CREATE INDEX idx_entity_tags_account
    ON crm_entity_tags (tenant_id, account_id, tag_id);

CREATE INDEX idx_entity_tags_contact
    ON crm_entity_tags (tenant_id, contact_id, tag_id);

CREATE INDEX idx_entity_tags_lead
    ON crm_entity_tags (tenant_id, lead_id, tag_id);

CREATE INDEX idx_entity_tags_opportunity
    ON crm_entity_tags (tenant_id, opportunity_id, tag_id);

CREATE INDEX idx_custom_field_values_entity
    ON crm_custom_field_values (tenant_id, entity_type, entity_id);

CREATE INDEX idx_products_category
    ON catalog_products (tenant_id, category_id, is_active);

CREATE INDEX idx_price_book_items_product
    ON catalog_price_book_items (tenant_id, product_id, price_book_id);

CREATE UNIQUE INDEX uq_quotes_number_revision
    ON sales_quotes (tenant_id, quote_number, revision_number);

CREATE INDEX idx_quotes_account_status
    ON sales_quotes (tenant_id, account_id, status, created_at DESC);

CREATE INDEX idx_quotes_opportunity
    ON sales_quotes (tenant_id, opportunity_id, created_at DESC);

CREATE INDEX idx_quotes_owner_status
    ON sales_quotes (tenant_id, owner_user_id, status, valid_until);

CREATE INDEX idx_quote_items_product
    ON sales_quote_items (tenant_id, product_id);

CREATE INDEX idx_quote_approvals_pending
    ON sales_quote_approvals (tenant_id, approver_user_id, requested_at);

CREATE INDEX idx_orders_account_status
    ON sales_orders (tenant_id, account_id, status, order_date DESC);

CREATE INDEX idx_orders_owner_status
    ON sales_orders (tenant_id, owner_user_id, status, order_date DESC);

CREATE INDEX idx_orders_opportunity
    ON sales_orders (tenant_id, opportunity_id, order_date DESC);

CREATE INDEX idx_contracts_account_status
    ON sales_contracts (tenant_id, account_id, status, effective_to);

CREATE INDEX idx_contracts_renewal
    ON sales_contracts (tenant_id, effective_to, owner_user_id);

CREATE INDEX idx_campaigns_status_dates
    ON marketing_campaigns (tenant_id, status, start_at, end_at);

CREATE INDEX idx_campaign_members_status
    ON marketing_campaign_members (tenant_id, campaign_id, member_status);

CREATE INDEX idx_tickets_assignee_status
    ON service_tickets (tenant_id, assigned_user_id, status, priority, created_at DESC);

CREATE INDEX idx_tickets_team_status
    ON service_tickets (tenant_id, assigned_team_id, status, priority, created_at DESC);

CREATE INDEX idx_tickets_account
    ON service_tickets (tenant_id, account_id, created_at DESC);

CREATE INDEX idx_tickets_contact
    ON service_tickets (tenant_id, contact_id, created_at DESC);

CREATE INDEX idx_tickets_sla_due
    ON service_tickets (tenant_id, resolution_due_at, priority);

CREATE INDEX idx_ticket_comments_timeline
    ON service_ticket_comments (tenant_id, ticket_id, created_at);

CREATE INDEX idx_ticket_events_ticket_timeline
    ON service_ticket_events (tenant_id, ticket_id, occurred_at DESC);

CREATE INDEX idx_ticket_events_brin_time
    ON service_ticket_events (occurred_at);

CREATE INDEX idx_consents_contact_current
    ON privacy_consents (tenant_id, contact_id, purpose, channel, effective_from DESC);

CREATE INDEX idx_consents_lead_current
    ON privacy_consents (tenant_id, lead_id, purpose, channel, effective_from DESC);

CREATE INDEX idx_consents_account_current
    ON privacy_consents (tenant_id, account_id, purpose, channel, effective_from DESC);

CREATE INDEX idx_data_subject_requests_due
    ON privacy_data_subject_requests (tenant_id, status, due_at);

CREATE INDEX idx_outbox_pending
    ON integration_outbox_events (tenant_id, status, available_at, created_at);

CREATE INDEX idx_outbox_lock_recovery
    ON integration_outbox_events (status, locked_at);

CREATE INDEX idx_outbox_aggregate
    ON integration_outbox_events (tenant_id, aggregate_type, aggregate_id, created_at DESC);

CREATE INDEX idx_outbox_brin_time
    ON integration_outbox_events (created_at);

CREATE INDEX idx_webhook_subscriptions_active
    ON integration_webhook_subscriptions (tenant_id, status);

CREATE INDEX idx_webhook_deliveries_retry
    ON integration_webhook_deliveries (tenant_id, status, next_attempt_at);

CREATE INDEX idx_webhook_deliveries_subscription
    ON integration_webhook_deliveries (tenant_id, subscription_id, created_at DESC);

CREATE INDEX idx_webhook_deliveries_brin_time
    ON integration_webhook_deliveries (created_at);

CREATE INDEX idx_idempotency_keys_expiry
    ON integration_idempotency_keys (expires_at);

CREATE INDEX idx_import_jobs_status
    ON integration_import_jobs (tenant_id, status, created_at DESC);

CREATE INDEX idx_audit_events_aggregate
    ON audit_audit_events (tenant_id, aggregate_type, aggregate_id, occurred_at DESC);

CREATE INDEX idx_audit_events_actor
    ON audit_audit_events (tenant_id, actor_user_id, occurred_at DESC);

CREATE INDEX idx_audit_events_request
    ON audit_audit_events (tenant_id, request_id);

CREATE INDEX idx_audit_events_brin_time
    ON audit_audit_events (occurred_at);

CREATE INDEX idx_data_access_entity
    ON audit_data_access_events (tenant_id, entity_type, entity_id, occurred_at DESC);

CREATE INDEX idx_data_access_actor
    ON audit_data_access_events (tenant_id, actor_user_id, occurred_at DESC);

CREATE INDEX idx_data_access_brin_time
    ON audit_data_access_events (occurred_at);

-- Conditional uniqueness formerly implemented by PostgreSQL partial indexes.
CREATE UNIQUE INDEX uq_users_external_identity
  ON platform_users
    ((COALESCE(identity_provider, '__NULL__')),
     (COALESCE(external_subject, '__NULL__')));
CREATE UNIQUE INDEX uq_teams_active_name
  ON platform_teams (tenant_id, (IF(deleted_at IS NULL, LOWER(name), NULL)));
CREATE UNIQUE INDEX uq_team_members_one_primary_team
  ON platform_team_members (tenant_id, user_id, (IF(is_primary AND left_at IS NULL, 1, NULL)));
CREATE UNIQUE INDEX uq_roles_active_code
  ON platform_roles (tenant_id, (IF(deleted_at IS NULL, LOWER(role_code), NULL)));
CREATE UNIQUE INDEX uq_lead_statuses_one_default
  ON crm_lead_statuses (tenant_id, (IF(is_default AND is_active, 1, NULL)));
CREATE UNIQUE INDEX uq_accounts_active_number
  ON crm_accounts (tenant_id, (IF(deleted_at IS NULL, account_number, NULL)));
CREATE UNIQUE INDEX uq_contacts_active_number
  ON crm_contacts (tenant_id, (IF(deleted_at IS NULL, contact_number, NULL)));
CREATE UNIQUE INDEX uq_channels_primary_account_type
  ON crm_communication_channels
    (tenant_id, account_id, channel_type,
     (IF(deleted_at IS NULL AND account_id IS NOT NULL AND is_primary, 1, NULL)));
CREATE UNIQUE INDEX uq_channels_primary_contact_type
  ON crm_communication_channels
    (tenant_id, contact_id, channel_type,
     (IF(deleted_at IS NULL AND contact_id IS NOT NULL AND is_primary, 1, NULL)));
CREATE UNIQUE INDEX uq_account_addresses_primary_type
  ON crm_account_addresses
    (tenant_id, account_id, address_type, (IF(is_primary AND valid_to IS NULL, 1, NULL)));
CREATE UNIQUE INDEX uq_contact_addresses_primary_type
  ON crm_contact_addresses
    (tenant_id, contact_id, address_type, (IF(is_primary AND valid_to IS NULL, 1, NULL)));
CREATE UNIQUE INDEX uq_leads_active_number
  ON crm_leads (tenant_id, (IF(deleted_at IS NULL, lead_number, NULL)));
CREATE UNIQUE INDEX uq_pipelines_one_default_type
  ON crm_pipelines (tenant_id, pipeline_type, (IF(is_default AND is_active, 1, NULL)));
CREATE UNIQUE INDEX uq_opportunities_active_number
  ON crm_opportunities (tenant_id, (IF(deleted_at IS NULL, opportunity_number, NULL)));
CREATE UNIQUE INDEX uq_opportunity_contacts_one_primary
  ON crm_opportunity_contacts (tenant_id, opportunity_id, (IF(is_primary, 1, NULL)));
CREATE UNIQUE INDEX uq_products_active_sku
  ON catalog_products (tenant_id, (IF(deleted_at IS NULL, sku, NULL)));
CREATE UNIQUE INDEX uq_price_books_one_default_currency
  ON catalog_price_books
    (tenant_id, currency_code, (IF(is_default AND is_active, 1, NULL)));
CREATE UNIQUE INDEX uq_campaigns_active_code
  ON marketing_campaigns (tenant_id, (IF(deleted_at IS NULL, campaign_code, NULL)));
CREATE UNIQUE INDEX uq_campaign_members_lead
  ON marketing_campaign_members
    (tenant_id, campaign_id, (IF(lead_id IS NOT NULL, lead_id, NULL)));
CREATE UNIQUE INDEX uq_campaign_members_contact
  ON marketing_campaign_members
    (tenant_id, campaign_id, (IF(contact_id IS NOT NULL, contact_id, NULL)));
CREATE UNIQUE INDEX uq_sla_policies_default_priority
  ON service_sla_policies (tenant_id, priority, (IF(is_default AND is_active, 1, NULL)));

-- MySQL replacements for PostgreSQL GIN and trigram search indexes.
CREATE FULLTEXT INDEX ft_accounts_search
  ON crm_accounts (account_number, display_name, legal_name, tax_identifier, registration_number);
CREATE FULLTEXT INDEX ft_contacts_search
  ON crm_contacts
    (contact_number, display_name, given_name, middle_name, family_name, job_title, department);
CREATE FULLTEXT INDEX ft_leads_search
  ON crm_leads (lead_number, display_name, company_name, account_name, email, phone_e164);
CREATE FULLTEXT INDEX ft_opportunities_search
  ON crm_opportunities (opportunity_number, name, description);
CREATE FULLTEXT INDEX ft_custom_field_values_search
  ON crm_custom_field_values (search_text);
CREATE FULLTEXT INDEX ft_products_search
  ON catalog_products (sku, name, description);
CREATE FULLTEXT INDEX ft_tickets_search
  ON service_tickets (ticket_number, subject, description);

INSERT IGNORE INTO platform_permissions (permission_code, description, module_code, risk_level)
VALUES
    ('crm_account.read', 'Read customer accounts', 'crm', 'NORMAL'),
    ('crm_account.write', 'Create and update customer accounts', 'crm', 'NORMAL'),
    ('crm_contact.read', 'Read contacts', 'crm', 'NORMAL'),
    ('crm_contact.write', 'Create and update contacts', 'crm', 'NORMAL'),
    ('crm_lead.read', 'Read leads', 'crm', 'NORMAL'),
    ('crm_lead.write', 'Create, update, and convert leads', 'crm', 'NORMAL'),
    ('crm_opportunity.read', 'Read sales opportunities', 'crm', 'NORMAL'),
    ('crm_opportunity.write', 'Create and update sales opportunities', 'crm', 'NORMAL'),
    ('sales_quote.read', 'Read quotes', 'sales', 'NORMAL'),
    ('sales_quote.write', 'Create and update quotes', 'sales', 'NORMAL'),
    ('sales_quote.approve', 'Approve quotes', 'sales', 'SENSITIVE'),
    ('sales_order.read', 'Read orders', 'sales', 'NORMAL'),
    ('sales_order.write', 'Create and update orders', 'sales', 'SENSITIVE'),
    ('service_ticket.read', 'Read service tickets', 'service', 'NORMAL'),
    ('service_ticket.write', 'Create and update service tickets', 'service', 'NORMAL'),
    ('privacy_consent.read', 'Read consent records', 'privacy', 'SENSITIVE'),
    ('privacy_consent.write', 'Create and update consent records', 'privacy', 'SENSITIVE'),
    ('audit_read', 'Read audit trails', 'audit', 'PRIVILEGED'),
    ('platform_user.manage', 'Manage tenant memberships and roles', 'platform', 'PRIVILEGED');

CREATE VIEW privacy_current_consents AS
SELECT
  tenant_id,
  id,
  account_id,
  contact_id,
  lead_id,
  channel,
  purpose,
  lawful_basis,
  consent_status,
  policy_version,
  source,
  effective_from,
  expires_at,
  withdrawn_at
FROM (
  SELECT
    c.*,
    ROW_NUMBER() OVER (
      PARTITION BY
        tenant_id,
        COALESCE(account_id, '00000000-0000-0000-0000-000000000000'),
        COALESCE(contact_id, '00000000-0000-0000-0000-000000000000'),
        COALESCE(lead_id, '00000000-0000-0000-0000-000000000000'),
        channel,
        purpose
      ORDER BY effective_from DESC, created_at DESC
    ) AS consent_rank
  FROM privacy_consents AS c
) AS ranked_consents
WHERE consent_rank = 1;

DELIMITER $$

CREATE FUNCTION platform_current_tenant_id()
RETURNS CHAR(36)
NO SQL
RETURN @app_tenant_id$$

CREATE FUNCTION platform_current_actor_user_id()
RETURNS CHAR(36)
NO SQL
RETURN @app_user_id$$

CREATE FUNCTION platform_current_request_id()
RETURNS CHAR(36)
NO SQL
RETURN @app_request_id$$

CREATE PROCEDURE platform_set_request_context(
  IN p_tenant_id CHAR(36),
  IN p_user_id CHAR(36),
  IN p_request_id CHAR(36)
)
BEGIN
  SET @app_tenant_id = p_tenant_id;
  SET @app_user_id = p_user_id;
  SET @app_request_id = p_request_id;
  SET @app_actor_type = 'USER';
END$$

CREATE PROCEDURE platform_next_counter_value(
  IN p_counter_key VARCHAR(191),
  OUT p_current_value BIGINT
)
BEGIN
  IF @app_tenant_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Tenant context is required';
  END IF;

  INSERT INTO platform_document_counters (
    tenant_id,
    counter_key,
    current_value,
    updated_at
  )
  VALUES (
    @app_tenant_id,
    p_counter_key,
    LAST_INSERT_ID(1),
    CURRENT_TIMESTAMP(6)
  )
  ON DUPLICATE KEY UPDATE
    current_value = LAST_INSERT_ID(current_value + 1),
    updated_at = CURRENT_TIMESTAMP(6);

  SET p_current_value = LAST_INSERT_ID();
END$$

CREATE FUNCTION audit_redact_json(p_value JSON)
RETURNS JSON
DETERMINISTIC
NO SQL
RETURN IF(
  p_value IS NULL,
  NULL,
  JSON_REMOVE(
    p_value,
    '$.password',
    '$.password_hash',
    '$.access_token',
    '$.refresh_token',
    '$.api_key',
    '$.client_secret',
    '$.secret',
    '$.secret_reference',
    '$.signature',
    '$.private_key',
    '$.bank_account_number',
    '$.search_vector'
  )
)$$

CREATE PROCEDURE audit_log_data_access(
  IN p_entity_type VARCHAR(191),
  IN p_entity_id CHAR(36),
  IN p_access_type VARCHAR(191),
  IN p_fields_accessed JSON,
  IN p_purpose VARCHAR(255),
  IN p_legal_basis VARCHAR(255),
  IN p_metadata JSON,
  OUT p_id CHAR(36)
)
BEGIN
  IF @app_tenant_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Tenant context is required';
  END IF;

  SET p_id = UUID();

  INSERT INTO audit_data_access_events (
    tenant_id,
    id,
    entity_type,
    entity_id,
    access_type,
    fields_accessed,
    actor_user_id,
    actor_type,
    purpose,
    legal_basis,
    request_id,
    metadata
  )
  VALUES (
    @app_tenant_id,
    p_id,
    p_entity_type,
    p_entity_id,
    p_access_type,
    COALESCE(p_fields_accessed, JSON_ARRAY()),
    @app_user_id,
    COALESCE(NULLIF(@app_actor_type, ''), 'USER'),
    p_purpose,
    p_legal_basis,
    @app_request_id,
    COALESCE(p_metadata, JSON_OBJECT())
  );
END$$

CREATE TRIGGER trg_touch_platform_tenants
BEFORE UPDATE ON platform_tenants
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_platform_users
BEFORE UPDATE ON platform_users
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_platform_tenant_memberships
BEFORE UPDATE ON platform_tenant_memberships
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_platform_teams
BEFORE UPDATE ON platform_teams
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_platform_roles
BEFORE UPDATE ON platform_roles
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_platform_tenant_settings
BEFORE UPDATE ON platform_tenant_settings
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_lead_sources
BEFORE UPDATE ON crm_lead_sources
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_lead_statuses
BEFORE UPDATE ON crm_lead_statuses
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_opportunity_lost_reasons
BEFORE UPDATE ON crm_opportunity_lost_reasons
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_accounts
BEFORE UPDATE ON crm_accounts
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_contacts
BEFORE UPDATE ON crm_contacts
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_communication_channels
BEFORE UPDATE ON crm_communication_channels
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_addresses
BEFORE UPDATE ON crm_addresses
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_leads
BEFORE UPDATE ON crm_leads
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_pipelines
BEFORE UPDATE ON crm_pipelines
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_pipeline_stages
BEFORE UPDATE ON crm_pipeline_stages
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_opportunities
BEFORE UPDATE ON crm_opportunities
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_activities
BEFORE UPDATE ON crm_activities
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_notes
BEFORE UPDATE ON crm_notes
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_tags
BEFORE UPDATE ON crm_tags
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_custom_field_definitions
BEFORE UPDATE ON crm_custom_field_definitions
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_crm_custom_field_values
BEFORE UPDATE ON crm_custom_field_values
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_catalog_product_categories
BEFORE UPDATE ON catalog_product_categories
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_catalog_products
BEFORE UPDATE ON catalog_products
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_catalog_price_books
BEFORE UPDATE ON catalog_price_books
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_catalog_price_book_items
BEFORE UPDATE ON catalog_price_book_items
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_sales_quotes
BEFORE UPDATE ON sales_quotes
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_sales_quote_items
BEFORE UPDATE ON sales_quote_items
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_sales_orders
BEFORE UPDATE ON sales_orders
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_sales_order_items
BEFORE UPDATE ON sales_order_items
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_sales_contracts
BEFORE UPDATE ON sales_contracts
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_marketing_campaigns
BEFORE UPDATE ON marketing_campaigns
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_marketing_campaign_members
BEFORE UPDATE ON marketing_campaign_members
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_service_ticket_categories
BEFORE UPDATE ON service_ticket_categories
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_service_sla_policies
BEFORE UPDATE ON service_sla_policies
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_service_tickets
BEFORE UPDATE ON service_tickets
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_service_ticket_comments
BEFORE UPDATE ON service_ticket_comments
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_privacy_retention_policies
BEFORE UPDATE ON privacy_retention_policies
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_privacy_data_subject_requests
BEFORE UPDATE ON privacy_data_subject_requests
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_integration_external_id_mappings
BEFORE UPDATE ON integration_external_id_mappings
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_integration_webhook_subscriptions
BEFORE UPDATE ON integration_webhook_subscriptions
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

CREATE TRIGGER trg_touch_integration_import_jobs
BEFORE UPDATE ON integration_import_jobs
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP(6);
  SET NEW.version = OLD.version + 1;
  SET NEW.updated_by = COALESCE(@app_user_id, NEW.updated_by, OLD.updated_by);
END$$

DELIMITER ;

-- The following mutable aggregates were audited by generic PostgreSQL triggers.
-- MySQL requires per-table OLD/NEW column enumeration, so the application must
-- insert audit_audit_events rows in the same transaction for these tables:
-- platform_tenant_memberships, platform_teams, platform_roles, crm_accounts,
-- crm_contacts, crm_communication_channels, crm_leads, crm_opportunities,
-- crm_activities, crm_notes, crm_custom_field_definitions,
-- crm_custom_field_values, catalog_products, catalog_price_books, sales_quotes,
-- sales_orders, sales_contracts, marketing_campaigns, service_tickets,
-- service_ticket_comments, privacy_consents, privacy_data_subject_requests,
-- integration_webhook_subscriptions.

ALTER TABLE crm_accounts COMMENT =
  'Customer organizations/person accounts. Composite tenant key prevents cross-tenant references.';
ALTER TABLE crm_contacts COMMENT =
  'Natural persons associated with zero or one primary account.';
ALTER TABLE crm_leads COMMENT =
  'Unqualified or pre-conversion prospects; conversion links preserve source history.';
ALTER TABLE crm_opportunities COMMENT =
  'Pipeline opportunities with configurable stages and immutable stage history.';
ALTER TABLE sales_quote_items COMMENT =
  'Quote-line product and pricing snapshots; historical documents do not change with the catalog.';
ALTER TABLE privacy_consents COMMENT =
  'Append-oriented consent evidence by subject, channel, purpose, lawful basis, and policy version.';
ALTER TABLE integration_outbox_events COMMENT =
  'Transactional outbox. Insert in the same transaction as the aggregate change.';
ALTER TABLE audit_audit_events COMMENT =
  'Append-only row-change audit trail with common secret fields removed.';

SET FOREIGN_KEY_CHECKS = 1;

-- Recommended verification after import:
--   SELECT VERSION();
--   SELECT COUNT(*) FROM information_schema.tables
--     WHERE table_schema = 'crm_platform' AND table_type = 'BASE TABLE';
--   SELECT COUNT(*) FROM platform_permissions;
--
-- Tenant context example:
--   CALL platform_set_request_context(
--     '00000000-0000-0000-0000-000000000001',
--     NULL,
--     UUID()
--   );
-- ============================================================================
