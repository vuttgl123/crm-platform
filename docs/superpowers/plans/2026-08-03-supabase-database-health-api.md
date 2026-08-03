# Supabase Database Health API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure the CRM Spring Boot application to connect directly to Supabase PostgreSQL and expose a localhost API that checks the connection with `SELECT 1`.

**Architecture:** Spring Boot configures its standard datasource from `application.yaml`. A focused health service performs the JDBC query, a REST controller translates the result to HTTP `200` or `503`, and a small security configuration makes only the database health endpoint public.

**Tech Stack:** Java 21, Spring Boot 4.0.7, Spring Data JPA, Spring JDBC, Spring Security, PostgreSQL JDBC driver

## Global Constraints

- Store the local Supabase connection settings directly in `application.yaml`.
- Require PostgreSQL SSL with `sslmode=require`.
- Do not let Hibernate create, update, or drop database schema objects.
- Never return connection credentials or exception details in the HTTP response.
- Do not add automated tests or make Git commits; the user will verify the live endpoint manually.

---

### Task 1: Configure the Supabase datasource

**Files:**
- Modify: `crm/src/main/resources/application.yaml`

**Interfaces:**
- Consumes: Supabase PostgreSQL host `db.jvparwkdhvftpyxawfdx.supabase.co`, port `5432`, database `postgres`, user `postgres`, and the password entered by the user.
- Produces: Spring's auto-configured `DataSource` and `JdbcTemplate` beans.

- [ ] **Step 1: Replace the invalid YAML fragment with valid datasource properties**

```yaml
spring:
  application:
    name: crm
  datasource:
    url: jdbc:postgresql://db.jvparwkdhvftpyxawfdx.supabase.co:5432/postgres?sslmode=require
    username: postgres
    password: "YOUR_SUPABASE_DATABASE_PASSWORD"
    driver-class-name: org.postgresql.Driver
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: none
    open-in-view: false
    properties:
      hibernate:
        boot:
          allow_jdbc_metadata_access: false
```

- [ ] **Step 2: Confirm the YAML parses during compilation**

Run: `cd crm && ./mvnw -DskipTests compile`

Expected: Maven exits with code `0` and reports `BUILD SUCCESS`.

### Task 2: Add the database health API

**Files:**
- Create: `crm/src/main/java/com/crm/health/DatabaseHealthService.java`
- Create: `crm/src/main/java/com/crm/health/DatabaseHealthResponse.java`
- Create: `crm/src/main/java/com/crm/health/DatabaseHealthController.java`
- Create: `crm/src/main/java/com/crm/config/SecurityConfig.java`

**Interfaces:**
- Consumes: Spring's auto-configured `JdbcTemplate`.
- Produces: `boolean DatabaseHealthService.isConnected()`, immutable `DatabaseHealthResponse(String status, String message)`, and `GET /api/health/database`.

- [ ] **Step 1: Implement the focused JDBC connection check**

```java
package com.crm.health;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DatabaseHealthService {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseHealthService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean isConnected() {
        Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        return Integer.valueOf(1).equals(result);
    }
}
```

- [ ] **Step 2: Define the API response type**

```java
package com.crm.health;

public record DatabaseHealthResponse(String status, String message) {
}
```

- [ ] **Step 3: Implement HTTP status mapping without leaking internal errors**

```java
package com.crm.health;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health/database")
public class DatabaseHealthController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DatabaseHealthController.class);

    private final DatabaseHealthService databaseHealthService;

    public DatabaseHealthController(DatabaseHealthService databaseHealthService) {
        this.databaseHealthService = databaseHealthService;
    }

    @GetMapping
    public ResponseEntity<DatabaseHealthResponse> checkConnection() {
        try {
            if (databaseHealthService.isConnected()) {
                return ResponseEntity.ok(new DatabaseHealthResponse("UP", "Connected to Supabase database"));
            }
        } catch (DataAccessException exception) {
            LOGGER.warn("Supabase database connection check failed", exception);
        }

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new DatabaseHealthResponse("DOWN", "Cannot connect to Supabase database"));
    }
}
```

- [ ] **Step 4: Permit unauthenticated access to only the health endpoint**

```java
package com.crm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/health/database").permitAll()
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults())
                .build();
    }
}
```

- [ ] **Step 5: Compile the completed implementation**

Run: `cd crm && ./mvnw -DskipTests compile`

Expected: Maven exits with code `0` and reports `BUILD SUCCESS`.

- [ ] **Step 6: Hand off the manual connection check**

After replacing `YOUR_SUPABASE_DATABASE_PASSWORD`, run `cd crm && ./mvnw spring-boot:run`, then call:

```bash
curl -i http://localhost:8080/api/health/database
```

Expected when connected: HTTP `200` and `{"status":"UP","message":"Connected to Supabase database"}`.

Expected when unavailable: HTTP `503` and `{"status":"DOWN","message":"Cannot connect to Supabase database"}`.
