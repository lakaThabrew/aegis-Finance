package com.aegis.core.service;

import com.aegis.core.entity.SecurityEvent;
import com.aegis.core.repository.SecurityEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SecurityEventService {

    private final SecurityEventRepository securityEventRepository;
    private final CustomerNotificationService notificationService;

    public SecurityEventService(SecurityEventRepository securityEventRepository, CustomerNotificationService notificationService) {
        this.securityEventRepository = securityEventRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<SecurityEvent> getEvents(String customerId) {
        return securityEventRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional
    public SecurityEvent record(String customerId, String eventType, String message) {
        SecurityEvent event = new SecurityEvent();
        event.setCustomerId(customerId);
        event.setEventType(eventType);
        event.setMessage(message);
        SecurityEvent saved = securityEventRepository.save(event);
        String title = switch (eventType) {
            case "LOGIN_SUCCESSFUL" -> "Secure login";
            case "ACCOUNT_FROZEN" -> "Account frozen";
            case "ACCOUNT_UNFROZEN" -> "Account unfrozen";
            default -> "Security activity";
        };
        notificationService.create(customerId, "security", title, message);
        return saved;
    }
}
