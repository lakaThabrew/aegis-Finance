package com.aegis.core.job;

import com.aegis.core.entity.OutboxEvent;
import com.aegis.core.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OutboxPollingService {

    private static final Logger log = LoggerFactory.getLogger(OutboxPollingService.class);
    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    
    private static final String TOPIC = "transaction-events";

    public OutboxPollingService(OutboxEventRepository outboxEventRepository, KafkaTemplate<String, String> kafkaTemplate) {
        this.outboxEventRepository = outboxEventRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processOutboxEvents() {
        // In a real high-throughput system, we would select top N events, process, and delete.
        // For this hackathon, we fetch all current events and process them.
        List<OutboxEvent> events = outboxEventRepository.findAll();
        
        if (events.isEmpty()) {
            return;
        }
        
        log.info("Found {} outbox events to process", events.size());
        
        for (OutboxEvent event : events) {
            try {
                kafkaTemplate.send(TOPIC, event.getAggregateId(), event.getPayload());
                outboxEventRepository.delete(event);
                log.info("Successfully published event {} for aggregate {} and removed from outbox", 
                    event.getEventType(), event.getAggregateId());
            } catch (Exception e) {
                log.error("Failed to publish outbox event id {}: {}", event.getId(), e.getMessage());
                // Will retry on next schedule tick
            }
        }
    }
}
