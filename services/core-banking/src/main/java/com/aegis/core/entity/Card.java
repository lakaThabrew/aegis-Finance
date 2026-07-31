package com.aegis.core.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cards")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "customer_id", nullable = false)
    private String customerId;

    @Column(name = "account_id")
    private UUID accountId;

    @Column(name = "card_number", unique = true, nullable = false)
    private String cardNumber;

    @Column(nullable = false)
    private String expiry;

    @Column(nullable = false)
    private String cvv;

    @Column(name = "is_frozen")
    private Boolean isFrozen = false;

    @Column(name = "online_payments")
    private Boolean onlinePayments = true;

    @Column(name = "international_payments")
    private Boolean internationalPayments = false;

    @Column(name = "contactless")
    private Boolean contactless = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public UUID getAccountId() { return accountId; }
    public void setAccountId(UUID accountId) { this.accountId = accountId; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getExpiry() { return expiry; }
    public void setExpiry(String expiry) { this.expiry = expiry; }

    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }

    public Boolean getIsFrozen() { return isFrozen; }
    public void setIsFrozen(Boolean frozen) { isFrozen = frozen; }

    public Boolean getOnlinePayments() { return onlinePayments; }
    public void setOnlinePayments(Boolean onlinePayments) { this.onlinePayments = onlinePayments; }

    public Boolean getInternationalPayments() { return internationalPayments; }
    public void setInternationalPayments(Boolean internationalPayments) { this.internationalPayments = internationalPayments; }

    public Boolean getContactless() { return contactless; }
    public void setContactless(Boolean contactless) { this.contactless = contactless; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
