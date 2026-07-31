-- ============================================================================
-- Aegis Core Banking — Complete Schema & Seed Data
-- ============================================================================

-- ==================== SCHEMA ====================

CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    balance DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE beneficiaries (
    id UUID PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    beneficiary_account_number VARCHAR(20) NOT NULL,
    beneficiary_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    reference VARCHAR(50) UNIQUE NOT NULL,
    sender_account_id UUID REFERENCES accounts(id),
    receiver_account_id UUID REFERENCES accounts(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL,
    risk_score INTEGER,
    fraud_reasons TEXT,
    idempotency_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id),
    account_id UUID REFERENCES accounts(id),
    entry_type VARCHAR(10) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outbox_events (
    id UUID PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- ==================== SEED: ACCOUNTS ====================
-- 11 accounts across 7 customers

INSERT INTO accounts (id, customer_id, account_number, currency, balance, status) VALUES
-- customer-001: Primary user (2 accounts)
('11111111-1111-1111-1111-111111111111', 'customer-001', 'AGS-0001-2024', 'USD', 125000.00, 'ACTIVE'),
('22222222-2222-2222-2222-222222222222', 'customer-001', 'AGS-0002-2024', 'USD', 45000.00, 'ACTIVE'),
-- customer-002: Regular user
('33333333-3333-3333-3333-333333333333', 'customer-002', 'AGS-0077-2024', 'USD', 1500.00, 'ACTIVE'),
-- customer-003: Active trader (2 accounts)
('a3001111-a300-1111-a300-111111111111', 'customer-003', 'AGS-0003-2024', 'USD', 250000.00, 'ACTIVE'),
('a3002222-a300-2222-a300-222222222222', 'customer-003', 'AGS-0004-2024', 'USD', 18500.00, 'ACTIVE'),
-- customer-004: New user
('a4001111-a400-1111-a400-111111111111', 'customer-004', 'AGS-0055-2024', 'USD', 2200.00, 'ACTIVE'),
-- customer-005: Frozen / suspicious
('a5001111-a500-1111-a500-111111111111', 'customer-005', 'AGS-0099-2024', 'USD', 67000.00, 'FROZEN'),
-- customer-006: Corporate (2 accounts)
('a6001111-a600-1111-a600-111111111111', 'customer-006', 'AGS-0120-2024', 'USD', 500000.00, 'ACTIVE'),
('a6002222-a600-2222-a600-222222222222', 'customer-006', 'AGS-0121-2024', 'USD', 75000.00, 'ACTIVE'),
-- customer-007: Recently opened
('a7001111-a700-1111-a700-111111111111', 'customer-007', 'AGS-0200-2024', 'USD', 500.00, 'ACTIVE'),
-- customer-045: Frozen by request
('44444444-4444-4444-4444-444444444444', 'customer-045', 'AGS-0045-2024', 'USD', 8900.00, 'FROZEN');

-- ==================== SEED: BENEFICIARIES ====================

INSERT INTO beneficiaries (id, customer_id, beneficiary_account_number, beneficiary_name) VALUES
('55555555-5555-5555-5555-555555555555', 'customer-001', 'AGS-0077-2024', 'Alice Smith'),
('66666666-6666-6666-6666-666666666666', 'customer-001', 'AGS-0045-2024', 'Bob Johnson'),
('b3001111-b300-1111-b300-111111111111', 'customer-001', 'AGS-0003-2024', 'Charlie Lee'),
('b3007777-b300-7777-b300-777777777777', 'customer-001', 'AGS-0120-2024', 'Aegis Corp Holdings'),
('b3002222-b300-2222-b300-222222222222', 'customer-003', 'AGS-0001-2024', 'James Wilson'),
('b3003333-b300-3333-b300-333333333333', 'customer-003', 'AGS-0055-2024', 'Sarah Park'),
('b3006666-b300-6666-b300-666666666666', 'customer-004', 'AGS-0001-2024', 'James Wilson'),
('b3004444-b300-4444-b300-444444444444', 'customer-006', 'AGS-0001-2024', 'James Wilson'),
('b3005555-b300-5555-b300-555555555555', 'customer-006', 'AGS-0003-2024', 'Charlie Lee');

-- ==================== SEED: TRANSACTIONS ====================

-- --- COMPLETED (low-risk, normal flow) ---
INSERT INTO transactions (id, reference, sender_account_id, receiver_account_id, amount, currency, status, risk_score, fraud_reasons, idempotency_key, created_at, completed_at) VALUES
('77777777-7777-7777-7777-777777777777', 'TXN-ABC12345', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 150.00, 'USD', 'COMPLETED', 10, NULL, 'idemp-1', CURRENT_TIMESTAMP - INTERVAL '14 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),
('88888888-8888-8888-8888-888888888888', 'TXN-XYZ98765', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 300.00, 'USD', 'COMPLETED', 12, NULL, 'idemp-2', CURRENT_TIMESTAMP - INTERVAL '13 days', CURRENT_TIMESTAMP - INTERVAL '13 days'),
('d1000001-d100-0001-d100-000000000001', 'TXN-SAL001', '11111111-1111-1111-1111-111111111111', 'a3001111-a300-1111-a300-111111111111', 4500.00, 'USD', 'COMPLETED', 5, NULL, 'idemp-sal001', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('d1000002-d100-0002-d100-000000000002', 'TXN-LRP002', 'a3001111-a300-1111-a300-111111111111', '11111111-1111-1111-1111-111111111111', 1200.00, 'USD', 'COMPLETED', 8, NULL, 'idemp-lrp002', CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
('d1000003-d100-0003-d100-000000000003', 'TXN-SML003', 'a4001111-a400-1111-a400-111111111111', 'a3001111-a300-1111-a300-111111111111', 75.00, 'USD', 'COMPLETED', 3, NULL, 'idemp-sml003', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('d1000004-d100-0004-d100-000000000004', 'TXN-VND004', 'a6001111-a600-1111-a600-111111111111', '11111111-1111-1111-1111-111111111111', 12000.00, 'USD', 'COMPLETED', 15, NULL, 'idemp-vnd004', CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
('d1000005-d100-0005-d100-000000000005', 'TXN-GFT005', '11111111-1111-1111-1111-111111111111', 'a4001111-a400-1111-a400-111111111111', 250.00, 'USD', 'COMPLETED', 2, NULL, 'idemp-gft005', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('d1000006-d100-0006-d100-000000000006', 'TXN-INV006', 'a3001111-a300-1111-a300-111111111111', 'a6001111-a600-1111-a600-111111111111', 8500.00, 'USD', 'COMPLETED', 12, NULL, 'idemp-inv006', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('d1000007-d100-0007-d100-000000000007', 'TXN-WLC007', '22222222-2222-2222-2222-222222222222', 'a7001111-a700-1111-a700-111111111111', 100.00, 'USD', 'COMPLETED', 1, NULL, 'idemp-wlc007', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('d1000008-d100-0008-d100-000000000008', 'TXN-INT008', 'a6001111-a600-1111-a600-111111111111', 'a6002222-a600-2222-a600-222222222222', 25000.00, 'USD', 'COMPLETED', 0, NULL, 'idemp-int008', CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP - INTERVAL '12 hours');

-- --- HELD (high risk — awaiting admin review) ---
INSERT INTO transactions (id, reference, sender_account_id, receiver_account_id, amount, currency, status, risk_score, fraud_reasons, idempotency_key, created_at, completed_at) VALUES
('99999999-9999-9999-9999-999999999999', 'TXN-HELD1234', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 15000.00, 'USD', 'HELD', 85, 'High amount transfer', 'idemp-3', CURRENT_TIMESTAMP - INTERVAL '6 hours', NULL),
('d2000001-d200-0001-d200-000000000001', 'TXN-HLD101', 'a3001111-a300-1111-a300-111111111111', 'a5001111-a500-1111-a500-111111111111', 45000.00, 'USD', 'HELD', 92, 'Large transfer to frozen account; unusual pattern', 'idemp-hld101', CURRENT_TIMESTAMP - INTERVAL '2 hours', NULL),
('d2000002-d200-0002-d200-000000000002', 'TXN-HLD102', 'a6001111-a600-1111-a600-111111111111', 'a5001111-a500-1111-a500-111111111111', 95000.00, 'USD', 'HELD', 88, 'Transfer to flagged account; velocity anomaly detected', 'idemp-hld102', CURRENT_TIMESTAMP - INTERVAL '90 minutes', NULL),
('d2000003-d200-0003-d200-000000000003', 'TXN-HLD103', '11111111-1111-1111-1111-111111111111', 'a7001111-a700-1111-a700-111111111111', 9800.00, 'USD', 'HELD', 76, 'Rapid successive transfers; amount just below reporting threshold', 'idemp-hld103', CURRENT_TIMESTAMP - INTERVAL '45 minutes', NULL),
('d2000004-d200-0004-d200-000000000004', 'TXN-HLD104', 'a4001111-a400-1111-a400-111111111111', '33333333-3333-3333-3333-333333333333', 1800.00, 'USD', 'HELD', 71, 'New account; transfer exceeds 80% of balance', 'idemp-hld104', CURRENT_TIMESTAMP - INTERVAL '20 minutes', NULL);

-- --- REJECTED ---
INSERT INTO transactions (id, reference, sender_account_id, receiver_account_id, amount, currency, status, risk_score, fraud_reasons, idempotency_key, created_at, completed_at) VALUES
('d3000001-d300-0001-d300-000000000001', 'TXN-REJ201', 'a5001111-a500-1111-a500-111111111111', '11111111-1111-1111-1111-111111111111', 30000.00, 'USD', 'REJECTED', 99, 'Sender account frozen; suspected money laundering', 'idemp-rej201', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('d3000002-d300-0002-d300-000000000002', 'TXN-REJ202', 'a3001111-a300-1111-a300-111111111111', 'a5001111-a500-1111-a500-111111111111', 20000.00, 'USD', 'REJECTED', 82, 'Admin rejected: beneficiary under investigation', 'idemp-rej202', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
('d3000003-d300-0003-d300-000000000003', 'TXN-REJ203', 'a7001111-a700-1111-a700-111111111111', 'a6001111-a600-1111-a600-111111111111', 10000.00, 'USD', 'REJECTED', 60, 'Insufficient balance; new account high amount', 'idemp-rej203', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- --- APPROVED (previously held, admin approved) ---
INSERT INTO transactions (id, reference, sender_account_id, receiver_account_id, amount, currency, status, risk_score, fraud_reasons, idempotency_key, created_at, completed_at) VALUES
('d4000001-d400-0001-d400-000000000001', 'TXN-APR301', '11111111-1111-1111-1111-111111111111', 'a3001111-a300-1111-a300-111111111111', 18000.00, 'USD', 'APPROVED', 74, 'High amount but verified beneficiary', 'idemp-apr301', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('d4000002-d400-0002-d400-000000000002', 'TXN-APR302', 'a6001111-a600-1111-a600-111111111111', '11111111-1111-1111-1111-111111111111', 75000.00, 'USD', 'APPROVED', 70, 'Large corporate transfer; manually verified', 'idemp-apr302', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '9 days');

-- ==================== SEED: LEDGER ENTRIES ====================

INSERT INTO ledger_entries (id, transaction_id, account_id, entry_type, amount, balance_before, balance_after) VALUES
-- TXN-ABC12345
('aaaa1111-aaaa-1111-aaaa-111111111111', '77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'DEBIT', 150.00, 125150.00, 125000.00),
('aaaa2222-aaaa-2222-aaaa-222222222222', '77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'CREDIT', 150.00, 1350.00, 1500.00),
-- TXN-XYZ98765
('bbbb1111-bbbb-1111-bbbb-111111111111', '88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 'DEBIT', 300.00, 45300.00, 45000.00),
('bbbb2222-bbbb-2222-bbbb-222222222222', '88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 'CREDIT', 300.00, 1050.00, 1350.00),
-- TXN-SAL001
('e1000001-e100-0001-e100-000000000001', 'd1000001-d100-0001-d100-000000000001', '11111111-1111-1111-1111-111111111111', 'DEBIT', 4500.00, 129500.00, 125000.00),
('e1000002-e100-0002-e100-000000000002', 'd1000001-d100-0001-d100-000000000001', 'a3001111-a300-1111-a300-111111111111', 'CREDIT', 4500.00, 245500.00, 250000.00),
-- TXN-LRP002
('e1000003-e100-0003-e100-000000000003', 'd1000002-d100-0002-d100-000000000002', 'a3001111-a300-1111-a300-111111111111', 'DEBIT', 1200.00, 251200.00, 250000.00),
('e1000004-e100-0004-e100-000000000004', 'd1000002-d100-0002-d100-000000000002', '11111111-1111-1111-1111-111111111111', 'CREDIT', 1200.00, 123800.00, 125000.00),
-- TXN-SML003
('e1000005-e100-0005-e100-000000000005', 'd1000003-d100-0003-d100-000000000003', 'a4001111-a400-1111-a400-111111111111', 'DEBIT', 75.00, 2275.00, 2200.00),
('e1000006-e100-0006-e100-000000000006', 'd1000003-d100-0003-d100-000000000003', 'a3001111-a300-1111-a300-111111111111', 'CREDIT', 75.00, 249925.00, 250000.00),
-- TXN-VND004
('e1000007-e100-0007-e100-000000000007', 'd1000004-d100-0004-d100-000000000004', 'a6001111-a600-1111-a600-111111111111', 'DEBIT', 12000.00, 512000.00, 500000.00),
('e1000008-e100-0008-e100-000000000008', 'd1000004-d100-0004-d100-000000000004', '11111111-1111-1111-1111-111111111111', 'CREDIT', 12000.00, 113000.00, 125000.00),
-- TXN-GFT005
('e1000009-e100-0009-e100-000000000009', 'd1000005-d100-0005-d100-000000000005', '11111111-1111-1111-1111-111111111111', 'DEBIT', 250.00, 125250.00, 125000.00),
('e1000010-e100-0010-e100-000000000010', 'd1000005-d100-0005-d100-000000000005', 'a4001111-a400-1111-a400-111111111111', 'CREDIT', 250.00, 1950.00, 2200.00),
-- TXN-INV006
('e1000011-e100-0011-e100-000000000011', 'd1000006-d100-0006-d100-000000000006', 'a3001111-a300-1111-a300-111111111111', 'DEBIT', 8500.00, 258500.00, 250000.00),
('e1000012-e100-0012-e100-000000000012', 'd1000006-d100-0006-d100-000000000006', 'a6001111-a600-1111-a600-111111111111', 'CREDIT', 8500.00, 491500.00, 500000.00),
-- TXN-WLC007
('e1000013-e100-0013-e100-000000000013', 'd1000007-d100-0007-d100-000000000007', '22222222-2222-2222-2222-222222222222', 'DEBIT', 100.00, 45100.00, 45000.00),
('e1000014-e100-0014-e100-000000000014', 'd1000007-d100-0007-d100-000000000007', 'a7001111-a700-1111-a700-111111111111', 'CREDIT', 100.00, 400.00, 500.00),
-- TXN-INT008
('e1000015-e100-0015-e100-000000000015', 'd1000008-d100-0008-d100-000000000008', 'a6001111-a600-1111-a600-111111111111', 'DEBIT', 25000.00, 525000.00, 500000.00),
('e1000016-e100-0016-e100-000000000016', 'd1000008-d100-0008-d100-000000000008', 'a6002222-a600-2222-a600-222222222222', 'CREDIT', 25000.00, 50000.00, 75000.00),
-- TXN-APR301
('e1000017-e100-0017-e100-000000000017', 'd4000001-d400-0001-d400-000000000001', '11111111-1111-1111-1111-111111111111', 'DEBIT', 18000.00, 143000.00, 125000.00),
('e1000018-e100-0018-e100-000000000018', 'd4000001-d400-0001-d400-000000000001', 'a3001111-a300-1111-a300-111111111111', 'CREDIT', 18000.00, 232000.00, 250000.00),
-- TXN-APR302
('e1000019-e100-0019-e100-000000000019', 'd4000002-d400-0002-d400-000000000002', 'a6001111-a600-1111-a600-111111111111', 'DEBIT', 75000.00, 575000.00, 500000.00),
('e1000020-e100-0020-e100-000000000020', 'd4000002-d400-0002-d400-000000000002', '11111111-1111-1111-1111-111111111111', 'CREDIT', 75000.00, 50000.00, 125000.00);

-- ==================== SEED: OUTBOX EVENTS (audit trail) ====================

-- Completed
INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload, created_at) VALUES
('cccc1111-cccc-1111-cccc-111111111111', 'Transaction', '77777777-7777-7777-7777-777777777777', 'TransactionPosted', '{"transactionId":"77777777-7777-7777-7777-777777777777","reference":"TXN-ABC12345","status":"COMPLETED","amount":150.00}', CURRENT_TIMESTAMP - INTERVAL '14 days'),
('cccc2222-cccc-2222-cccc-222222222222', 'Transaction', '88888888-8888-8888-8888-888888888888', 'TransactionPosted', '{"transactionId":"88888888-8888-8888-8888-888888888888","reference":"TXN-XYZ98765","status":"COMPLETED","amount":300.00}', CURRENT_TIMESTAMP - INTERVAL '13 days'),
('f1000001-f100-0001-f100-000000000001', 'Transaction', 'd1000001-d100-0001-d100-000000000001', 'TransactionPosted', '{"transactionId":"d1000001-d100-0001-d100-000000000001","reference":"TXN-SAL001","status":"COMPLETED","amount":4500.00,"sender":"AGS-0001-2024","receiver":"AGS-0003-2024"}', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('f1000002-f100-0002-f100-000000000002', 'Transaction', 'd1000002-d100-0002-d100-000000000002', 'TransactionPosted', '{"transactionId":"d1000002-d100-0002-d100-000000000002","reference":"TXN-LRP002","status":"COMPLETED","amount":1200.00,"sender":"AGS-0003-2024","receiver":"AGS-0001-2024"}', CURRENT_TIMESTAMP - INTERVAL '6 days'),
('f1000003-f100-0003-f100-000000000003', 'Transaction', 'd1000003-d100-0003-d100-000000000003', 'TransactionPosted', '{"transactionId":"d1000003-d100-0003-d100-000000000003","reference":"TXN-SML003","status":"COMPLETED","amount":75.00,"sender":"AGS-0055-2024","receiver":"AGS-0003-2024"}', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('f1000004-f100-0004-f100-000000000004', 'Transaction', 'd1000004-d100-0004-d100-000000000004', 'TransactionPosted', '{"transactionId":"d1000004-d100-0004-d100-000000000004","reference":"TXN-VND004","status":"COMPLETED","amount":12000.00,"sender":"AGS-0120-2024","receiver":"AGS-0001-2024"}', CURRENT_TIMESTAMP - INTERVAL '4 days'),
('f1000005-f100-0005-f100-000000000005', 'Transaction', 'd1000005-d100-0005-d100-000000000005', 'TransactionPosted', '{"transactionId":"d1000005-d100-0005-d100-000000000005","reference":"TXN-GFT005","status":"COMPLETED","amount":250.00,"sender":"AGS-0001-2024","receiver":"AGS-0055-2024"}', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('f1000006-f100-0006-f100-000000000006', 'Transaction', 'd1000006-d100-0006-d100-000000000006', 'TransactionPosted', '{"transactionId":"d1000006-d100-0006-d100-000000000006","reference":"TXN-INV006","status":"COMPLETED","amount":8500.00,"sender":"AGS-0003-2024","receiver":"AGS-0120-2024"}', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('f1000007-f100-0007-f100-000000000007', 'Transaction', 'd1000007-d100-0007-d100-000000000007', 'TransactionPosted', '{"transactionId":"d1000007-d100-0007-d100-000000000007","reference":"TXN-WLC007","status":"COMPLETED","amount":100.00,"sender":"AGS-0002-2024","receiver":"AGS-0200-2024"}', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('f1000008-f100-0008-f100-000000000008', 'Transaction', 'd1000008-d100-0008-d100-000000000008', 'TransactionPosted', '{"transactionId":"d1000008-d100-0008-d100-000000000008","reference":"TXN-INT008","status":"COMPLETED","amount":25000.00,"sender":"AGS-0120-2024","receiver":"AGS-0121-2024"}', CURRENT_TIMESTAMP - INTERVAL '12 hours');

-- Held
INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload, created_at) VALUES
('cccc3333-cccc-3333-cccc-333333333333', 'Transaction', '99999999-9999-9999-9999-999999999999', 'TransferHeld', '{"transactionId":"99999999-9999-9999-9999-999999999999","reference":"TXN-HELD1234","status":"HELD","amount":15000.00,"riskScore":85}', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
('f2000001-f200-0001-f200-000000000001', 'Transaction', 'd2000001-d200-0001-d200-000000000001', 'TransferHeld', '{"transactionId":"d2000001-d200-0001-d200-000000000001","reference":"TXN-HLD101","status":"HELD","amount":45000.00,"riskScore":92,"reasons":"Large transfer to frozen account; unusual pattern"}', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('f2000002-f200-0002-f200-000000000002', 'Transaction', 'd2000002-d200-0002-d200-000000000002', 'TransferHeld', '{"transactionId":"d2000002-d200-0002-d200-000000000002","reference":"TXN-HLD102","status":"HELD","amount":95000.00,"riskScore":88,"reasons":"Transfer to flagged account; velocity anomaly detected"}', CURRENT_TIMESTAMP - INTERVAL '90 minutes'),
('f2000003-f200-0003-f200-000000000003', 'Transaction', 'd2000003-d200-0003-d200-000000000003', 'TransferHeld', '{"transactionId":"d2000003-d200-0003-d200-000000000003","reference":"TXN-HLD103","status":"HELD","amount":9800.00,"riskScore":76,"reasons":"Rapid successive transfers; amount just below reporting threshold"}', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
('f2000004-f200-0004-f200-000000000004', 'Transaction', 'd2000004-d200-0004-d200-000000000004', 'TransferHeld', '{"transactionId":"d2000004-d200-0004-d200-000000000004","reference":"TXN-HLD104","status":"HELD","amount":1800.00,"riskScore":71,"reasons":"New account; transfer exceeds 80% of balance"}', CURRENT_TIMESTAMP - INTERVAL '20 minutes');

-- Rejected
INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload, created_at) VALUES
('f3000001-f300-0001-f300-000000000001', 'Transaction', 'd3000001-d300-0001-d300-000000000001', 'TransferRejected', '{"transactionId":"d3000001-d300-0001-d300-000000000001","reference":"TXN-REJ201","status":"REJECTED","amount":30000.00,"riskScore":99,"reasons":"Sender account frozen; suspected money laundering"}', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('f3000002-f300-0002-f300-000000000002', 'Transaction', 'd3000002-d300-0002-d300-000000000002', 'TransferRejected', '{"transactionId":"d3000002-d300-0002-d300-000000000002","reference":"TXN-REJ202","status":"REJECTED","amount":20000.00,"riskScore":82,"reasons":"Admin rejected: beneficiary under investigation"}', CURRENT_TIMESTAMP - INTERVAL '4 days'),
('f3000003-f300-0003-f300-000000000003', 'Transaction', 'd3000003-d300-0003-d300-000000000003', 'TransferRejected', '{"transactionId":"d3000003-d300-0003-d300-000000000003","reference":"TXN-REJ203","status":"REJECTED","amount":10000.00,"riskScore":60,"reasons":"Insufficient balance; new account high amount"}', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Approved (held → approved lifecycle)
INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload, created_at) VALUES
('f4000001-f400-0001-f400-000000000001', 'Transaction', 'd4000001-d400-0001-d400-000000000001', 'TransferHeld', '{"transactionId":"d4000001-d400-0001-d400-000000000001","reference":"TXN-APR301","status":"HELD","amount":18000.00,"riskScore":74}', CURRENT_TIMESTAMP - INTERVAL '8 days'),
('f4000002-f400-0002-f400-000000000002', 'Transaction', 'd4000001-d400-0001-d400-000000000001', 'TransferApproved', '{"transactionId":"d4000001-d400-0001-d400-000000000001","reference":"TXN-APR301","status":"APPROVED","amount":18000.00}', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('f4000003-f400-0003-f400-000000000003', 'Transaction', 'd4000002-d400-0002-d400-000000000002', 'TransferHeld', '{"transactionId":"d4000002-d400-0002-d400-000000000002","reference":"TXN-APR302","status":"HELD","amount":75000.00,"riskScore":70}', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('f4000004-f400-0004-f400-000000000004', 'Transaction', 'd4000002-d400-0002-d400-000000000002', 'TransferApproved', '{"transactionId":"d4000002-d400-0002-d400-000000000002","reference":"TXN-APR302","status":"APPROVED","amount":75000.00}', CURRENT_TIMESTAMP - INTERVAL '9 days');

-- Account-level events
INSERT INTO outbox_events (id, aggregate_type, aggregate_id, event_type, payload, created_at) VALUES
('f5000001-f500-0001-f500-000000000001', 'Account', 'a5001111-a500-1111-a500-111111111111', 'AccountFrozen', '{"accountId":"a5001111-a500-1111-a500-111111111111","accountNumber":"AGS-0099-2024","reason":"Suspected fraudulent activity"}', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('f5000002-f500-0002-f500-000000000002', 'Account', 'a7001111-a700-1111-a700-111111111111', 'AccountOpened', '{"accountId":"a7001111-a700-1111-a700-111111111111","accountNumber":"AGS-0200-2024","customerId":"customer-007"}', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('f5000003-f500-0003-f500-000000000003', 'Account', 'a6001111-a600-1111-a600-111111111111', 'AccountOpened', '{"accountId":"a6001111-a600-1111-a600-111111111111","accountNumber":"AGS-0120-2024","customerId":"customer-006"}', CURRENT_TIMESTAMP - INTERVAL '30 days');

-- ==================== SEED: CARDS ====================

INSERT INTO cards (id, customer_id, card_number, expiry, cvv, is_frozen, online_payments, international_payments, contactless) VALUES
('dddd1111-dddd-1111-dddd-111111111111', 'customer-001', '4111222233334444', '12/29', '842', FALSE, TRUE, FALSE, TRUE),
('dddd2222-dddd-2222-dddd-222222222222', 'customer-002', '5555666677778888', '11/28', '123', FALSE, TRUE, TRUE, TRUE),
('dddd3333-dddd-3333-dddd-333333333333', 'customer-003', '4222333344445555', '03/30', '567', FALSE, TRUE, TRUE, TRUE),
('dddd4444-dddd-4444-dddd-444444444444', 'customer-004', '4333444455556666', '09/28', '234', FALSE, TRUE, FALSE, TRUE),
('dddd5555-dddd-5555-dddd-555555555555', 'customer-005', '4444555566667777', '06/27', '891', TRUE, FALSE, FALSE, FALSE),
('dddd6666-dddd-6666-dddd-666666666666', 'customer-006', '4555666677778888', '01/31', '456', FALSE, TRUE, TRUE, TRUE),
('dddd7777-dddd-7777-dddd-777777777777', 'customer-007', '4666777788889999', '08/30', '789', FALSE, TRUE, FALSE, TRUE);
