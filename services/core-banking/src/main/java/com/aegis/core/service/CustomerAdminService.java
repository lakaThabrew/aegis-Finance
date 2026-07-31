package com.aegis.core.service;

import com.aegis.core.dto.CustomerCreateRequest;
import com.aegis.core.dto.CustomerProfileUpdateRequest;
import com.aegis.core.dto.CustomerUpdateRequest;
import com.aegis.core.entity.Customer;
import com.aegis.core.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CustomerAdminService {

    private final CustomerRepository customerRepository;

    public CustomerAdminService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public List<Customer> getCustomers() {
        return customerRepository.findAllByActiveTrueOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Customer getCustomerProfile(String customerId) {
        return customerRepository.findByCustomerIdAndActiveTrue(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer profile not found"));
    }

    @Transactional
    public Customer updateCustomerProfile(String customerId, CustomerProfileUpdateRequest request) {
        Customer customer = getCustomerProfile(customerId);
        String email = request.email().trim().toLowerCase();
        if (!customer.getEmail().equalsIgnoreCase(email) && customerRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email address already exists");
        }

        customer.setFullName(request.fullName().trim());
        customer.setEmail(email);
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer createCustomer(CustomerCreateRequest request) {
        String customerId = request.customerId().trim();
        String email = request.email().trim().toLowerCase();
        if (customerRepository.existsByCustomerId(customerId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Customer ID already exists");
        }
        if (customerRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email address already exists");
        }

        Customer customer = new Customer();
        customer.setCustomerId(customerId);
        applyChanges(customer, request.fullName(), email, request.verificationStatus(), request.riskScore());
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(UUID id, CustomerUpdateRequest request) {
        Customer customer = getActiveCustomer(id);
        String email = request.email().trim().toLowerCase();
        if (!customer.getEmail().equalsIgnoreCase(email) && customerRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email address already exists");
        }

        applyChanges(customer, request.fullName(), email, request.verificationStatus(), request.riskScore());
        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(UUID id) {
        Customer customer = getActiveCustomer(id);
        // Keep financial records and account ownership intact for auditability.
        customer.setActive(false);
        customerRepository.save(customer);
    }

    private Customer getActiveCustomer(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        if (!customer.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
        }
        return customer;
    }

    private void applyChanges(Customer customer, String fullName, String email, String verificationStatus, Integer riskScore) {
        customer.setFullName(fullName.trim());
        customer.setEmail(email.trim().toLowerCase());
        customer.setVerificationStatus(verificationStatus);
        customer.setRiskScore(riskScore);
    }
}
