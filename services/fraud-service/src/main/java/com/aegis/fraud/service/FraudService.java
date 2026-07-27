package com.aegis.fraud.service;

import com.aegis.fraud.dto.FraudEvaluationRequest;
import com.aegis.fraud.dto.FraudEvaluationResponse;
import com.aegis.fraud.entity.FraudResult;
import com.aegis.fraud.repository.FraudResultRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FraudService {

    private final FraudResultRepository repository;

    public FraudService(FraudResultRepository repository) {
        this.repository = repository;
    }

    public FraudEvaluationResponse evaluate(FraudEvaluationRequest request) {
        int riskScore = 10;
        List<String> reasons = new ArrayList<>();

        // Basic Rules Engine
        if (request.getAmount().compareTo(new BigDecimal("10000")) > 0) {
            riskScore += 65;
            reasons.add("Large transaction amount");
        }
        
        if (request.getAmount().compareTo(new BigDecimal("50000")) > 0) {
            riskScore += 20;
            reasons.add("Exceptionally large transaction amount");
        }

        // Additional simple checks can be added here
        
        // Cap risk score at 100
        riskScore = Math.min(riskScore, 100);
        
        String decision = (riskScore >= 70) ? "HELD" : "APPROVED";

        // Save result
        FraudResult result = new FraudResult();
        result.setTransactionReference(request.getTransactionReference());
        result.setSenderAccountNumber(request.getSenderAccountNumber());
        result.setReceiverAccountNumber(request.getReceiverAccountNumber());
        result.setAmount(request.getAmount());
        result.setRiskScore(riskScore);
        result.setReasons(String.join(", ", reasons));
        
        repository.save(result);

        FraudEvaluationResponse response = new FraudEvaluationResponse();
        response.setRiskScore(riskScore);
        response.setReasons(reasons);
        response.setDecision(decision);

        return response;
    }
}
