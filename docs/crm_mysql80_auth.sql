-- CRM authentication extension for MySQL 8.0 LTS.
-- Run this script after docs/crm_mysql80.sql on an existing CRM database.

ALTER TABLE platform_users
    ADD COLUMN email_verified_at DATETIME(6) NULL AFTER last_login_at;

-- The old COALESCE-based index allowed only one user without an external
-- identity. Native MySQL unique indexes already allow multiple NULL pairs.
DROP INDEX uq_users_external_identity ON platform_users;

ALTER TABLE platform_users
    ADD CONSTRAINT ck_users_external_identity_pair
        CHECK ((identity_provider IS NULL AND external_subject IS NULL)
            OR (identity_provider IS NOT NULL AND external_subject IS NOT NULL));

CREATE UNIQUE INDEX uq_users_external_identity
    ON platform_users (identity_provider, external_subject);

CREATE TABLE platform_user_credentials (
    user_id CHAR(36) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    password_changed_at DATETIME(6) NOT NULL,
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    failed_login_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    locked_until DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
    FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE platform_user_identities (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    provider VARCHAR(32) NOT NULL
        CHECK (provider IN ('GOOGLE', 'MICROSOFT')),
    issuer VARCHAR(255) NOT NULL CHECK (TRIM(issuer) <> ''),
    subject VARCHAR(255) NOT NULL CHECK (TRIM(subject) <> ''),
    provider_email VARCHAR(320),
    provider_email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at DATETIME(6),
    metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
        CHECK (JSON_TYPE(metadata) = 'OBJECT'),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_identities_subject UNIQUE (issuer, subject),
    CONSTRAINT uq_user_identities_provider UNIQUE (user_id, provider, issuer)
) ENGINE=InnoDB;

CREATE TABLE platform_auth_sessions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    refresh_token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    rotation_counter BIGINT UNSIGNED NOT NULL DEFAULT 0,
    issued_at DATETIME(6) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    last_used_at DATETIME(6),
    revoked_at DATETIME(6),
    revoke_reason VARCHAR(64),
    created_ip VARCHAR(45),
    last_used_ip VARCHAR(45),
    user_agent VARCHAR(512),
    FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE,
    CONSTRAINT uq_auth_sessions_refresh_hash UNIQUE (refresh_token_hash),
    CHECK (expires_at > issued_at),
    CHECK (revoked_at IS NULL OR revoke_reason IS NOT NULL)
) ENGINE=InnoDB;

CREATE TABLE platform_auth_events (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    session_id CHAR(36),
    event_type VARCHAR(32) NOT NULL
        CHECK (event_type IN (
            'REGISTER', 'LOGIN_SUCCESS', 'LOGIN_FAILURE',
            'REFRESH', 'LOGOUT', 'SESSION_REVOKED',
            'EXTERNAL_IDENTITY_CREATED',
            'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED',
            'PASSWORD_CHANGED', 'LOGIN_BLOCKED_LOCKED'
        )),
    provider VARCHAR(32) NOT NULL,
    success BOOLEAN NOT NULL,
    email VARCHAR(320),
    failure_code VARCHAR(64),
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    occurred_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    metadata JSON NOT NULL DEFAULT (JSON_OBJECT())
        CHECK (JSON_TYPE(metadata) = 'OBJECT'),
    FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES platform_auth_sessions(id) ON DELETE SET NULL,
    CHECK ((success AND failure_code IS NULL)
        OR (NOT success AND failure_code IS NOT NULL))
) ENGINE=InnoDB;

CREATE TABLE platform_password_reset_tokens (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    issued_at DATETIME(6) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed_at DATETIME(6),
    invalidated_at DATETIME(6),
    invalidate_reason VARCHAR(64),
    requested_ip VARCHAR(45),
    requested_user_agent VARCHAR(512),
    FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE,
    CONSTRAINT uq_password_reset_token_hash UNIQUE (token_hash),
    CHECK (expires_at > issued_at),
    CHECK (invalidated_at IS NULL OR invalidate_reason IS NOT NULL),
    CHECK (consumed_at IS NULL OR invalidated_at IS NULL)
) ENGINE=InnoDB;

CREATE INDEX idx_password_reset_user_active
    ON platform_password_reset_tokens (user_id, consumed_at, expires_at);

CREATE INDEX idx_user_identities_user
    ON platform_user_identities (user_id);

CREATE INDEX idx_auth_sessions_user_active
    ON platform_auth_sessions (user_id, revoked_at, expires_at);

CREATE INDEX idx_auth_events_user_time
    ON platform_auth_events (user_id, occurred_at DESC);

CREATE INDEX idx_auth_events_email_time
    ON platform_auth_events (email, occurred_at DESC);
