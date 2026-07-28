CREATE TABLE IF NOT EXISTS fraud_results (
    id UUID PRIMARY KEY,
    transaction_reference VARCHAR(50),
    sender_account_number VARCHAR(20) NOT NULL,
    receiver_account_number VARCHAR(20) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    risk_score INTEGER NOT NULL,
    reasons TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
