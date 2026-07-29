package com.aegis.fraud.service;

import com.aegis.fraud.dto.FraudEvaluationRequest;
import com.aegis.fraud.dto.FraudEvaluationResponse;
import com.aegis.fraud.entity.FraudResult;
import com.aegis.fraud.repository.FraudResultRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class FraudService {

    private final FraudResultRepository repository;
    private final RestTemplate restTemplate;

    public FraudService(FraudResultRepository repository) {
        this.repository = repository;
        this.restTemplate = new RestTemplate();
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

        // Call Python ML Engine
        try {
            String mlUrl = "http://fraud-ml-engine:8000/api/v1/ml/evaluate";
            
            Map<String, Object> mlRequest = new HashMap<>();
            mlRequest.put("transactionReference", request.getTransactionReference());
            mlRequest.put("amount", request.getAmount().doubleValue());
            // Since we only have limited info in current DTO, mock balance features for ML payload
            mlRequest.put("oldbalanceOrg", 15000.0);
            mlRequest.put("newbalanceOrig", 15000.0 - request.getAmount().doubleValue());
            mlRequest.put("oldbalanceDest", 5000.0);
            mlRequest.put("newbalanceDest", 5000.0 + request.getAmount().doubleValue());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mlRequest, headers);

            ResponseEntity<Map> mlResponse = restTemplate.postForEntity(mlUrl, entity, Map.class);
            
            if (mlResponse.getStatusCode().is2xxSuccessful() && mlResponse.getBody() != null) {
                Map<String, Object> body = mlResponse.getBody();
                Double mlRiskScore = (Double) body.get("mlRiskScore");
                
                if (mlRiskScore != null) {
                    riskScore += mlRiskScore.intValue();
                    reasons.add("ML Engine Risk Score: " + mlRiskScore);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to call ML Engine: " + e.getMessage());
            // Fallback to rules engine only
        }
        
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
