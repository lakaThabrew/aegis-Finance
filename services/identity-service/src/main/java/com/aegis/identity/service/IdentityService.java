package com.aegis.identity.service;

import com.aegis.identity.entity.CustomerIdentity;
import com.aegis.identity.repository.CustomerIdentityRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class IdentityService {

    private final CustomerIdentityRepository repository;

    public IdentityService(CustomerIdentityRepository repository) {
        this.repository = repository;
    }

    public CustomerIdentity getIdentityStatus(String customerId) {
        return repository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Identity not found for customer: " + customerId));
    }
}
