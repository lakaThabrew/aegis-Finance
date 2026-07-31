# Aegis Finance — User and Operations Guide

This guide is the submission-ready operating guide for the Aegis Finance prototype. It covers the customer web portal, admin portal, Flutter mobile app, service startup, logs, and the Prometheus/Grafana monitoring stack.

> **Development environment notice:** The URLs, credentials, Vault token, and Docker passwords in this document are for the local demonstration environment only. They must be replaced before any production deployment.

## 1. System access

| Component | Local URL / command | Purpose |
| --- | --- | --- |
| Customer web portal | `http://localhost:5173` | Customer banking experience |
| Admin web portal | `http://localhost:5174` | Operations, fraud review, and audit functions |
| Keycloak | `http://localhost:8080` | Authentication and identity administration |
| API gateway | `http://localhost:8084` | Front door for backend API requests |
| Prometheus | `http://localhost:9090` | Metrics collection and target health |
| Grafana | `http://localhost:3000` | Dashboards and operational monitoring |
| Fraud ML engine | `http://localhost:8000` | Fraud-model evaluation service |

### Demo customer credentials

Use the following seeded account for the customer portal and mobile app:

| Field | Value |
| --- | --- |
| Email | `you@aegis.finance` |
| Password | `password123` |

Use an account with the required administrator role to access the admin portal. The Keycloak administration console is available at `http://localhost:8080`; its local-development administrator credentials are configured in `infrastructure/docker/docker-compose.yml`.

## 2. Prerequisites

- Windows with Docker Desktop running.
- Java and Maven-compatible JDK for the Spring Boot services.
- Node.js and npm for the two React portals.
- Flutter SDK and an emulator, device, or desktop target for the mobile application.
- A Gemini API key when using the AI assistant. It is configured in `apps/aegis_mobile/.env` and `apps/customer-web/.env` as `GEMINI_API_KEY`; the customer web portal uses `GEMINI_API_KEY` in its `.env` file.

Never commit either `.env` file or an API key to source control.

## 3. Starting the local demonstration environment

### 3.1 Start Docker infrastructure

From the project root:

```powershell
cd infrastructure/docker
docker compose up -d --build
```

This starts Keycloak, PostgreSQL, Redis, Vault, Kafka, the Fraud ML Engine, Prometheus, and Grafana.

### 3.2 Load the local Vault database secret

Run this after Vault is ready:

```powershell
docker exec -e VAULT_TOKEN=root -e VAULT_ADDR=http://127.0.0.1:8200 aegis-vault vault kv put secret/application db.password=password
```

### 3.3 Start the five Spring Boot services

From the project root, run:

```powershell
.\start-backend.bat
```

The script opens one console window for each service:

| Service | Local port |
| --- | --- |
| Core Banking | `8081` |
| Fraud Service | `8082` |
| Notification Service | `8083` |
| API Gateway | `8084` |
| Identity Service | `8085` |

Wait until each console reports that the Spring application has started. A quick health check is available at `http://localhost:<port>/actuator/health`.

### 3.4 Start the web portals

From the project root:

```powershell
.\start-frontend.bat
```

Open the customer portal at `http://localhost:5173` and the admin portal at `http://localhost:5174`.

### 3.5 Start the Flutter mobile app

Confirm `apps/aegis_mobile/.env` contains the API URLs appropriate for the emulator or physical device and a valid Gemini key. Then run:

```powershell
cd apps/aegis_mobile
flutter pub get
flutter run
```

For an Android emulator, `localhost` generally needs to be replaced with `10.0.2.2` in the mobile app configuration so the emulator can reach services running on the host computer.

## 4. Customer web portal

After sign-in, use the left navigation to access the following functions.

| Area | What the customer can do |
| --- | --- |
| Dashboard | View account summary, balances, and recent activity. |
| Accounts | Review the accounts associated with the signed-in customer. |
| Transactions | Browse transaction history and transaction status. |
| Transfer | Select a source account, a saved beneficiary, enter an amount, and submit a transfer. |
| Beneficiaries | Add or remove approved transfer recipients before initiating a transfer. |
| Notifications | Review customer notifications and mark them as read. |
| Security | Review security events and manage trusted-device information. |
| Settings | Update profile details. |

### Making a transfer

1. Open **Beneficiaries** and add the recipient if they are not already listed.
2. Open **Transfer**.
3. Select the source account, beneficiary, and amount.
4. Review the information and submit the transfer.
5. Check **Transactions** and **Notifications** for the result.

Transfers are evaluated by the fraud workflow. A high-risk transfer can be placed in a held state instead of being completed immediately. A staff member must review a held transfer in the admin portal.

### Using Aegis AI

Open the floating AI button in the customer portal and ask short questions such as “What is my total balance?” or “Summarise my recent spending.” The assistant receives the financial context made available by the UI and returns a conversational insight.

The assistant uses a Gemini fallback order: `gemini-3.6-flash`, `gemini-3.1-pro`, `gemini-2.5-pro`, then `gemini-1.5-pro`. If a model fails, the next model is tried.

**Important:** Aegis AI provides insights only. It does not submit, approve, or execute financial transactions. Transfers must be submitted through the transfer flow and remain subject to fraud checks.

## 5. Flutter mobile application

### 5.1 Sign in and registration

1. Open the app and enter the demo email and password.
2. Select **Login** to load the dashboard.
3. New users can select **Create account** to complete the prototype registration/KYC submission flow.

### 5.2 Dashboard and financial insights

The mobile home screen shows total balance, active account information, recent transactions, and quick actions. Use the bottom navigation to move between **Home**, **Analytics**, **Offline**, and **Security**.

- **Analytics** displays spending breakdowns and savings-progress visualisations.
- **AI Assistant** provides contextual financial insights using the same Gemini fallback strategy as the web assistant.
- **Fraud Alert** explains when an unusual payment has been paused and lets the customer indicate whether the activity was expected or should be reported.

### 5.3 Transfer, QR, and offline-payment screens

- **Send money:** Choose an active source account, a saved beneficiary, and a valid amount. Beneficiaries are managed through the web portal before mobile transfers.
- **QR payment:** Open the QR payment screen and follow the on-screen merchant-payment flow.
- **Offline emergency pay:** Displays a time-limited QR-token demonstration with a maximum single-payment limit of AED 100.

### 5.4 Card and security controls

The **Card Management** screen displays available cards and provides controls for freezing a card and enabling or disabling online, international, and contactless payments. The **Security Center** shows trusted devices and recent login activity; use **Revoke** to remove a device where available.

## 6. Admin portal

The admin portal is restricted to an authorized administrator. Its navigation provides these operational functions:

| Area | Use |
| --- | --- |
| Overview | Review high-level system, customer, and transaction information. |
| Customer Management | View, create, edit, or remove customer records. |
| Held Transfers | Review fraud-held transfers and approve or reject them. |
| SOC Dashboard | Review security-focused operational information. |
| Audit Log | Review the recorded administrative audit trail. |

### Reviewing a held transfer

1. Sign in to the admin portal and select **Held Transfers**.
2. Open the item and review its customer, value, risk, and transaction context.
3. Select **Approve** only when the transfer is legitimate; select **Reject** if it is suspicious or cannot be verified.
4. Confirm the final state in the held-transfer list and audit log.

## 7. Monitoring with Prometheus and Grafana

### 7.1 Prometheus

Prometheus collects the Spring Boot Actuator metrics endpoint (`/actuator/prometheus`) every 15 seconds. The local Docker configuration reaches backend services through `host.docker.internal`, because those services are launched on the Windows host by `start-backend.bat`.

1. Open `http://localhost:9090/targets`.
2. Under **aegis-microservices**, confirm each service is marked **UP**.
3. If a target is **DOWN**, first confirm the corresponding local Spring Boot service is running and then open `http://localhost:<port>/actuator/health`.

### 7.2 Grafana access

1. Open `http://localhost:3000`.
2. Sign in with username `admin` and password `admin` in the local environment.
3. Open **Dashboards** and select an Aegis dashboard.

Grafana is provisioned automatically with Prometheus as its default data source. It scans the dashboard directory every 10 seconds, so new dashboard files normally appear without a restart. If they do not appear, restart Grafana only:

```powershell
cd infrastructure/docker
docker compose restart grafana
```

There is no need to restart every container merely to load a Grafana dashboard.

### 7.3 Available dashboards

| Dashboard | Use |
| --- | --- |
| Aegis Microservices Dashboard | Baseline JVM memory chart. |
| Aegis Service Overview | Available/unavailable services, scrape status, request throughput, 5xx rate, and p95 latency. |
| Aegis API Performance | Request rate, p50/p95 latency, client/server errors, and 5xx responses by endpoint. |
| Aegis JVM Runtime | Heap usage, CPU, live threads, and garbage-collection activity. |
| Aegis Database Connection Pools | Hikari active/idle/pending connections, pool limits, timeouts, and acquire time. |
| Aegis Endpoint Insights | Most-used and slowest endpoints, status distribution, and 5xx percentage. |
| Aegis Process Health | Process uptime, file descriptors, JVM class counts, and resident memory. |

Database pool panels will only show a series for services that use a Hikari-managed database connection pool. A blank panel means the matching metric has not been emitted yet; it is not automatically an application error.

### 7.4 Refreshing monitoring configuration

Restart Prometheus after editing `infrastructure/docker/prometheus/prometheus.yml`:

```powershell
cd infrastructure/docker
docker compose restart prometheus
```

Restart Grafana after editing provisioning settings or if a dashboard has not appeared after the 10-second refresh interval:

```powershell
docker compose restart grafana
```

## 8. Logs and diagnostics

### 8.1 Backend service logs

The five Spring Boot services run in the console windows launched by `start-backend.bat`. Those windows are the primary live log source in this local setup. The services log application events at `DEBUG` level for the `com.aegis` package and Spring Web events at `INFO` level.

To start one service manually and retain its live output:

```powershell
cd services/core-banking
.\mvnw spring-boot:run
```

Repeat with the relevant service directory when diagnosing a specific component. Do not paste tokens, passwords, or personally identifiable customer data into submission screenshots or support messages.

### 8.2 Docker container logs

Use Docker Compose logs for infrastructure and the containerized Fraud ML Engine:

```powershell
cd infrastructure/docker
docker compose logs -f grafana
docker compose logs -f prometheus
docker compose logs -f fraud-ml-engine
docker compose logs --tail 200 keycloak
```

Press `Ctrl+C` to stop following a log stream. Use `docker compose ps` to view container state before investigating a failure.

### 8.3 Health and metrics diagnostics

| Check | Expected result |
| --- | --- |
| `http://localhost:8081/actuator/health` | Core Banking reports `UP` when dependencies are healthy. |
| `http://localhost:8084/actuator/prometheus` | API Gateway emits Prometheus-formatted metrics. |
| `http://localhost:9090/targets` | Aegis service targets are `UP`. |
| `http://localhost:3000` | Grafana loads with the provisioned Aegis dashboards. |

## 9. Troubleshooting

| Symptom | Check and resolution |
| --- | --- |
| Web portal cannot sign in | Confirm Keycloak is running, then check that the customer/admin portal and API gateway are started. |
| A transfer fails | Confirm the customer has an active source account and saved beneficiary; review the transaction list, notification list, and Core Banking/Fraud Service logs. |
| Transfer remains pending | Open **Held Transfers** in the admin portal; it may require an authorized approval or rejection. |
| Grafana dashboard is blank | Check Prometheus targets at `:9090/targets`, make sure the local Spring Boot services are running, then restart Prometheus if its configuration was changed. |
| Dashboard does not appear | Wait 10 seconds; if it is still absent, run `docker compose restart grafana` from `infrastructure/docker`. |
| AI assistant displays an API-key error | Set the relevant `GEMINI_API_KEY` or `VITE_GEMINI_API_KEY`, restart the affected app, and verify that the key has Gemini access. |
| Mobile app cannot reach local APIs | Use the host address appropriate for the device/emulator; Android emulators typically use `10.0.2.2` instead of `localhost`. |
| Database/Vault startup error | Confirm Docker is running, execute the Vault secret command in section 3.2, and inspect `docker compose logs -f vault`. |

## 10. Demonstration and submission checklist

Before recording a demonstration or submitting the project:

- Confirm all containers are running with `docker compose ps`.
- Confirm each Prometheus target is **UP**.
- Open Grafana and show at least the **Service Overview**, **API Performance**, and **Database Connection Pools** dashboards.
- Demonstrate customer login, beneficiary management, a transfer attempt, and the transaction/notification result.
- Demonstrate admin review of a held transfer and the audit log.
- Demonstrate the Flutter dashboard, security controls, and AI assistant.
- Capture logs that show normal startup and, if required, an example fraud/held-transfer workflow. Redact secrets and personal information from all submitted evidence.

## 11. Local-environment security limitations

This prototype includes Keycloak authentication, JWT-protected services, Vault integration, card controls, fraud evaluation, Actuator metrics, and audit capabilities. It is not a production deployment. In particular, change default development credentials, remove development tokens from configuration, store Gemini/API credentials securely, restrict Actuator endpoints, enable TLS, and configure centralized log retention and alerting before production use.

## 12. Future Deployment Plan & Production Architecture

While this prototype environment operates smoothly using Docker and Docker-Compose for an optimal local demonstration, our production-grade deployment strategy targets a more resilient, cloud-native architecture. 

As outlined in our Phase 01 RECON design, the transition to production will involve:
- **Kubernetes (K8s):** Orchestrating the microservices to provide robust auto-scaling, load balancing, and self-healing across multiple nodes.
- **Istio Service Mesh:** Implementing strict Zero-Trust security with mutual TLS (mTLS) for all service-to-service communication.
- **Multi-Region Disaster Recovery:** Ensuring high availability and uninterrupted service continuity under extreme network or infrastructure conditions.
