package com.aegis.fraud.repository;

import com.aegis.fraud.entity.FraudResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface FraudResultRepository extends JpaRepository<FraudResult, UUID> {
}
