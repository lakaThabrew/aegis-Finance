package com.aegis.core.service;

import com.aegis.core.dto.TransferRequest;
import com.aegis.core.entity.Account;
import com.aegis.core.entity.Transaction;
import com.aegis.core.repository.AccountRepository;
import com.aegis.core.repository.LedgerEntryRepository;
import com.aegis.core.repository.OutboxEventRepository;
import com.aegis.core.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private LedgerEntryRepository ledgerEntryRepository;

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Account senderAccount;
    private Account receiverAccount;
    private TransferRequest request;

    @BeforeEach
    void setUp() {
        senderAccount = new Account();
        senderAccount.setAccountNumber("ACC-1");
        senderAccount.setBalance(new BigDecimal("1000.00"));

        receiverAccount = new Account();
        receiverAccount.setAccountNumber("ACC-2");
        receiverAccount.setBalance(new BigDecimal("500.00"));

        request = new TransferRequest();
        request.setSenderAccountNumber("ACC-1");
        request.setReceiverAccountNumber("ACC-2");
        request.setAmount(new BigDecimal("200.00"));

        // Fix NPE by mocking save to generate an ID
        lenient().when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> {
            Transaction t = i.getArgument(0);
            if (t.getId() == null) {
                t.setId(java.util.UUID.randomUUID());
            }
            return t;
        });
    }

    @Test
    void shouldProcessTransferSuccessfully() {
        // Arrange
        when(accountRepository.findByAccountNumberForUpdate("ACC-1")).thenReturn(Optional.of(senderAccount));
        when(accountRepository.findByAccountNumberForUpdate("ACC-2")).thenReturn(Optional.of(receiverAccount));

        // Act
        Transaction result = transactionService.processTransfer(request);

        // Assert
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(new BigDecimal("800.00"), senderAccount.getBalance());
        assertEquals(new BigDecimal("700.00"), receiverAccount.getBalance());
        assertEquals(10, result.getRiskScore()); // Mocked rule for < 10000

        verify(accountRepository, times(2)).save(any(Account.class));
        verify(ledgerEntryRepository, times(2)).save(any());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(outboxEventRepository, times(1)).save(any());
    }

    @Test
    void shouldHoldTransferIfHighRisk() {
        // Arrange
        request.setAmount(new BigDecimal("25000.00")); // Triggers riskScore > 70
        senderAccount.setBalance(new BigDecimal("50000.00"));

        when(accountRepository.findByAccountNumberForUpdate("ACC-1")).thenReturn(Optional.of(senderAccount));
        when(accountRepository.findByAccountNumberForUpdate("ACC-2")).thenReturn(Optional.of(receiverAccount));

        // Act
        Transaction result = transactionService.processTransfer(request);

        // Assert
        assertEquals("HELD", result.getStatus());
        assertEquals("High risk score detected", result.getFraudReasons());
        
        // Balances should remain untouched
        assertEquals(new BigDecimal("50000.00"), senderAccount.getBalance());
        assertEquals(new BigDecimal("500.00"), receiverAccount.getBalance());

        // No ledger entries should be made
        verify(ledgerEntryRepository, never()).save(any());
        
        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(outboxEventRepository, times(1)).save(any());
    }

    @Test
    void shouldThrowExceptionIfInsufficientFunds() {
        // Arrange
        request.setAmount(new BigDecimal("2000.00")); // Sender only has 1000

        when(accountRepository.findByAccountNumberForUpdate("ACC-1")).thenReturn(Optional.of(senderAccount));
        when(accountRepository.findByAccountNumberForUpdate("ACC-2")).thenReturn(Optional.of(receiverAccount));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            transactionService.processTransfer(request);
        });

        assertEquals("Insufficient funds", exception.getMessage());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void shouldThrowExceptionIfDuplicateIdempotencyKey() {
        // Arrange
        request.setIdempotencyKey("idemp-key-123");
        when(transactionRepository.findByIdempotencyKey("idemp-key-123")).thenReturn(Optional.of(new Transaction()));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            transactionService.processTransfer(request);
        });

        assertEquals("Duplicate transaction", exception.getMessage());
        verify(accountRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void shouldProcessTransferSuccessfullyWhenIdempotencyKeyProvided() {
        // Arrange
        request.setIdempotencyKey("idemp-key-456");
        when(transactionRepository.findByIdempotencyKey("idemp-key-456")).thenReturn(Optional.empty());
        when(accountRepository.findByAccountNumberForUpdate("ACC-1")).thenReturn(Optional.of(senderAccount));
        when(accountRepository.findByAccountNumberForUpdate("ACC-2")).thenReturn(Optional.of(receiverAccount));

        // Act
        Transaction result = transactionService.processTransfer(request);

        // Assert
        assertEquals("COMPLETED", result.getStatus());
        assertEquals("idemp-key-456", result.getIdempotencyKey());
        verify(transactionRepository, times(1)).findByIdempotencyKey("idemp-key-456");
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }
}
