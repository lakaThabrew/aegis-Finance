# 🛡️ Aegis Mobile App

The Aegis Mobile App is a secure, premium digital banking application built with **Flutter**. It serves as the primary customer-facing mobile interface for the Aegis Finance ecosystem, designed for the Duothon 6.0 competition.

## ✨ Features

- **Ultra-Premium UI:** Modern glassmorphism design, vibrant gradients, and fluid staggered animations.
- **Smart Dashboard:** Comprehensive overview of total balance, recent transactions, and quick actions (Transfer, QR Pay, Cards).
- **Interactive Analytics:** Animated charts and progress bars for tracking spending limits and savings goals.
- **Offline Payment Module:** Generates a secure, time-based cryptographic QR token for payments when the device has no internet connection.
- **AI Assistant:** A natural-language chat interface allowing users to ask questions about their finances, spending habits, and account security.
- **Security Center:** Live security scoring, Trusted Device management, and MFA checklists.
- **Card Management:** 3D animated flip card with instant freeze/unfreeze controls and payment toggles.

## 🛠 Technology Stack
- **Framework:** Flutter (Dart)
- **Architecture:** Stateful/Stateless Widgets with `AnimationController` for complex motions.
- **Backend Communication:** HTTP REST integration with the Aegis API Gateway (Mock data implemented in Phase 1).

## 🚀 Getting Started

### Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) installed.
- An Android Emulator, iOS Simulator, or connected physical device.

### Installation & Running
1. Navigate to the mobile app directory:
   ```bash
   cd apps/aegis_mobile
   ```
2. Install dependencies:
   ```bash
   flutter pub get
   ```
3. Run the application:
   ```bash
   flutter run
   ```

## 🧪 Testing

The app includes widget tests to ensure the UI components render correctly.
```bash
flutter test
```

## 📂 Project Structure
- `lib/main.dart` - Application entry point.
- `lib/screens/` - Contains all UI views (Dashboard, Analytics, Transfer, etc.).
- `lib/services/` - API communication layer.
- `assets/` - Images and visual resources.
