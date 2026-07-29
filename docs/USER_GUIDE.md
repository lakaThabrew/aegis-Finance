# 📖 Aegis Finance — User Guide

Welcome to **Aegis Finance**, a secure digital banking platform built for the Duothon 6.0 competition.

## 🔑 Login Instructions

Aegis uses **Keycloak** for secure Identity and Access Management (IAM). 

1. **Customer Portal**: Navigate to `http://localhost:5173`
2. **Admin Portal**: Navigate to `http://localhost:5174`
3. Click **Sign In** on the login screen. You will be redirected to the Keycloak login page.
4. Use the following default credentials to log in:
   - **Email/Username**: `you@aegis.finance`
   - **Password**: `password123`

---

## 🧑‍💻 Using the Customer Portal

### 1. Dashboard & Accounts
- View your total portfolio balance and active accounts.
- The **Accounts** page shows detailed individual card balances and available credit limits.
- Click the **copy icon** next to an account number to copy it to your clipboard.

### 2. Making a Transfer
1. Go to the **Beneficiaries** page.
2. Select a beneficiary from the list or click "Add New" (mock UI for adding).
3. Click "Send Money" on a beneficiary card.
4. Enter the amount to transfer.
5. Click **Preview Transfer** to review details.
6. Click **Confirm & Send**.

*Note: If the transfer amount triggers a fraud rule (e.g. amount > $10,000), it will be flagged as `HELD` and await Admin approval.*

### 3. Viewing Transactions & Notifications
- Go to the **Transactions** page. You will see a Double-Entry Ledger view of all IN and OUT transactions. You can filter by status (Completed, Held, Rejected).
- Go to the **Notifications** page to see real-time alerts for security events, transaction completions, and system messages in a premium timeline interface.

### 4. Security Center
- Freeze or unfreeze your account instantly.
- View real-time security alerts (e.g., unrecognized logins).

---

## 🛡️ Using the Admin (Fraud Analyst) Portal

### 1. Overview & SOC Dashboard
- **Overview**: Real-time dashboard of platform metrics (Total volume, held transfers, etc.) and risk score distribution.
- **SOC Dashboard**: Security Operations Center interface to monitor live threat activity, investigate medium/high-risk alerts, and block suspected fraudulent accounts.

### 2. Customer Management
- Navigate to the **Customers** page.
- Review all customer profiles across the bank.
- Monitor e-KYC Verification statuses (VERIFIED, PENDING, REJECTED) served by the Identity Service.
- Track risk scores per individual customer profile.

### 3. Held Transfers (Fraud Review)
- When a customer makes a high-value transfer, it will appear here.
- The sender's balance is **NOT** deducted until you approve it (Double-entry principle).
- Click the **eye icon** to view the exact Risk Score and Fraud Reasons.
- Click **Approve** (commits the ledger entry) or **Reject** (cancels it).

### 4. Audit Log
- Search through every system event.
- Filter by Severity (Info, Warning, Critical) to find anomalies.

---

## 🛠️ Developer Notes

- **Swagger/OpenAPI UI**: Available at `http://localhost:8081/swagger-ui.html` (Core Banking), `http://localhost:8082/swagger-ui.html` (Fraud Service), and `http://localhost:8000/docs` (Python ML Engine).
- **Actuator Health & Metrics**: `http://localhost:8081/actuator/health` and `/actuator/prometheus` (for all backend services).
- **Database**: Connect to PostgreSQL locally on port `5432` with username `postgres`, password `password`.
- **Kafka**: Running on `localhost:9092`. The `transaction-events` topic receives outbox polling events.
- **Monitoring (Grafana)**: Running on `http://localhost:3000` (User/Pass: `admin/admin`). Displays JVM memory usage, API traffic, and system vitals from Prometheus (which runs on `http://localhost:9090`).
- **Machine Learning**: The ML Engine uses Transfer Learning. To retrain the base model, place the Kaggle PaySim dataset in `services/fraud-ml-engine/data/paysim.csv` and run `train_base_model.py` followed by `fine_tune_model.py`.
