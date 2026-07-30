# Aegis Finance 🛡️

Aegis Finance is a modern, microservice-based core banking platform and mobile application built for maximum security, AI-driven insights, and seamless user experiences.

## Architecture

The system is split into two primary layers:
1. **Frontend (Mobile App)**: Built with Flutter. Communicates with backend microservices via REST API using JWT Authentication.
2. **Backend (Spring Boot Microservices)**: 
    - `api-gateway`: Traefik or Spring Cloud Gateway routing requests.
    - `identity-service`: Keycloak for OIDC/OAuth2 Authentication and JWT generation.
    - `core-banking`: Handles accounts, transactions, balances, and card controls.
    - `fraud-ml-engine`: AI/ML engine for detecting fraudulent transactions.
    - `fraud-service` / `notification-service`: Supporting services for alerts.

## Tech Stack
- **Mobile**: Flutter, Dart, Google Generative AI (`gemini-1.5-pro`)
- **Backend Services**: Java, Spring Boot, Spring Security
- **Database / Cache**: PostgreSQL (with Flyway), Redis
- **Messaging**: Apache Kafka
- **Identity Provider**: Keycloak
- **Observability**: Prometheus, Grafana

## Quick Start
To get started with the development environment:

1. **Boot up Backend Infrastructure**:
   ```powershell
   docker-compose up -d
   ```
2. **Run Microservices** (Locally):
   Navigate to each service directory (`services/identity-service`, `services/core-banking`, `services/api-gateway`) and run:
   ```powershell
   ./mvnw spring-boot:run
   ```
3. **Run Flutter App**:
   Ensure you have configured `apps/aegis_mobile/.env` with your API URLs and Gemini API key.
   ```powershell
   cd apps/aegis_mobile
   flutter pub get
   flutter run
   ```

## Documentation
- [User Guide](docs/user_guide.md) - Instructions for end users.
- [Testing Guide](docs/testing.md) - Instructions for developers to test APIs.
