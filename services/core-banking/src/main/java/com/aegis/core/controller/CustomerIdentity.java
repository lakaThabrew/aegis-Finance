package com.aegis.core.controller;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

final class CustomerIdentity {
    private CustomerIdentity() { }
    static String customerId(Jwt jwt) {
        List<String> customerIds = jwt.hasClaim("customerId") ? jwt.getClaimAsStringList("customerId") : null;
        return customerIds != null && !customerIds.isEmpty() ? customerIds.get(0) : jwt.getSubject();
    }
}
