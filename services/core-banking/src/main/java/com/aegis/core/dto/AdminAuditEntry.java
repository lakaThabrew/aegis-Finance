package com.aegis.core.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminAuditEntry(UUID id, String eventType, String message, String actor, String severity, LocalDateTime createdAt) { }
