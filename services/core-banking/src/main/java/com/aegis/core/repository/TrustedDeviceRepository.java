package com.aegis.core.repository;

import com.aegis.core.entity.TrustedDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TrustedDeviceRepository extends JpaRepository<TrustedDevice, UUID> {
    List<TrustedDevice> findByCustomerIdOrderByLastSeenDesc(String customerId);
    Optional<TrustedDevice> findByCustomerIdAndUserAgent(String customerId, String userAgent);
}
