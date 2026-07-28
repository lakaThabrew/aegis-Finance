package com.aegis.core.controller;

import com.aegis.core.dto.TransferRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Disabled("Requires running PostgreSQL and Kafka containers")
public class CoreBankingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testTransferEndpoint_Success() throws Exception {
        TransferRequest request = new TransferRequest();
        // These accounts are seeded via Flyway V2__seed_demo_data.sql
        request.setSenderAccountNumber("AGS-0001-2024"); 
        request.setReceiverAccountNumber("AGS-0077-2024");
        request.setAmount(new BigDecimal("100.00"));
        request.setIdempotencyKey(UUID.randomUUID().toString());

        mockMvc.perform(post("/api/v1/core/transfer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void testTransferEndpoint_Held() throws Exception {
        TransferRequest request = new TransferRequest();
        request.setSenderAccountNumber("AGS-0001-2024"); 
        request.setReceiverAccountNumber("AGS-0077-2024");
        request.setAmount(new BigDecimal("15000.00")); // Triggers risk rules
        request.setIdempotencyKey(UUID.randomUUID().toString());

        mockMvc.perform(post("/api/v1/core/transfer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("HELD"));
    }
}
