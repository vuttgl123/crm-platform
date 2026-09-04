package com.crm.platform.settings.presentation.web;

import java.util.List;

import com.crm.platform.settings.application.dto.BackupSnapshotDto;
import com.crm.platform.settings.application.dto.StorageUsageDto;
import com.crm.platform.settings.application.usecase.TenantSettingsFacade;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform/settings")
public final class TenantStorageSettingsController {

	private final TenantSettingsFacade facade;

	public TenantStorageSettingsController(TenantSettingsFacade facade) {
		this.facade = facade;
	}

	@GetMapping("/storage/usage")
	public ResponseEntity<StorageUsageDto> getStorageUsage() {
		return ResponseEntity.ok(facade.getStorageUsage());
	}

	@PostMapping("/backup/trigger")
	public ResponseEntity<BackupSnapshotDto> triggerBackup() {
		return ResponseEntity.status(HttpStatus.ACCEPTED).body(facade.triggerBackup());
	}

	@GetMapping("/backup/history")
	public ResponseEntity<List<BackupSnapshotDto>> listBackupHistory() {
		return ResponseEntity.ok(facade.listBackupHistory());
	}
}
