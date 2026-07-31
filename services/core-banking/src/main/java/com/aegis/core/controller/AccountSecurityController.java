package com.aegis.core.controller;

import com.aegis.core.dto.AccountFreezeRequest;
import com.aegis.core.entity.Account;
import com.aegis.core.entity.Card;
import com.aegis.core.repository.AccountRepository;
import com.aegis.core.repository.CardRepository;
import com.aegis.core.service.SecurityEventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/core/accounts")
public class AccountSecurityController {

    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final SecurityEventService securityEventService;

    public AccountSecurityController(AccountRepository accountRepository, CardRepository cardRepository, SecurityEventService securityEventService) {
        this.accountRepository = accountRepository;
        this.cardRepository = cardRepository;
        this.securityEventService = securityEventService;
    }

    @PatchMapping("/{id}/freeze")
    @Transactional
    public ResponseEntity<Account> updateAccountFreeze(@AuthenticationPrincipal Jwt jwt,
                                                         @PathVariable UUID id,
                                                         @RequestBody AccountFreezeRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        if (!account.getCustomerId().equals(getCustomerId(jwt))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot change this account");
        }

        boolean frozen = request.frozen();
        account.setStatus(frozen ? "FROZEN" : "ACTIVE");
        List<Card> linkedCards = cardRepository.findByAccountId(id);
        linkedCards.forEach(card -> card.setIsFrozen(frozen));
        cardRepository.saveAll(linkedCards);
        securityEventService.record(account.getCustomerId(), frozen ? "ACCOUNT_FROZEN" : "ACCOUNT_UNFROZEN",
                String.format("Account %s and %d linked card(s) %s", account.getAccountNumber(), linkedCards.size(), frozen ? "frozen" : "unfrozen"));
        return ResponseEntity.ok(accountRepository.save(account));
    }

    private String getCustomerId(Jwt jwt) {
        List<String> customerIds = jwt.hasClaim("customerId") ? jwt.getClaimAsStringList("customerId") : null;
        return customerIds != null && !customerIds.isEmpty() ? customerIds.get(0) : jwt.getSubject();
    }
}
