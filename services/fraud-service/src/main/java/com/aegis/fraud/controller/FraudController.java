package com.aegis.fraud.controller;

import com.aegis.fraud.dto.FraudEvaluationRequest;
import com.aegis.fraud.dto.FraudEvaluationResponse;
import com.aegis.fraud.entity.FraudResult;
import com.aegis.fraud.repository.FraudResultRepository;
import com.aegis.fraud.service.FraudService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fraud")
public class FraudController {

    private final FraudService fraudService;
    private final FraudResultRepository fraudResultRepository;

    public FraudController(FraudService fraudService, FraudResultRepository fraudResultRepository) {
        this.fraudService = fraudService;
        this.fraudResultRepository = fraudResultRepository;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<FraudEvaluationResponse> evaluateTransaction(@RequestBody FraudEvaluationRequest request) {
        FraudEvaluationResponse response = fraudService.evaluate(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<FraudResult>> getAlerts() {
        return ResponseEntity.ok(fraudResultRepository.findAll());
    }
}
