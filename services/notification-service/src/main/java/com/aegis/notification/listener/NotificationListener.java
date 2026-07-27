package com.aegis.notification.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationListener.class);

    @KafkaListener(topics = "transaction-events", groupId = "notification-group")
    public void handleTransactionEvent(String payload) {
        // In a real scenario, we would parse the JSON payload and send an email or SMS
        log.info("🔔 [NOTIFICATION SENT] Received event from Kafka: {}", payload);
        // e.g. EmailService.send(userEmail, "Your transfer was successful!");
    }
}
