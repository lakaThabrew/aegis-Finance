package com.aegis.core.repository;

import com.aegis.core.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, UUID> {
    List<Beneficiary> findByCustomerId(String customerId);
}
