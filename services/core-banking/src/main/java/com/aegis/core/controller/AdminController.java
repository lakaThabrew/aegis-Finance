package com.aegis.core.controller;

import com.aegis.core.entity.Account;
import com.aegis.core.entity.OutboxEvent;
import com.aegis.core.entity.Transaction;
import com.aegis.core.repository.AccountRepository;
import com.aegis.core.repository.OutboxEventRepository;
import com.aegis.core.repository.TransactionRepository;
import com.aegis.core.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/core/admin")
public class AdminController {

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final OutboxEventRepository outboxEventRepository;
    private final AccountRepository accountRepository;

    public AdminController(TransactionRepository transactionRepository,
                           TransactionService transactionService,
                           OutboxEventRepository outboxEventRepository,
                           AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.transactionService = transactionService;
        this.outboxEventRepository = outboxEventRepository;
        this.accountRepository = accountRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Transaction> transactions = transactionRepository.findAll();
        
        long totalTransactions = transactions.size();
        long heldTransfers = transactions.stream().filter(t -> "HELD".equals(t.getStatus())).count();
        BigDecimal totalVolume = transactions.stream()
                .filter(t -> !"REJECTED".equals(t.getStatus()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        long flaggedCount = transactions.stream().filter(t -> t.getRiskScore() >= 70).count();
        double flaggedPercentage = totalTransactions > 0 ? (flaggedCount * 100.0) / totalTransactions : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTransactions", totalTransactions);
        stats.put("heldTransfers", heldTransfers);
        stats.put("totalVolume", totalVolume);
        stats.put("flaggedPercentage", flaggedPercentage);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@RequestParam(required = false) String status) {
        List<Transaction> transactions = transactionRepository.findAll();
        if (status != null && !status.isEmpty()) {
            transactions = transactions.stream()
                    .filter(t -> status.equals(t.getStatus()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/transactions/{id}/approve")
    public ResponseEntity<Transaction> approveTransaction(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.approveTransaction(id));
    }

    @PostMapping("/transactions/{id}/reject")
    public ResponseEntity<Transaction> rejectTransaction(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.rejectTransaction(id));
    }

    @GetMapping("/audit")
    public ResponseEntity<List<OutboxEvent>> getAuditLogs() {
        return ResponseEntity.ok(outboxEventRepository.findAll());
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<Account>> getAccounts() {
        return ResponseEntity.ok(accountRepository.findAll());
    }
}
