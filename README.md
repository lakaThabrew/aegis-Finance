# 🛡️ Aegis Finance — Secure Digital Banking Platform

> A full-stack, microservice-based digital banking system built for the **Duothon 6.0** competition.  
> Aegis provides P2P transfers with double-entry ledger accounting, real-time fraud detection, and a dedicated admin portal for fraud analysts.

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Implemented Features](#-implemented-features)
- [Getting Started](#-getting-started)
- [Sprint Progress](#-sprint-progress)
- [Deferred Features](#-deferred-features)

---

## 🏗️ Architecture

Aegis follows a **microservice architecture** organized as a monorepo:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  ┌───────────────────┐    ┌───────────────────────┐     │
│  │  Customer Portal  │    │  Admin/Fraud Portal   │     │
│  │  (React + Vite)   │    │  (React + Vite)       │     │
│  │  Port: 5173       │    │  Port: 5174           │     │
│  └────────┬──────────┘    └───────────┬───────────┘     │
└───────────┼───────────────────────────┼─────────────────┘
            │                           │
┌───────────┼───────────────────────────┼─────────────────┐
│  ┌────────▼───────────────────────────▼──────────────┐  │
│  │           Spring Cloud API Gateway                │  │
│  │                  Port: 8080                       │  │
│  └──────────┬────────────────────────┬───────────────┘  │
│             │    Service Layer       │                   │
│  ┌──────────▼──────────┐  ┌──────────▼──────────┐       │
│  │  Core Banking       │  │  Fraud Service      │       │
│  │  Port: 8081         │  │  Port: 8082         │       │
│  │  • Accounts         │  │  • Risk Scoring     │       │
│  │  • Transactions     │  │  • Hold Boundary    │       │
│  │  • Double-Entry     │  │  • Fraud Results    │       │
│  │  • Outbox Events    │  │                     │       │
│  └──────────┬──────────┘  └─────────────────────┘       │
└─────────────┼───────────────────────────────────────────┘
              │
┌─────────────┼───────────────────────────────────────────┐
│             │    Infrastructure Layer                    │
│  ┌──────────▼──┐  ┌────────┐  ┌───────┐  ┌──────────┐  │
│  │ PostgreSQL  │  │ Kafka  │  │ Redis │  │ Keycloak │  │
│  │   (Neon)    │  │        │  │       │  │  (IAM)   │  │
│  └─────────────┘  └────────┘  └───────┘  └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17, Spring Boot 3, Spring Cloud Gateway |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS |
| **Database** | PostgreSQL (Neon), Flyway Migrations |
| **Messaging** | Apache Kafka (Transactional Outbox Pattern) |
| **Caching** | Redis |
| **Auth / IAM** | Keycloak (OAuth2 + TOTP MFA) |
| **Icons** | Lucide React |
| **CI/CD** | GitHub Actions |
| **Containerization** | Docker Compose |

---

## 📁 Project Structure

```
aegis/
├── apps/
│   ├── customer-web/          # Customer-facing React portal
│   │   ├── src/
│   │   │   ├── components/    # Sidebar, AppLayout
│   │   │   ├── pages/         # Dashboard, Transactions, Beneficiaries, Security
│   │   │   ├── context/       # AuthContext (JWT management)
│   │   │   ├── api/           # Axios client with token interceptor
│   │   │   └── types/         # Shared TypeScript interfaces
│   │   └── ...
│   └── admin-web/             # Admin/Fraud Analyst React portal
│       ├── src/
│       │   ├── components/    # AdminSidebar, AdminLayout
│       │   ├── pages/         # Overview, HeldTransfers, AuditLog
│       │   └── types/         # Admin-specific TypeScript interfaces
│       └── ...
├── services/
│   ├── api-gateway/           # Spring Cloud API Gateway
│   ├── core-banking/          # Core Banking Microservice
│   │   ├── entity/            # Account, Transaction, LedgerEntry, OutboxEvent
│   │   ├── repository/        # JPA Repositories (with pessimistic locking)
│   │   ├── service/           # TransactionService (double-entry ledger)
│   │   ├── dto/               # TransferRequest
│   │   └── db/migration/      # V1__init_schema.sql
│   └── fraud-service/         # Fraud Detection Microservice
│       ├── entity/            # FraudResult
│       ├── repository/        # FraudResultRepository
│       ├── service/           # FraudService (risk scoring engine)
│       ├── controller/        # REST API (/api/v1/fraud/evaluate)
│       ├── dto/               # FraudEvaluationRequest/Response
│       └── db/migration/      # V1__init_fraud_schema.sql
├── infrastructure/
│   └── docker/
│       └── docker-compose.yml # Kafka, Redis, Keycloak, PostgreSQL
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline
└── docs/                      # Documentation directory
```

---

## ✅ Implemented Features

### 🏦 Core Banking Service
- **Double-Entry Ledger** — Every transfer creates a matching DEBIT and CREDIT entry with before/after balances
- **Pessimistic Locking** — Ordered account locking prevents deadlocks during concurrent transfers
- **Idempotency** — Duplicate transfer prevention via unique idempotency keys
- **Transactional Outbox** — Events (`TransactionPosted`, `TransferHeld`) saved atomically with ledger changes
- **Flyway Migrations** — Versioned schema for `accounts`, `transactions`, `ledger_entries`, `beneficiaries`, `outbox_events`

### 🛡️ Fraud Detection Service
- **Rules-Based Risk Scoring** — Evaluates transaction amount against configurable thresholds
- **Explicit Hold Boundary** — Transactions with `riskScore >= 70` are marked `HELD`; ledger balances remain unchanged until admin approval
- **Fraud Results Persistence** — All evaluations are stored for audit purposes
- **REST API** — `POST /api/v1/fraud/evaluate` for synchronous fraud checks

### 👤 Customer Portal (`customer-web`)
- **Login Page** — Glassmorphism design, Keycloak-ready JWT auth, show/hide password toggle
- **Dashboard** — Total portfolio balance hero card, individual account cards with copy-to-clipboard, recent activity feed
- **Transactions** — Full ledger table with search, status filters (ALL / COMPLETED / HELD / REJECTED), downloadable CSV statement, transaction receipt modal
- **Beneficiaries** — Grid of beneficiary cards, add/delete flows, multi-step transfer workflow with preview and confirmation modal
- **Security Center** — Account freeze/unfreeze toggle, trusted device management, colour-coded audit trail

### 🔴 Admin / Fraud Analyst Portal (`admin-web`)
- **Overview Dashboard** — Stats grid (total transactions, held count, volume, flagged rate), risk score distribution bar chart, recent alerts feed
- **Held Transfers** — Pending queue with Approve/Reject buttons, detailed inspection modal showing fraud reasons and risk score, resolved history table, ledger-unchanged reminder
- **Audit Log** — Searchable and filterable chronological event log with severity badges (info / warning / critical) and actor tracking

### 🔧 Infrastructure
- **Docker Compose** — Full local stack: PostgreSQL, Kafka (KRaft), Redis, Keycloak
- **GitHub Actions CI** — Automated build pipeline for all services and apps
- **Spring Cloud API Gateway** — Central routing for all backend microservices

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose

### 1. Start Infrastructure

```bash
cd infrastructure/docker
docker compose up -d
```

### 2. Run Backend Services

```bash
# Core Banking (port 8081)
cd services/core-banking
./mvnw spring-boot:run

# Fraud Service (port 8082)
cd services/fraud-service
./mvnw spring-boot:run

# API Gateway (port 8080)
cd services/api-gateway
./mvnw spring-boot:run
```

### 3. Run Frontend Apps

```bash
# Customer Portal (port 5173)
cd apps/customer-web
npm install && npm run dev

# Admin Portal (port 5174)
cd apps/admin-web
npm install && npm run dev
```

---

## 📊 Sprint Progress

| Sprint | Focus | Status |
|---|---|---|
| **Sprint 1** | Foundation — Git, Docker, CI, Keycloak, API Gateway | ✅ Complete |
| **Sprint 2** | Banking Core — Double-Entry Ledger, Customer Dashboard, Transactions UI | ✅ Complete |
| **Sprint 3** | Security & Fraud — Fraud Service, Security Center, Admin Portal | ✅ Complete |
| **Sprint 4** | Enterprise Evidence — Outbox polling, Notifications, Swagger, Demo Data | ⬜ In Progress |
| **Sprint 5** | QA & Testing — Unit tests, Integration tests, E2E, Security testing | ⬜ Pending |

### Remaining Work (Sprint 4 & 5)
- [ ] Outbox polling → Kafka publisher
- [ ] Notification Service (Kafka consumer)
- [ ] Swagger/OpenAPI documentation
- [ ] Spring Boot Actuator health/metrics endpoints
- [ ] Polished demo seed data
- [ ] `USER_GUIDE.md`
- [ ] Unit, Integration, and E2E tests
- [ ] Security testing
- [ ] Demo rehearsal workflow

---

## 🔮 Deferred Features (Architecture-Only)

The following were designed in Phase 1 but are **explicitly deferred** from this implementation to avoid scope creep:

| Feature | Reason |
|---|---|
| Flutter Mobile App | Out of scope for web-focused Phase 2 |
| Full e-KYC | Requires third-party integrations |
| QR Payments & Bill Pay | Planned for future phases |
| Cards & Loans Modules | Requires additional microservices |
| Kubernetes / Istio | Docker Compose sufficient for demo |
| HashiCorp Vault | Keycloak handles secrets for now |

---

## 👥 Team

Built for **Duothon 6.0** competition.

---

## 📄 License

This project is developed for the Duothon 6.0 competition and is not licensed for commercial use.
