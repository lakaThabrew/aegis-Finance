CREATE TABLE customers (
    id UUID PRIMARY KEY,
    customer_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    verification_status VARCHAR(20) NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customers (id, customer_id, full_name, email, verification_status, risk_score) VALUES
    ('c1000001-c100-0001-c100-000000000001', 'customer-001', 'Customer User', 'you@aegis.finance', 'VERIFIED', 10),
    ('c1000002-c100-0002-c100-000000000002', 'customer-002', 'Sunil Silva', 'sunil.silva@aegis.finance', 'PENDING', 50),
    ('c1000003-c100-0003-c100-000000000003', 'customer-003', 'Nimal Perera', 'nimal.perera@aegis.finance', 'VERIFIED', 15),
    ('c1000004-c100-0004-c100-000000000004', 'customer-004', 'Saman Kumara', 'saman.kumara@aegis.finance', 'PENDING', 35),
    ('c1000005-c100-0005-c100-000000000005', 'customer-005', 'Kamal Fernando', 'kamal.fernando@aegis.finance', 'REJECTED', 95),
    ('c1000006-c100-0006-c100-000000000006', 'customer-006', 'Aegis Corporate', 'corporate@aegis.finance', 'VERIFIED', 20),
    ('c1000007-c100-0007-c100-000000000007', 'customer-007', 'Ruwan Rajapaksha', 'ruwan.rajapaksha@aegis.finance', 'PENDING', 45),
    ('c1000045-c100-0045-c100-000000000045', 'customer-045', 'Tharindu Jayasuriya', 'tharindu.jayasuriya@aegis.finance', 'REJECTED', 90);
