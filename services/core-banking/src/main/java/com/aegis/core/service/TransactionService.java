package com.aegis.core.service;

import com.aegis.core.dto.TransferRequest;
import com.aegis.core.entity.*;
import com.aegis.core.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final FraudScreeningService fraudScreeningService;

    public TransactionService(AccountRepository accountRepository, 
                              TransactionRepository transactionRepository,
                              LedgerEntryRepository ledgerEntryRepository,
                              OutboxEventRepository outboxEventRepository,
                              FraudScreeningService fraudScreeningService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.outboxEventRepository = outboxEventRepository;
        this.fraudScreeningService = fraudScreeningService;
    }

    @Transactional
    public Transaction processTransfer(TransferRequest request) {
        if (request.getIdempotencyKey() != null) {
            transactionRepository.findByIdempotencyKey(request.getIdempotencyKey())
                .ifPresent(t -> { throw new RuntimeException("Duplicate transaction"); });
        }

        String acc1 = request.getSenderAccountNumber();
        String acc2 = request.getReceiverAccountNumber();
        
        Account sender, receiver;
        if (acc1.compareTo(acc2) < 0) {
            sender = accountRepository.findByAccountNumberForUpdate(acc1).orElseThrow();
            receiver = accountRepository.findByAccountNumberForUpdate(acc2).orElseThrow();
        } else {
            receiver = accountRepository.findByAccountNumberForUpdate(acc2).orElseThrow();
            sender = accountRepository.findByAccountNumberForUpdate(acc1).orElseThrow();
        }

        ensureAccountsActive(sender, receiver);

        if (sender.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        Transaction tx = new Transaction();
        tx.setReference("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        tx.setSenderAccount(sender);
        tx.setReceiverAccount(receiver);
        tx.setAmount(request.getAmount());
        tx.setIdempotencyKey(request.getIdempotencyKey());
        
        FraudScreeningService.FraudAssessment assessment = fraudScreeningService.evaluate(tx.getReference(), sender, receiver, request.getAmount());
        tx.setRiskScore(assessment.riskScore());
        
        if ("HELD".equals(assessment.decision())) {
            tx.setStatus("HELD");
            tx.setFraudReasons(assessment.reasons());
        } else {
            tx.setStatus("COMPLETED");
            tx.setCompletedAt(LocalDateTime.now());
            
            BigDecimal senderBefore = sender.getBalance();
            BigDecimal senderAfter = senderBefore.subtract(request.getAmount());
            sender.setBalance(senderAfter);
            
            BigDecimal receiverBefore = receiver.getBalance();
            BigDecimal receiverAfter = receiverBefore.add(request.getAmount());
            receiver.setBalance(receiverAfter);

            accountRepository.save(sender);
            accountRepository.save(receiver);

            LedgerEntry debit = new LedgerEntry();
            debit.setTransaction(tx);
            debit.setAccount(sender);
            debit.setEntryType("DEBIT");
            debit.setAmount(request.getAmount());
            debit.setBalanceBefore(senderBefore);
            debit.setBalanceAfter(senderAfter);
            
            LedgerEntry credit = new LedgerEntry();
            credit.setTransaction(tx);
            credit.setAccount(receiver);
            credit.setEntryType("CREDIT");
            credit.setAmount(request.getAmount());
            credit.setBalanceBefore(receiverBefore);
            credit.setBalanceAfter(receiverAfter);

            ledgerEntryRepository.save(debit);
            ledgerEntryRepository.save(credit);
        }

        transactionRepository.save(tx);

        OutboxEvent event = new OutboxEvent();
        event.setAggregateType("Transaction");
        event.setAggregateId(tx.getId().toString());
        event.setEventType(tx.getStatus().equals("COMPLETED") ? "TransactionPosted" : "TransferHeld");
        
        String payload = String.format("{\"transactionId\":\"%s\", \"status\":\"%s\", \"amount\":%s}", 
            tx.getId(), tx.getStatus(), tx.getAmount());
        event.setPayload(payload);
        
        outboxEventRepository.save(event);

        return tx;
    }

    @Transactional
    public Transaction approveTransaction(UUID transactionId) {
        Transaction tx = transactionRepository.findByIdWithAccounts(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        
        if (!"HELD".equals(tx.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Transaction is not in HELD status");
        }

        // Lock accounts in consistent order to prevent deadlock
        String acc1 = tx.getSenderAccount().getAccountNumber();
        String acc2 = tx.getReceiverAccount().getAccountNumber();
        
        Account sender, receiver;
        if (acc1.compareTo(acc2) < 0) {
            sender = accountRepository.findByAccountNumberForUpdate(acc1).orElseThrow();
            receiver = accountRepository.findByAccountNumberForUpdate(acc2).orElseThrow();
        } else {
            receiver = accountRepository.findByAccountNumberForUpdate(acc2).orElseThrow();
            sender = accountRepository.findByAccountNumberForUpdate(acc1).orElseThrow();
        }

        ensureAccountsActive(sender, receiver);

        if (sender.getBalance().compareTo(tx.getAmount()) < 0) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Insufficient funds for approval");
        }

        tx.setStatus("APPROVED");
        tx.setCompletedAt(LocalDateTime.now());
        
        BigDecimal senderBefore = sender.getBalance();
        BigDecimal senderAfter = senderBefore.subtract(tx.getAmount());
        sender.setBalance(senderAfter);
        
        BigDecimal receiverBefore = receiver.getBalance();
        BigDecimal receiverAfter = receiverBefore.add(tx.getAmount());
        receiver.setBalance(receiverAfter);

        accountRepository.save(sender);
        accountRepository.save(receiver);

        LedgerEntry debit = new LedgerEntry();
        debit.setTransaction(tx);
        debit.setAccount(sender);
        debit.setEntryType("DEBIT");
        debit.setAmount(tx.getAmount());
        debit.setBalanceBefore(senderBefore);
        debit.setBalanceAfter(senderAfter);
        
        LedgerEntry credit = new LedgerEntry();
        credit.setTransaction(tx);
        credit.setAccount(receiver);
        credit.setEntryType("CREDIT");
        credit.setAmount(tx.getAmount());
        credit.setBalanceBefore(receiverBefore);
        credit.setBalanceAfter(receiverAfter);

        ledgerEntryRepository.save(debit);
        ledgerEntryRepository.save(credit);

        transactionRepository.save(tx);

        OutboxEvent event = new OutboxEvent();
        event.setAggregateType("Transaction");
        event.setAggregateId(tx.getId().toString());
        event.setEventType("TransactionApproved");
        String payload = String.format("{\"transactionId\":\"%s\", \"status\":\"APPROVED\", \"amount\":%s}", 
            tx.getId(), tx.getAmount());
        event.setPayload(payload);
        outboxEventRepository.save(event);

        return tx;
    }

    @Transactional
    public Transaction rejectTransaction(UUID transactionId) {
        Transaction tx = transactionRepository.findByIdWithAccounts(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        
        if (!"HELD".equals(tx.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Transaction is not in HELD status");
        }

        tx.setStatus("REJECTED");
        tx.setCompletedAt(LocalDateTime.now());
        transactionRepository.save(tx);

        OutboxEvent event = new OutboxEvent();
        event.setAggregateType("Transaction");
        event.setAggregateId(tx.getId().toString());
        event.setEventType("TransactionRejected");
        String payload = String.format("{\"transactionId\":\"%s\", \"status\":\"REJECTED\", \"amount\":%s}", 
            tx.getId(), tx.getAmount());
        event.setPayload(payload);
        outboxEventRepository.save(event);

        return tx;
    }

    private void ensureAccountsActive(Account sender, Account receiver) {
        if (!"ACTIVE".equals(sender.getStatus()) || !"ACTIVE".equals(receiver.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Transfers are unavailable while an account is frozen");
        }
    }
}
