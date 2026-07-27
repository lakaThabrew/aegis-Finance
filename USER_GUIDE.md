# 📖 Aegis Finance — User Guide

Welcome to **Aegis Finance**, a secure digital banking platform built for the Duothon 6.0 competition.

## 🔑 Login Instructions

Aegis comes with a dual-portal system. Since Keycloak is set up for local development, you can use the built-in demo authentication loop to bypass it without credentials.

1. **Customer Portal**: Navigate to `http://localhost:5173`
2. **Admin Portal**: Navigate to `http://localhost:5174`
3. Click **Sign In** on the login screen. You will be automatically authenticated with a demo JWT token.

---

## 🧑‍💻 Using the Customer Portal

### 1. Dashboard
- View your total portfolio balance and active accounts.
- Click the **copy icon** next to an account number to copy it to your clipboard.

### 2. Making a Transfer
1. Go to the **Beneficiaries** page.
2. Select a beneficiary from the list or click "Add New" (mock UI for adding).
3. Click "Send Money" on a beneficiary card.
4. Enter the amount to transfer.
5. Click **Preview Transfer** to review details.
6. Click **Confirm & Send**.

*Note: If the transfer amount triggers a fraud rule (e.g. amount > $10,000), it will be flagged as `HELD` and await Admin approval.*

### 3. Viewing Transactions (Ledger)
- Go to the **Transactions** page.
- You will see a Double-Entry Ledger view of all IN and OUT transactions.
- You can filter by status (Completed, Held, Rejected).
- Click **Download Statement** to export a CSV.

### 4. Security Center
- Freeze or unfreeze your account instantly.
- View real-time security alerts (e.g., unrecognized logins).

---

## 🛡️ Using the Admin (Fraud Analyst) Portal

### 1. Overview
- Real-time dashboard of platform metrics (Total volume, held transfers, etc.).
- Risk score distribution graph.

### 2. Held Transfers (Fraud Review)
- When a customer makes a high-value transfer, it will appear here.
- The sender's balance is **NOT** deducted until you approve it (Double-entry principle).
- Click the **eye icon** to view the exact Risk Score and Fraud Reasons.
- Click **Approve** (commits the ledger entry) or **Reject** (cancels it).

### 3. Audit Log
- Search through every system event.
- Filter by Severity (Info, Warning, Critical) to find anomalies.

---

## 🛠️ Developer Notes

- **Swagger/OpenAPI UI**: Available at `http://localhost:8081/swagger-ui.html` (Core Banking) and `http://localhost:8082/swagger-ui.html` (Fraud Service).
- **Actuator Health**: `http://localhost:8081/actuator/health`
- **Database**: Connect to PostgreSQL locally on port `5432` with username `postgres`, password `postgres`.
- **Kafka**: Running on `localhost:9092`. The `transaction-events` topic receives outbox polling events.
