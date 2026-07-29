package com.aegis.identity.controller;

import com.aegis.identity.entity.CustomerIdentity;
import com.aegis.identity.service.IdentityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/identity")
public class IdentityController {

    private final IdentityService identityService;

    public IdentityController(IdentityService identityService) {
        this.identityService = identityService;
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

    @GetMapping("/status")
    public ResponseEntity<CustomerIdentity> getStatus(@AuthenticationPrincipal Jwt jwt) {
        String customerId = getCustomerId(jwt);
        return ResponseEntity.ok(identityService.getIdentityStatus(customerId));
    }
}
