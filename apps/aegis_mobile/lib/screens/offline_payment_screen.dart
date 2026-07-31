import 'package:flutter/material.dart';
import 'dart:async';

class OfflinePaymentScreen extends StatefulWidget {
  const OfflinePaymentScreen({super.key});

  @override
  State<OfflinePaymentScreen> createState() => _OfflinePaymentScreenState();
}

class _OfflinePaymentScreenState extends State<OfflinePaymentScreen> with TickerProviderStateMixin {
  int _secondsLeft = 299;
  Timer? _timer;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat(reverse: true);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft > 0) {
        setState(() => _secondsLeft--);
      } else {
        t.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  String get _formattedTime {
    final m = (_secondsLeft ~/ 60).toString().padLeft(2, '0');
    final s = (_secondsLeft % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final pct = _secondsLeft / 299;
    return Scaffold(
      backgroundColor: const Color(0xFF070B18),
      body: Stack(
        children: [
          Positioned.fill(
            child: Image.asset(
              'assets/secure-card-hero.png',
              fit: BoxFit.cover,
              alignment: Alignment.bottomCenter,
              opacity: const AlwaysStoppedAnimation(0.12),
            ),
          ),
          CustomScrollView(
            slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFF070B18),
            elevation: 0,
            automaticallyImplyLeading: false,
            title: const Text('Offline Emergency Pay', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
          SliverFillRemaining(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Offline Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.orange.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: Colors.orange.withOpacity(0.4)),
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: const [
                      Icon(Icons.wifi_off_rounded, color: Colors.orange, size: 16),
                      SizedBox(width: 8),
                      Text('OFFLINE MODE', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1)),
                    ]),
                  ),
                  const SizedBox(height: 24),
                  const Text('Cryptographic QR Token', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  const Text('Max single-transaction limit: AED 100', style: TextStyle(color: Colors.white38, fontSize: 13)),
                  const SizedBox(height: 40),
                  // QR Container with pulse glow
                  AnimatedBuilder(
                    animation: _pulseController,
                    builder: (_, __) => Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [BoxShadow(
                          color: const Color(0xFF4178F4).withOpacity(0.2 + _pulseController.value * 0.3),
                          blurRadius: 30 + _pulseController.value * 20,
                          spreadRadius: 2 + _pulseController.value * 4,
                        )],
                      ),
                      child: const Icon(Icons.qr_code_2_rounded, size: 190, color: Colors.black),
                    ),
                  ),
                  const SizedBox(height: 36),
                  // Timer Ring
                  Stack(alignment: Alignment.center, children: [
                    SizedBox(
                      width: 80, height: 80,
                      child: CircularProgressIndicator(
                        value: pct,
                        backgroundColor: Colors.white10,
                        color: pct > 0.3 ? const Color(0xFF4178F4) : Colors.redAccent,
                        strokeWidth: 5,
                      ),
                    ),
                    Column(children: [
                      Text(_formattedTime,
                        style: TextStyle(
                          color: pct > 0.3 ? Colors.white : Colors.redAccent,
                          fontWeight: FontWeight.bold, fontSize: 18,
                        )),
                      const Text('left', style: TextStyle(color: Colors.white38, fontSize: 10)),
                    ]),
                  ]),
                  const SizedBox(height: 32),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.04),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: Row(children: const [
                      Icon(Icons.info_outline_rounded, color: Colors.white38, size: 18),
                      SizedBox(width: 12),
                      Expanded(child: Text(
                        'Show this token to the merchant scanner. Works without internet. One-time use only.',
                        style: TextStyle(color: Colors.white54, fontSize: 13),
                      )),
                    ]),
                  ),
                ],
              ),
            ),
            ),
          ],
          ),
        ],
      ),
    );
  }
}
