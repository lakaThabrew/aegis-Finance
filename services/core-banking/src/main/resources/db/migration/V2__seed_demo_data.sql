-- Demo Accounts
INSERT INTO accounts (id, account_number, type, balance, currency, status, user_id) VALUES
('11111111-1111-1111-1111-111111111111', 'AGS-0001-2024', 'CHECKING', 125000.00, 'USD', 'ACTIVE', 'customer-001'),
('22222222-2222-2222-2222-222222222222', 'AGS-0002-2024', 'SAVINGS', 45000.00, 'USD', 'ACTIVE', 'customer-001'),
('33333333-3333-3333-3333-333333333333', 'AGS-0077-2024', 'CHECKING', 1500.00, 'USD', 'ACTIVE', 'customer-002'),
('44444444-4444-4444-4444-444444444444', 'AGS-0045-2024', 'CHECKING', 8900.00, 'USD', 'FROZEN', 'customer-045');

-- Demo Beneficiaries
INSERT INTO beneficiaries (id, user_id, beneficiary_account_number, beneficiary_name, alias) VALUES
('55555555-5555-5555-5555-555555555555', 'customer-001', 'AGS-0077-2024', 'Alice Smith', 'Alice (Rent)'),
('66666666-6666-6666-6666-666666666666', 'customer-001', 'AGS-0045-2024', 'Bob Johnson', 'Bob (Freelance)');
