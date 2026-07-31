package com.aegis.core.controller;

import com.aegis.core.dto.CardControlRequest;
import com.aegis.core.entity.Card;
import com.aegis.core.repository.CardRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/core/cards")
public class CardController {

    private final CardRepository cardRepository;

    public CardController(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    private String getCustomerId(Jwt jwt) {
        if (jwt.hasClaim("customerId")) {
            List<String> customerIds = jwt.getClaimAsStringList("customerId");
            if (customerIds != null && !customerIds.isEmpty()) {
                return customerIds.get(0);
            }
        }
        return jwt.getSubject();
    }

    @GetMapping
    public ResponseEntity<List<Card>> getCards(@AuthenticationPrincipal Jwt jwt) {
        String customerId = getCustomerId(jwt);
        return ResponseEntity.ok(cardRepository.findByCustomerId(customerId));
    }

    @PatchMapping("/{id}/controls")
    public ResponseEntity<Card> updateCardControls(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody CardControlRequest request) {
        
        String customerId = getCustomerId(jwt);
        Card card = cardRepository.findById(id).orElseThrow();
        
        if (!card.getCustomerId().equals(customerId)) {
            return ResponseEntity.status(403).build();
        }

        if (request.getIsFrozen() != null) {
            card.setIsFrozen(request.getIsFrozen());
        }
        if (request.getOnlinePayments() != null) {
            card.setOnlinePayments(request.getOnlinePayments());
        }
        if (request.getInternationalPayments() != null) {
            card.setInternationalPayments(request.getInternationalPayments());
        }
        if (request.getContactless() != null) {
            card.setContactless(request.getContactless());
        }

        return ResponseEntity.ok(cardRepository.save(card));
    }
}
