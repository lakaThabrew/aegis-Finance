package com.aegis.fraud.dto;

import java.util.List;

public class FraudEvaluationResponse {
    private int riskScore;
    private List<String> reasons;
    private String decision; // APPROVED or HELD

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }
    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }
    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
}
