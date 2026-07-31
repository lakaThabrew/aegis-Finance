CREATE TABLE customer_notifications (
    id UUID PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_notifications_customer_created ON customer_notifications(customer_id, created_at DESC);

CREATE TABLE trusted_devices (
    id UUID PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    user_agent VARCHAR(1000) NOT NULL,
    trusted BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_trusted_devices_customer_agent UNIQUE (customer_id, user_agent)
);

CREATE INDEX idx_trusted_devices_customer_seen ON trusted_devices(customer_id, last_seen DESC);
