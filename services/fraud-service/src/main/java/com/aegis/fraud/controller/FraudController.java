package com.aegis.fraud.controller;

import com.aegis.fraud.dto.FraudEvaluationRequest;
import com.aegis.fraud.dto.FraudEvaluationResponse;
import com.aegis.fraud.service.FraudService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/fraud")
public class FraudController {

    private final FraudService fraudService;

    public FraudController(FraudService fraudService) {
        this.fraudService = fraudService;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<FraudEvaluationResponse> evaluateTransaction(@RequestBody FraudEvaluationRequest request) {
        FraudEvaluationResponse response = fraudService.evaluate(request);
        return ResponseEntity.ok(response);
    }
}
