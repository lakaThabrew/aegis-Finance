ALTER TABLE cards ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id);

UPDATE cards AS card
SET account_id = (
    SELECT account.id
    FROM accounts AS account
    WHERE account.customer_id = card.customer_id
    ORDER BY account.account_number
    LIMIT 1
)
WHERE card.account_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_cards_account_id ON cards(account_id);
