# Supabase Database Connection Design

## Goal

Connect the Spring Boot CRM application directly to the Supabase PostgreSQL database and expose a small HTTP endpoint for manually checking the connection on localhost.

## Configuration

- Replace the invalid connection fragment in `application.yaml` with standard Spring Boot `spring.datasource` properties.
- Use the existing Supabase host, PostgreSQL port `5432`, database `postgres`, and user `postgres` directly in the file.
- Require PostgreSQL SSL with `sslmode=require`.
- Keep a clearly marked password value in the file for the developer to replace because no database password is currently present in the project.
- Disable automatic Hibernate schema changes with `spring.jpa.hibernate.ddl-auto: none`.

## Components

- `DatabaseHealthService` uses Spring's `JdbcTemplate` to execute `SELECT 1`.
- `DatabaseHealthController` exposes `GET /api/health/database`.
- A minimal Spring Security configuration permits unauthenticated localhost access to this health endpoint while leaving other requests protected by the framework.

## Request Flow

1. The caller sends `GET /api/health/database`.
2. The service executes `SELECT 1` through the configured datasource.
3. A successful query returns HTTP `200` with a small JSON status response.
4. A connection or query failure returns HTTP `503` with a generic JSON failure response.

No JDBC URL, username, password, SQL exception, or stack trace is included in the API response.

## Verification

Automated tests are out of scope at the user's request. The application should at least compile after the change. The user will enter the Supabase database password, start the application locally, and call the health endpoint to verify the live connection.
