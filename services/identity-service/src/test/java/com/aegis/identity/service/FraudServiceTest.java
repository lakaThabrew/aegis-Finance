package com.aegis.fraud.service;

import com.aegis.fraud.dto.FraudEvaluationRequest;
import com.aegis.fraud.dto.FraudEvaluationResponse;
import com.aegis.fraud.entity.FraudResult;
import com.aegis.fraud.repository.FraudResultRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class FraudServiceTest {

    @Mock
    private FraudResultRepository repository;

    @InjectMocks
    private FraudService fraudService;

    private FraudEvaluationRequest request;

    @BeforeEach
    void setUp() {
        request = new FraudEvaluationRequest();
        request.setTransactionReference("txn-123");
        request.setSenderAccountNumber("ACC-1");
        request.setReceiverAccountNumber("ACC-2");
    }

    @Test
    void shouldApproveWhenAmountIsSmall() {
        // Arrange
        request.setAmount(new BigDecimal("5000"));

        // Act
        FraudEvaluationResponse response = fraudService.evaluate(request);

        // Assert
        assertEquals("APPROVED", response.getDecision());
        assertEquals(10, response.getRiskScore());
        assertEquals(0, response.getReasons().size());
        verify(repository, times(1)).save(any(FraudResult.class));
    }

    @Test
    void shouldHoldWhenAmountIsLarge() {
        // Arrange
        request.setAmount(new BigDecimal("15000")); // > 10000

        // Act
        FraudEvaluationResponse response = fraudService.evaluate(request);

        // Assert
        assertEquals("HELD", response.getDecision());
        assertEquals(75, response.getRiskScore());
        assertEquals(1, response.getReasons().size());
        assertEquals("Large transaction amount", response.getReasons().get(0));
        verify(repository, times(1)).save(any(FraudResult.class));
    }

    @Test
    void shouldCapRiskScoreAt100WhenAmountIsExceptionallyLarge() {
        // Arrange
        request.setAmount(new BigDecimal("60000")); // > 50000

        // Act
        FraudEvaluationResponse response = fraudService.evaluate(request);

        // Assert
        assertEquals("HELD", response.getDecision());
        assertEquals(95, response.getRiskScore()); // 10 + 65 + 20
        assertEquals(2, response.getReasons().size());
        verify(repository, times(1)).save(any(FraudResult.class));
    }
}
