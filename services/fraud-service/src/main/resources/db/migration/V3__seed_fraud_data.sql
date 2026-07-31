-- Mock data for SOC Dashboard Alerts
INSERT INTO fraud_results (id, transaction_reference, sender_account_number, receiver_account_number, amount, risk_score, reasons) VALUES
('d1111111-d111-d111-d111-d11111111111', 'TXN-FRD-001', 'AGS-0001-2024', 'UNKNOWN-999', 45000.00, 92, 'High Velocity, Unusual Location, Device mismatch'),
('d2222222-d222-d222-d222-d22222222222', 'TXN-FRD-002', 'AGS-0077-2024', 'AGS-0055-2024', 1200.00, 55, 'Login from new device'),
('d3333333-d333-d333-d333-d33333333333', 'TXN-FRD-003', 'AGS-0045-2024', 'AGS-0001-2024', 8500.00, 88, 'Suspicious transfer volume'),
('d4444444-d444-d444-d444-d44444444444', 'TXN-FRD-004', 'AGS-0099-2024', 'AGS-0077-2024', 300.00, 15, 'Normal behavior');
