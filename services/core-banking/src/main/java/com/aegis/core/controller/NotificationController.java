package com.aegis.core.controller;

import com.aegis.core.entity.CustomerNotification;
import com.aegis.core.service.CustomerNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/core/notifications")
public class NotificationController {
    private final CustomerNotificationService notificationService;
    public NotificationController(CustomerNotificationService notificationService) { this.notificationService = notificationService; }

    @GetMapping
    public ResponseEntity<List<CustomerNotification>> getNotifications(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(notificationService.getForCustomer(CustomerIdentity.customerId(jwt)));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal Jwt jwt) {
        notificationService.markAllRead(CustomerIdentity.customerId(jwt));
        return ResponseEntity.noContent().build();
    }
}
