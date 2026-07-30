CREATE TABLE cards (
    id UUID PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    card_number VARCHAR(16) UNIQUE NOT NULL,
    expiry VARCHAR(5) NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    is_frozen BOOLEAN DEFAULT FALSE,
    online_payments BOOLEAN DEFAULT TRUE,
    international_payments BOOLEAN DEFAULT FALSE,
    contactless BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Demo Cards
INSERT INTO cards (id, customer_id, card_number, expiry, cvv, is_frozen, online_payments, international_payments, contactless) VALUES
('dddd1111-dddd-1111-dddd-111111111111', 'customer-001', '4111222233334444', '12/29', '842', FALSE, TRUE, FALSE, TRUE),
('dddd2222-dddd-2222-dddd-222222222222', 'customer-002', '5555666677778888', '11/28', '123', FALSE, TRUE, TRUE, TRUE);
