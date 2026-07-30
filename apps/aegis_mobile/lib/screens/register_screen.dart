import 'package:flutter/material.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070B18),
      body: Stack(
        children: [
          Positioned.fill(
            child: Image.asset(
              'assets/aegis-security-hero.png',
              fit: BoxFit.cover,
              alignment: Alignment.topCenter,
              opacity: const AlwaysStoppedAnimation(0.26),
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0x99070B18), Color(0xFF070B18)],
                  stops: [0.0, 0.42],
                ),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 12, 24, 28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back_ios_new_rounded),
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.white.withOpacity(0.08),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF4178F4), Color(0xFF9A62ED)]),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(Icons.verified_user_rounded, color: Colors.white, size: 30),
                  ),
                  const SizedBox(height: 22),
                  const Text('Create your secure account',
                      style: TextStyle(color: Colors.white, fontSize: 29, fontWeight: FontWeight.w800, height: 1.15)),
                  const SizedBox(height: 8),
                  const Text('A few details are all we need to start your protected Aegis experience.',
                      style: TextStyle(color: Colors.white60, fontSize: 14, height: 1.5)),
                  const SizedBox(height: 30),
                  Container(
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111A34).withOpacity(0.92),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white.withOpacity(0.12)),
                    ),
                    child: Column(
                      children: [
                        _field('Full name', Icons.person_outline_rounded),
                        const SizedBox(height: 16),
                        _field('National ID / Passport number', Icons.badge_outlined),
                        const SizedBox(height: 16),
                        _field('Email address', Icons.mail_outline_rounded, keyboardType: TextInputType.emailAddress),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          height: 54,
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [Color(0xFF4178F4), Color(0xFF9A62ED)]),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: ElevatedButton(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Registration submitted for KYC review.')),
                                );
                                Navigator.pop(context);
                              },
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent),
                              child: const Text('Continue to verification', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Center(
                    child: Text('Your information is protected with bank-grade encryption.',
                        textAlign: TextAlign.center, style: TextStyle(color: Colors.white38, fontSize: 12)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  static Widget _field(String label, IconData icon, {TextInputType? keyboardType}) => TextField(
        keyboardType: keyboardType,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon, color: const Color(0xFF8DA9FF))),
      );
}
