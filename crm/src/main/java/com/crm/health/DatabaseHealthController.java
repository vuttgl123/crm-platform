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
				return ResponseEntity.ok(
						new DatabaseHealthResponse("UP", "Connected to database"));
			}
		}
		catch (DataAccessException exception) {
			LOGGER.warn("Database connection check failed", exception);
		}

		return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
				.body(new DatabaseHealthResponse("DOWN", "Cannot connect to database"));
	}

}
