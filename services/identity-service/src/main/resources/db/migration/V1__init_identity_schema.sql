-- ============================================================================
-- Aegis Identity Service — Complete Schema & Seed Data
-- ============================================================================

CREATE TABLE customer_identities (
    id UUID PRIMARY KEY,
    customer_id VARCHAR(255) UNIQUE NOT NULL,
    verification_status VARCHAR(50) NOT NULL,
    risk_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed: All 7 customers with varied verification states
INSERT INTO customer_identities (id, customer_id, verification_status, risk_score) VALUES
('e1111111-e111-e111-e111-e11111111111', 'customer-001', 'VERIFIED', 10),
('e2222222-e222-e222-e222-e22222222222', 'customer-002', 'PENDING', 50),
('e3333333-e333-e333-e333-e33333333333', 'customer-045', 'REJECTED', 95),
('e4444444-e444-e444-e444-e44444444444', 'customer-003', 'VERIFIED', 15),
('e5555555-e555-e555-e555-e55555555555', 'customer-004', 'PENDING', 35),
('e6666666-e666-e666-e666-e66666666666', 'customer-005', 'REJECTED', 98),
('e7777777-e777-e777-e777-e77777777777', 'customer-006', 'VERIFIED', 5),
('e8888888-e888-e888-e888-e88888888888', 'customer-007', 'PENDING', 40);
