package com.aegis.fraud.dto;

import java.math.BigDecimal;

public class FraudEvaluationRequest {
    private String transactionReference;
    private String senderAccountNumber;
    private String receiverAccountNumber;
    private BigDecimal amount;
    private String currency;
    private BigDecimal senderBalance;
    private BigDecimal receiverBalance;

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
    public String getSenderAccountNumber() { return senderAccountNumber; }
    public void setSenderAccountNumber(String senderAccountNumber) { this.senderAccountNumber = senderAccountNumber; }
    public String getReceiverAccountNumber() { return receiverAccountNumber; }
    public void setReceiverAccountNumber(String receiverAccountNumber) { this.receiverAccountNumber = receiverAccountNumber; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getSenderBalance() { return senderBalance; }
    public void setSenderBalance(BigDecimal senderBalance) { this.senderBalance = senderBalance; }
    public BigDecimal getReceiverBalance() { return receiverBalance; }
    public void setReceiverBalance(BigDecimal receiverBalance) { this.receiverBalance = receiverBalance; }
}
