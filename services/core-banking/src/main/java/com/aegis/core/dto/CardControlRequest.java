package com.aegis.core.dto;

public class CardControlRequest {
    private Boolean isFrozen;
    private Boolean onlinePayments;
    private Boolean internationalPayments;
    private Boolean contactless;

    public Boolean getIsFrozen() { return isFrozen; }
    public void setIsFrozen(Boolean isFrozen) { this.isFrozen = isFrozen; }

    public Boolean getOnlinePayments() { return onlinePayments; }
    public void setOnlinePayments(Boolean onlinePayments) { this.onlinePayments = onlinePayments; }

    public Boolean getInternationalPayments() { return internationalPayments; }
    public void setInternationalPayments(Boolean internationalPayments) { this.internationalPayments = internationalPayments; }

    public Boolean getContactless() { return contactless; }
    public void setContactless(Boolean contactless) { this.contactless = contactless; }
}
