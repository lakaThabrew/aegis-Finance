package com.aegis.core.controller;

import com.aegis.core.dto.TransferRequest;
import com.aegis.core.dto.CustomerProfileUpdateRequest;
import com.aegis.core.entity.*;
import com.aegis.core.repository.*;
import com.aegis.core.service.CustomerAdminService;
import com.aegis.core.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/core")
public class CoreBankingController {

    private final AccountRepository accountRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final CustomerAdminService customerAdminService;

    public CoreBankingController(AccountRepository accountRepository,
                                 BeneficiaryRepository beneficiaryRepository,
                                 TransactionRepository transactionRepository,
                                 TransactionService transactionService,
                                 CustomerAdminService customerAdminService) {
        this.accountRepository = accountRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.transactionRepository = transactionRepository;
        this.transactionService = transactionService;
        this.customerAdminService = customerAdminService;
    }

    private String getCustomerId(Jwt jwt) {
        if (jwt.hasClaim("customerId")) {
            List<String> customerIds = jwt.getClaimAsStringList("customerId");
            if (customerIds != null && !customerIds.isEmpty()) {
                return customerIds.get(0);
            }
        }
        return jwt.getSubject(); // Fallback
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<Account>> getAccounts(@AuthenticationPrincipal Jwt jwt) {
        String customerId = getCustomerId(jwt);
        return ResponseEntity.ok(accountRepository.findByCustomerId(customerId));
    }

    @GetMapping("/beneficiaries")
    public ResponseEntity<List<Beneficiary>> getBeneficiaries(@AuthenticationPrincipal Jwt jwt) {
        String customerId = getCustomerId(jwt);
        return ResponseEntity.ok(beneficiaryRepository.findByCustomerId(customerId));
    }

    @PostMapping("/beneficiaries")
    public ResponseEntity<Beneficiary> addBeneficiary(@AuthenticationPrincipal Jwt jwt, @RequestBody Beneficiary beneficiary) {
        beneficiary.setCustomerId(getCustomerId(jwt));
        return ResponseEntity.ok(beneficiaryRepository.save(beneficiary));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@AuthenticationPrincipal Jwt jwt) {
        String customerId = getCustomerId(jwt);
        return ResponseEntity.ok(transactionRepository.findForCustomerWithAccounts(customerId));
    }

    @DeleteMapping("/beneficiaries/{id}")
    public ResponseEntity<Void> deleteBeneficiary(@AuthenticationPrincipal Jwt jwt, @PathVariable java.util.UUID id) {
        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Beneficiary not found"));
        if (!beneficiary.getCustomerId().equals(getCustomerId(jwt))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete this beneficiary");
        }
        beneficiaryRepository.delete(beneficiary);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<Customer> getProfile(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(customerAdminService.getCustomerProfile(getCustomerId(jwt)));
    }

    @PutMapping("/profile")
    public ResponseEntity<Customer> updateProfile(@AuthenticationPrincipal Jwt jwt,
                                                   @Valid @RequestBody CustomerProfileUpdateRequest request) {
        return ResponseEntity.ok(customerAdminService.updateCustomerProfile(getCustomerId(jwt), request));
    }

    @PostMapping("/transfer")
    public ResponseEntity<Transaction> transfer(@AuthenticationPrincipal Jwt jwt, @RequestBody TransferRequest request) {
        // Optionally verify that the sender account belongs to the user
        String customerId = getCustomerId(jwt);
        Account sender = accountRepository.findByAccountNumber(request.getSenderAccountNumber()).orElseThrow();
        if (!sender.getCustomerId().equals(customerId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(transactionService.processTransfer(request));
    }
}
