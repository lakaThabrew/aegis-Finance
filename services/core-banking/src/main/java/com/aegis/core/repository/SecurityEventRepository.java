package com.aegis.core.repository;

import com.aegis.core.entity.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SecurityEventRepository extends JpaRepository<SecurityEvent, UUID> {
    List<SecurityEvent> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    List<SecurityEvent> findAllByOrderByCreatedAtDesc();
}
