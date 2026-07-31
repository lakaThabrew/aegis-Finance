CREATE TABLE security_events (
    id UUID PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    message VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_events_customer_created ON security_events(customer_id, created_at DESC);
