package com.aegis.core.controller;

import com.aegis.core.dto.TransferRequest;
import com.aegis.core.entity.*;
import com.aegis.core.repository.*;
import com.aegis.core.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/core")
public class CoreBankingController {

    private final AccountRepository accountRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;

    public CoreBankingController(AccountRepository accountRepository,
                                 BeneficiaryRepository beneficiaryRepository,
                                 TransactionRepository transactionRepository,
                                 TransactionService transactionService) {
        this.accountRepository = accountRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.transactionRepository = transactionRepository;
        this.transactionService = transactionService;
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
        List<Account> accounts = accountRepository.findByCustomerId(customerId);
        // Find transactions where sender or receiver is one of the user's accounts
        List<Transaction> transactions = transactionRepository.findAll().stream()
                .filter(t -> accounts.contains(t.getSenderAccount()) || accounts.contains(t.getReceiverAccount()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
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
