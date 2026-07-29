package com.aegis.identity.repository;

import com.aegis.identity.entity.CustomerIdentity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CustomerIdentityRepository extends JpaRepository<CustomerIdentity, UUID> {
    Optional<CustomerIdentity> findByCustomerId(String customerId);
}
