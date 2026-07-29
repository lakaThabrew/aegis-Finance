# 🧪 Aegis Finance — Testing Documentation

This document outlines the testing strategy, coverage, and instructions for running automated and manual tests in the Aegis Finance platform. This is a critical component of **Sprint 5: Quality Assurance & Testing**.

---

## 1. Automated Backend Tests

The backend microservices are built with Spring Boot and tested using **JUnit 5** and **Mockito**. We employ two primary layers of automated testing:

### A. Unit Testing (Core Logic)
Unit tests isolate the business logic from the infrastructure (Database, Kafka, etc.).

- **Target Location**: `services/core-banking/src/test/java/.../TransactionServiceTest.java`
- **Coverage**:
  - `shouldProcessTransferSuccessfully`: Validates that a transfer under the risk threshold correctly deducts sender balance, increases receiver balance, and generates a `TransactionPosted` outbox event.
  - `shouldHoldTransferIfHighRisk`: Validates that a transfer exceeding the $10,000 threshold results in a `HELD` status, does *not* modify account balances, and generates a `TransferHeld` outbox event.
  - `shouldThrowExceptionIfInsufficientFunds`: Ensures that a runtime exception is thrown before any database commits if the sender lacks sufficient balance.

### B. API / Integration Testing (HTTP Layer)
Integration tests load the Spring Context and use an **in-memory H2 database** to simulate real HTTP requests and database interactions without affecting the production PostgreSQL database.

- **Target Location**: `services/core-banking/src/test/java/.../CoreBankingIntegrationTest.java`
- **Coverage**:
  - `testTransferEndpoint_Success`: Sends a JSON `POST` request to `/api/v1/core/transfer`. Validates the HTTP 200 response and confirms the JSON body returns `"status": "COMPLETED"`.
  - `testTransferEndpoint_Held`: Sends a JSON payload triggering the fraud rules. Validates the JSON body returns `"status": "HELD"`.

### 🏃 How to Run Backend Tests

To execute the test suite via Maven, run the following commands:

```bash
cd services/core-banking
./mvnw clean test
```

*Note: The test phase uses a dedicated `application-test.properties` file which spins up an H2 database automatically.*

---

## 2. End-to-End (E2E) Workflow Validation

Manual E2E testing ensures the UI, API Gateway, Microservices, and Databases communicate correctly.

### Workflow 1: Standard Transfer (Happy Path)
1. Log into the **Customer Portal** (`http://localhost:5173`).
2. Verify the initial balance on the Dashboard.
3. Navigate to **Beneficiaries** and execute a transfer for `$100.00`.
4. Navigate to **Transactions** (Ledger) and verify a new `DEBIT` entry appears with the correct `balanceBefore` and `balanceAfter`.
5. Check the `OutboxPollingService` terminal logs to ensure the event was picked up and pushed to Kafka.

### Workflow 2: Fraud Detection & Admin Resolution
1. Log into the **Customer Portal** and execute a high-value transfer for `$15,000.00`.
2. Confirm the transaction appears in the Ledger as `HELD`. Check that the Dashboard balance has **not** decreased.
3. Log into the **Admin Portal** (`http://localhost:5174`).
4. Navigate to **Held Transfers**. The $15k transfer should be in the pending queue.
5. Click **Approve**.
6. Return to the Customer Portal. The transaction should now be `COMPLETED` and the balance deducted.

### Workflow 3: Identity & SOC Review
1. Log into the **Customer Portal** and trigger high-risk actions.
2. Log into the **Admin Portal** (`http://localhost:5174`).
3. Navigate to **Customer Management** to view KYC statuses (served by `identity-service`).
4. Navigate to **SOC Dashboard** to view live aggregated fraud alerts (served by `fraud-service`).

### Workflow 4: Observability & Monitoring
1. Open Prometheus at `http://localhost:9090` and verify targets under **Status > Targets** are `UP`.
2. Open Grafana at `http://localhost:3000` (admin/admin), navigate to the `Aegis Dashboards` folder, and verify JVM Memory charts are populating.

---

## 3. Security Testing Checklist

Security is paramount in Aegis. The following areas must be validated before production deployment:

- [ ] **JWT Authorization**: Attempt to access `/api/v1/core/transfer` without a Bearer token via Postman. Expect a `401 Unauthorized` response.
- [ ] **Role-Based Access Control (RBAC)**: Attempt to access Admin Portal APIs using a standard customer JWT token. Expect a `403 Forbidden` response.
- [ ] **Idempotency Checks**: Send the exact same transfer request twice using the same `idempotencyKey`. The second request should fail, preventing accidental double-billing.
- [ ] **Pessimistic Locking**: Simulate concurrent transfer requests from the same account using a tool like Apache JMeter. Confirm no deadlocks occur and balances do not drop below zero.

---

## 4. Troubleshooting Tests

- **Maven Permission Denied**: If running `./mvnw test` fails with a permission error (common in CI/CD), execute `chmod +x mvnw` first.
- **Port Conflicts**: If the Integration tests fail to start the Spring context, ensure ports are not currently in use by a running instance of the application.
