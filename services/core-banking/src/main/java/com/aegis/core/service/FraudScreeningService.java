package com.aegis.core.service;

import com.aegis.core.entity.Account;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class FraudScreeningService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String fraudServiceUrl;

    public FraudScreeningService(@Value("${fraud.service.url:http://localhost:8082}") String fraudServiceUrl) {
        this.fraudServiceUrl = fraudServiceUrl;
    }

    public FraudAssessment evaluate(String reference, Account sender, Account receiver, BigDecimal amount) {
        Map<String, Object> request = Map.of(
                "transactionReference", reference,
                "senderAccountNumber", sender.getAccountNumber(),
                "receiverAccountNumber", receiver.getAccountNumber(),
                "amount", amount,
                "currency", sender.getCurrency(),
                "senderBalance", sender.getBalance(),
                "receiverBalance", receiver.getBalance()
        );
        try {
            ResponseEntity<FraudResponse> response = restTemplate.postForEntity(fraudServiceUrl + "/api/v1/fraud/evaluate", request, FraudResponse.class);
            FraudResponse body = response.getBody();
            if (!response.getStatusCode().is2xxSuccessful() || body == null) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Fraud screening is unavailable");
            }
            return new FraudAssessment(body.riskScore(), body.decision(), String.join(", ", body.reasons() == null ? List.of() : body.reasons()));
        } catch (ResponseStatusException error) {
            throw error;
        } catch (Exception error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Fraud screening is unavailable", error);
        }
    }

    public record FraudAssessment(int riskScore, String decision, String reasons) { }
    private record FraudResponse(int riskScore, List<String> reasons, String decision) { }
}
