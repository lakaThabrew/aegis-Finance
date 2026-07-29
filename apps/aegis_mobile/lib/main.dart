import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const AegisMobileApp());
}

class AegisMobileApp extends StatelessWidget {
  const AegisMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aegis Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF070B18),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF4178F4), // Primary Button Gradient Start
          secondary: Color(0xFF9A62ED), // Primary Button Gradient End
          surface: Color(0xFF141C37), // Glass surface equivalent
          background: Color(0xFF070B18),
          onBackground: Color(0xFFF7F9FF),
          onSurface: Color(0xFFF7F9FF),
        ),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: Color(0xFFF7F9FF)),
          bodyMedium: TextStyle(color: Color(0xFFF7F9FF)),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF070B18),
          foregroundColor: Color(0xFFF7F9FF),
          elevation: 0,
          centerTitle: false,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withOpacity(0.06),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 17),
          labelStyle: const TextStyle(color: Colors.white54),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.10)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xFF628DFF), width: 1.5),
          ),
        ),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}

