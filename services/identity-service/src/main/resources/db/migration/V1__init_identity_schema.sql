CREATE TABLE customer_identities (
    id UUID PRIMARY KEY,
    customer_id VARCHAR(255) UNIQUE NOT NULL,
    verification_status VARCHAR(50) NOT NULL,
    risk_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customer_identities (id, customer_id, verification_status, risk_score) VALUES
('e1111111-e111-e111-e111-e11111111111', 'customer-001', 'VERIFIED', 10),
('e2222222-e222-e222-e222-e22222222222', 'customer-002', 'PENDING', 50),
('e3333333-e333-e333-e333-e33333333333', 'customer-045', 'REJECTED', 95);
