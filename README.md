# Aegis Finance 🛡️

Aegis Finance is a modern, microservice-based core banking platform and mobile application built for maximum security, AI-driven insights, and seamless user experiences.

## Architecture

The system is split into multiple primary layers:
1. **Frontend (Mobile & Web)**: 
    - **Mobile App**: Built with Flutter.
    - **Web Apps**: `customer-web` and `admin-web` built with modern web technologies.
    All frontends communicate with backend microservices via REST API using JWT Authentication.
2. **Backend (Spring Boot Microservices & Python)**: 
    - `api-gateway`: Spring Cloud Gateway routing requests.
    - `identity-service`: Keycloak for OIDC/OAuth2 Authentication and JWT generation.
    - `core-banking`: Handles accounts, transactions, balances, and card controls.
    - `fraud-ml-engine`: Python-based AI/ML engine for detecting fraudulent transactions.
    - `fraud-service` / `notification-service`: Supporting services for alerts.

## Tech Stack
- **Mobile**: Flutter, Dart, Google Generative AI (`gemini-1.5-pro`)
- **Web**: React, Node.js
- **Backend Services**: Java, Spring Boot, Spring Security, Python (for ML)
- **Database / Cache**: PostgreSQL (with Flyway), Redis
- **Secrets Management**: HashiCorp Vault
- **Messaging**: Apache Kafka
- **Identity Provider**: Keycloak
- **Observability**: Prometheus, Grafana

## Quick Start
To get started with the development environment, you can use the automated scripts or start services manually.

### Automated Startup (Windows)
We provide batch scripts to easily boot up the entire system.
1. **Boot up Infrastructure**:
   Navigate to `infrastructure/docker` and start the containers:
   ```powershell
   docker compose up -d --build
   ```
2. **Start Backend Services**:
   Double-click `start-backend.bat` in the root folder. This opens 5 windows and starts all microservices simultaneously.
3. **Start Web Apps**:
   Double-click `start-frontend.bat` in the root folder. This starts both the Admin and Customer portals.

### Manual Startup
If you prefer to start services individually:

1. **Boot up Backend Infrastructure**:
   Navigate to `infrastructure/docker` and start the containers (Database, Redis, Keycloak, Vault, Kafka):
   ```powershell
   docker-compose up -d
   ```
2. **Run Microservices** (Locally):
   Navigate to each service directory (`services/identity-service`, `services/core-banking`, `services/api-gateway`, etc.) and run:
   ```powershell
   ./mvnw spring-boot:run
   ```
3. **Run Fraud ML Engine**:
   Navigate to `services/fraud-ml-engine`, install dependencies and run the engine:
   ```powershell
   pip install -r requirements.txt
   python app.py
   ```
4. **Run Web Apps**:
   Navigate to `apps/customer-web` and `apps/admin-web`, then run:
   ```powershell
   npm install
   npm run dev
   ```
5. **Run Flutter App**:
   Ensure you have configured `apps/aegis_mobile/.env` with your API URLs and Gemini API key.
   ```powershell
   cd apps/aegis_mobile
   flutter pub get
   flutter run
   ```

## Documentation
- [User Guide](docs/user_guide.md) - Instructions for end users.
- [Testing Guide](docs/testing.md) - Instructions for developers to test APIs and Apps.
