package com.aegis.core.service;

import com.aegis.core.entity.CustomerNotification;
import com.aegis.core.repository.CustomerNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerNotificationService {
    private final CustomerNotificationRepository repository;

    public CustomerNotificationService(CustomerNotificationRepository repository) { this.repository = repository; }

    public CustomerNotification create(String customerId, String type, String title, String message) {
        CustomerNotification notification = new CustomerNotification();
        notification.setCustomerId(customerId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return repository.save(notification);
    }

    public List<CustomerNotification> getForCustomer(String customerId) {
        return repository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional
    public void markAllRead(String customerId) {
        List<CustomerNotification> unread = repository.findByCustomerIdAndReadFalse(customerId);
        unread.forEach(notification -> notification.setRead(true));
        repository.saveAll(unread);
    }
}
