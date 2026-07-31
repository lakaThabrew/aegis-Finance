package com.aegis.core.service;

import com.aegis.core.dto.CustomerCreateRequest;
import com.aegis.core.dto.CustomerProfileUpdateRequest;
import com.aegis.core.dto.CustomerUpdateRequest;
import com.aegis.core.entity.Customer;
import com.aegis.core.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerAdminServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerAdminService customerAdminService;

    @Test
    void createsNormalizedCustomerProfile() {
        CustomerCreateRequest request = new CustomerCreateRequest(
                " customer-008 ", " Nadeesha Silva ", "Nadeesha@Example.COM ", "PENDING", 25);
        when(customerRepository.existsByCustomerId("customer-008")).thenReturn(false);
        when(customerRepository.existsByEmail("nadeesha@example.com")).thenReturn(false);
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Customer result = customerAdminService.createCustomer(request);

        assertEquals("customer-008", result.getCustomerId());
        assertEquals("Nadeesha Silva", result.getFullName());
        assertEquals("nadeesha@example.com", result.getEmail());
        assertEquals("PENDING", result.getVerificationStatus());
        assertEquals(25, result.getRiskScore());
    }

    @Test
    void updatesExistingCustomerProfile() {
        UUID id = UUID.randomUUID();
        Customer existing = new Customer();
        existing.setId(id);
        existing.setActive(true);
        existing.setEmail("old@example.com");
        when(customerRepository.findById(id)).thenReturn(Optional.of(existing));
        when(customerRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(customerRepository.save(existing)).thenReturn(existing);

        Customer result = customerAdminService.updateCustomer(id,
                new CustomerUpdateRequest("New Name", "NEW@example.com", "VERIFIED", 10));

        assertEquals("New Name", result.getFullName());
        assertEquals("new@example.com", result.getEmail());
        assertEquals("VERIFIED", result.getVerificationStatus());
        assertEquals(10, result.getRiskScore());
    }

    @Test
    void deactivatesCustomerInsteadOfRemovingFinancialHistory() {
        UUID id = UUID.randomUUID();
        Customer existing = new Customer();
        existing.setId(id);
        existing.setActive(true);
        when(customerRepository.findById(id)).thenReturn(Optional.of(existing));

        customerAdminService.deleteCustomer(id);

        assertFalse(existing.isActive());
        ArgumentCaptor<Customer> savedCustomer = ArgumentCaptor.forClass(Customer.class);
        verify(customerRepository).save(savedCustomer.capture());
        assertFalse(savedCustomer.getValue().isActive());
    }

    @Test
    void updatesOnlyTheAuthenticatedCustomersProfile() {
        Customer existing = new Customer();
        existing.setActive(true);
        existing.setCustomerId("customer-001");
        existing.setEmail("you@aegis.finance");
        when(customerRepository.findByCustomerIdAndActiveTrue("customer-001")).thenReturn(Optional.of(existing));
        when(customerRepository.existsByEmail("customer.user@example.com")).thenReturn(false);
        when(customerRepository.save(existing)).thenReturn(existing);

        Customer result = customerAdminService.updateCustomerProfile("customer-001",
                new CustomerProfileUpdateRequest("Customer User", "Customer.User@Example.com"));

        assertEquals("Customer User", result.getFullName());
        assertEquals("customer.user@example.com", result.getEmail());
        assertEquals("customer-001", result.getCustomerId());
    }
}
