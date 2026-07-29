# 🛡️ Aegis Finance — Secure Digital Banking Platform

> A full-stack, microservice-based digital banking system built for the **Duothon 6.0** competition.  
> Aegis provides P2P transfers with double-entry ledger accounting, real-time fraud detection, e-KYC identity management, and a dedicated admin portal for fraud analysts.

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
│  └──────────┬─────────────┬─────────────┬────────────┘  │
│             │Service Layer│             │               │
│  ┌──────────▼────┐  ┌─────▼─────────┐ ┌─▼─────────────┐ │
│  │ Core Banking  │  │ Fraud Service │ │Identity Service │
│  │ Port: 8081    │  │ Port: 8082    │ │ Port: 8085    │ │
│  │ • Accounts    │  │ • Risk Scoring│ │ • e-KYC Status│ │
│  │ • Ledger      │  │ • SOC Alerts  │ │ • Profiles    │ │
│  └──────────┬────┘  └─────┬─────────┘ └─┬─────────────┘ │
└─────────────┼─────────────┼─────────────┼───────────────┘
              │             │             │
┌─────────────┼─────────────┼─────────────┼───────────────┐
│             │    Infrastructure Layer   │               │
│  ┌──────────▼──┐  ┌────────┐  ┌───────┐ ┌──────────┐    │
│  │ PostgreSQL  │  │ Kafka  │  │ Redis │ │ Keycloak │    │
│  │             │  │        │  │       │ │  (IAM)   │    │
│  └─────────────┘  └────────┘  └───────┘ └──────────┘    │
│  ┌────────────────┐  ┌───────────────┐                  │
│  │ Prometheus     │  │ Grafana       │  (Monitoring)    │
│  └────────────────┘  └───────────────┘                  │
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
| **Monitoring** | Prometheus, Grafana, Micrometer, Spring Boot Actuator |
| **Icons** | Lucide React |
| **Containerization** | Docker Compose |

---

## 📁 Project Structure

```
aegis/
├── apps/
│   ├── customer-web/          # Customer-facing React portal
│   │   ├── src/pages/         # Dashboard, Transfers, Notifications, Accounts
│   └── admin-web/             # Admin/Fraud Analyst React portal
│       ├── src/pages/         # Overview, SOC Dashboard, Customer Management
├── services/
│   ├── api-gateway/           # Spring Cloud API Gateway
│   ├── core-banking/          # Core Banking Microservice
│   ├── fraud-service/         # Fraud Detection Microservice
│   ├── identity-service/      # Digital Identity and e-KYC Microservice
│   └── notification-service/  # Async Notification Service (Kafka Listener)
├── infrastructure/
│   └── docker/
│       ├── docker-compose.yml # Kafka, Redis, Keycloak, PostgreSQL, Prometheus, Grafana
│       ├── prometheus/        # Prometheus configuration
│       └── grafana/           # Grafana dashboards and provisioning
└── docs/                      # Documentation directory
```

---

## ✅ Implemented Features

### 🏦 Core Banking Service
- **Double-Entry Ledger** — Every transfer creates a matching DEBIT and CREDIT entry
- **Pessimistic Locking** — Ordered account locking prevents deadlocks
- **Idempotency** — Duplicate transfer prevention
- **Transactional Outbox** — Events saved atomically with ledger changes

### 🛡️ Fraud Detection Service
- **Rules-Based Risk Scoring** — Evaluates transaction amount against thresholds
- **Hold Boundary** — Transactions with `riskScore >= 70` are marked `HELD`
- **SOC API** — Exposes `/api/v1/fraud/alerts` for Security Operations Center dashboard

### 🆔 Identity Service (New)
- **e-KYC Verification** — Manages identity verification statuses (PENDING, VERIFIED, REJECTED)
- **Risk Profiles** — Individual customer risk scoring and KYC tracking

### 👤 Customer Portal (`customer-web`)
- **Dashboard & Accounts** — Full portfolio view, dynamic accounts overview
- **Transfers** — Multi-step secure transfer flow with ledger integration
- **Notifications** — Premium timeline UI for system, security, and transaction alerts
- **Security Center** — Account freeze/unfreeze toggle, trusted device management

### 🔴 Admin / Fraud Analyst Portal (`admin-web`)
- **SOC Dashboard** — Security Operations Center with live threat monitoring and risk distribution
- **Customer Management** — View user profiles, KYC statuses, and risk profiles
- **Held Transfers** — Queue with Approve/Reject flows and fraud reasoning inspection
- **Audit Log** — Chronological event log with severity badges

### 🔧 Infrastructure & Observability
- **Docker Compose** — Full stack: PostgreSQL, Kafka, Redis, Keycloak, Prometheus, Grafana
- **Monitoring Stack** — Prometheus scraping Spring Boot Actuators, centralized Grafana Dashboard for JVM metrics
- **Spring Cloud API Gateway** — Central routing

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose

### 1. Start Infrastructure

Aegis requires PostgreSQL, Kafka, Redis, Keycloak, Prometheus, and Grafana.

```bash
cd infrastructure/docker
docker compose up -d
```
*Note: Flyway migrations are integrated into the Spring Boot apps. They will automatically construct tables and insert Demo Data.*

### 2. Run Backend Services

```bash
# Core Banking (port 8081)
cd services/core-banking && ./mvnw spring-boot:run

# Fraud Service (port 8082)
cd services/fraud-service && ./mvnw spring-boot:run

# Notification Service (port 8084)
cd services/notification-service && ./mvnw spring-boot:run

# Identity Service (port 8085)
cd services/identity-service && ./mvnw spring-boot:run

# API Gateway (port 8080)
cd services/api-gateway && ./mvnw spring-boot:run
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

### 4. Access Monitoring (Grafana)
Grafana is available at `http://localhost:3000` (Default credentials: admin/admin).
Prometheus is available at `http://localhost:9090`.

---


## 👥 Team

Built by Team Echo Binary for **Duothon 6.0** competition.

---

## 📄 License

This project is developed for the Duothon 6.0 competition and is not licensed for commercial use.
