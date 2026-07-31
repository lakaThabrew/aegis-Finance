package com.aegis.core.controller;

import com.aegis.core.entity.SecurityEvent;
import com.aegis.core.service.SecurityEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/core/security/events")
public class SecurityEventController {

    private final SecurityEventService securityEventService;

    public SecurityEventController(SecurityEventService securityEventService) {
        this.securityEventService = securityEventService;
    }

    @GetMapping
    public ResponseEntity<List<SecurityEvent>> getEvents(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(securityEventService.getEvents(getCustomerId(jwt)));
    }

    @PostMapping("/login")
    public ResponseEntity<SecurityEvent> recordLogin(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(securityEventService.record(getCustomerId(jwt), "LOGIN_SUCCESSFUL", "Secure login completed"));
    }

    private String getCustomerId(Jwt jwt) {
        List<String> customerIds = jwt.hasClaim("customerId") ? jwt.getClaimAsStringList("customerId") : null;
        return customerIds != null && !customerIds.isEmpty() ? customerIds.get(0) : jwt.getSubject();
    }
}
