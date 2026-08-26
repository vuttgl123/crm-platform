-- Auth password lifecycle: reset tokens and new audit event types.
-- Apply to databases created before 2026-08-25.
--
-- MySQL 8.0. Both statements are DDL and cannot be rolled back inside a
-- transaction; run them in a maintenance window.
--
-- IMPORTANT: the DROP CHECK below names MySQL's auto-generated constraint
-- identifier. Confirm the real name against the target database first:
--
--   SELECT CONSTRAINT_NAME FROM information_schema.CHECK_CONSTRAINTS
--   WHERE CONSTRAINT_SCHEMA = DATABASE()
--     AND TABLE_NAME = 'platform_auth_events';
--
-- platform_auth_events carries more than one CHECK constraint (the event_type
-- list and the success/failure_code pairing), so verify which identifier maps
-- to the event_type list before dropping anything.

ALTER TABLE platform_auth_events
    DROP CHECK platform_auth_events_chk_1;

ALTER TABLE platform_auth_events
    ADD CONSTRAINT chk_auth_events_event_type CHECK (event_type IN (
        'REGISTER', 'LOGIN_SUCCESS', 'LOGIN_FAILURE',
        'REFRESH', 'LOGOUT', 'SESSION_REVOKED',
        'EXTERNAL_IDENTITY_CREATED',
        'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED',
        'PASSWORD_CHANGED', 'LOGIN_BLOCKED_LOCKED'
    ));

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
