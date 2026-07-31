package com.aegis.core.controller;

import com.aegis.core.dto.TrustedDeviceUpdateRequest;
import com.aegis.core.entity.TrustedDevice;
import com.aegis.core.service.TrustedDeviceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/core/security/devices")
public class TrustedDeviceController {
    private final TrustedDeviceService deviceService;
    public TrustedDeviceController(TrustedDeviceService deviceService) { this.deviceService = deviceService; }

    @GetMapping
    public ResponseEntity<List<TrustedDevice>> getDevices(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(deviceService.getForCustomer(CustomerIdentity.customerId(jwt)));
    }

    @PostMapping("/current")
    public ResponseEntity<TrustedDevice> recordCurrentDevice(@AuthenticationPrincipal Jwt jwt,
                                                              @RequestHeader(value = "User-Agent", required = false) String userAgent) {
        return ResponseEntity.ok(deviceService.recordLogin(CustomerIdentity.customerId(jwt), userAgent));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TrustedDevice> updateTrust(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                                       @RequestBody TrustedDeviceUpdateRequest request) {
        return ResponseEntity.ok(deviceService.updateTrust(CustomerIdentity.customerId(jwt), id, request.trusted()));
    }
}
