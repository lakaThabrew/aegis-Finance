UPDATE fraud_results
SET transaction_reference = 'TXN-HLD103',
    sender_account_number = 'AGS-0001-2024',
    receiver_account_number = 'AGS-0200-2024',
    amount = 9800.00,
    reasons = 'Rapid successive transfers; device mismatch'
WHERE id = 'd1111111-d111-d111-d111-d11111111111';

UPDATE fraud_results
SET transaction_reference = 'TXN-HLD101',
    sender_account_number = 'AGS-0003-2024',
    receiver_account_number = 'AGS-0099-2024',
    amount = 45000.00,
    reasons = 'Large transfer to flagged account; unusual volume'
WHERE id = 'd3333333-d333-d333-d333-d33333333333';
