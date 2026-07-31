package com.aegis.core.repository;

import com.aegis.core.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    List<Customer> findAllByActiveTrueOrderByCreatedAtDesc();
    Optional<Customer> findByCustomerIdAndActiveTrue(String customerId);
    boolean existsByCustomerId(String customerId);
    boolean existsByEmail(String email);
}
