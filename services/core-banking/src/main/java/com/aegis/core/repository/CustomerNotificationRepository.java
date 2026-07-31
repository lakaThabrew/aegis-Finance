package com.aegis.core.repository;

import com.aegis.core.entity.CustomerNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CustomerNotificationRepository extends JpaRepository<CustomerNotification, UUID> {
    List<CustomerNotification> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    List<CustomerNotification> findByCustomerIdAndReadFalse(String customerId);
}
