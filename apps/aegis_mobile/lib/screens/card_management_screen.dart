import 'package:flutter/material.dart';
import 'dart:math' as math;

class CardManagementScreen extends StatefulWidget {
  const CardManagementScreen({super.key});

  @override
  State<CardManagementScreen> createState() => _CardManagementScreenState();
}

class _CardManagementScreenState extends State<CardManagementScreen> with SingleTickerProviderStateMixin {
  bool _isCardFrozen = false;
  bool _onlinePayments = true;
  bool _internationalPayments = false;
  bool _contactless = true;
  
  late AnimationController _flipController;

  @override
  void initState() {
    super.initState();
    _flipController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
  }

  @override
  void dispose() {
    _flipController.dispose();
    super.dispose();
  }

  void _toggleFlip() {
    if (_flipController.isCompleted) {
      _flipController.reverse();
    } else {
      _flipController.forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070B18),
      appBar: AppBar(
        title: const Text('Card Management', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0D1530),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: const Text('Tap card to view details', style: TextStyle(color: Colors.white38, fontSize: 12)),
            ),
            const SizedBox(height: 12),
            // 3D Flip Card
            GestureDetector(
              onTap: _toggleFlip,
              child: AnimatedBuilder(
                animation: _flipController,
                builder: (context, child) {
                  final angle = _flipController.value * math.pi;
                  final isFront = angle < (math.pi / 2);
                  return Transform(
                    transform: Matrix4.identity()
                      ..setEntry(3, 2, 0.001)
                      ..rotateY(angle),
                    alignment: Alignment.center,
                    child: isFront ? _buildCardFront() : _buildCardBack(),
                  );
                },
              ),
            ),
            const SizedBox(height: 32),
            const Text('Card Controls', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _buildToggleItem('Freeze Card', 'Temporarily disable all transactions', _isCardFrozen, (v) {
              setState(() => _isCardFrozen = v);
            }, isWarning: true),
            _buildToggleItem('Online Payments', 'Allow e-commerce transactions', _onlinePayments, (v) {
              setState(() => _onlinePayments = v);
            }),
            _buildToggleItem('International Payments', 'Allow payments outside UAE', _internationalPayments, (v) {
              setState(() => _internationalPayments = v);
            }),
            _buildToggleItem('Contactless (NFC)', 'Allow tap-to-pay', _contactless, (v) {
              setState(() => _contactless = v);
            }),
            const SizedBox(height: 32),
            Container(
              width: double.infinity,
              height: 54,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.redAccent.withOpacity(0.5)),
                borderRadius: BorderRadius.circular(14),
                color: Colors.redAccent.withOpacity(0.05),
              ),
              child: TextButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.report_problem_rounded, color: Colors.redAccent),
                label: const Text('Report Lost or Stolen', style: TextStyle(color: Colors.redAccent, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCardFront() {
    return Container(
      width: double.infinity,
      height: 220,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF4178F4), Color(0xFF9A62ED)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF4178F4).withOpacity(0.4),
            blurRadius: 24, offset: const Offset(0, 10),
          )
        ],
      ),
      child: Stack(
        children: [
          // Background Pattern
          Positioned(
            right: -20, top: -20,
            child: Icon(Icons.shield_rounded, size: 140, color: Colors.white.withOpacity(0.1)),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('AEGIS DEBIT', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 2)),
                  Icon(Icons.wifi_rounded, color: Colors.white),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('****  ****  ****  1234', style: TextStyle(color: Colors.white, fontSize: 24, letterSpacing: 4, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('CUSTOMER NAME', style: TextStyle(color: Colors.white70, fontSize: 14, letterSpacing: 1)),
                      Text('12/29', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCardBack() {
    return Transform(
      alignment: Alignment.center,
      transform: Matrix4.identity()..rotateY(math.pi),
      child: Container(
        width: double.infinity,
        height: 220,
        decoration: BoxDecoration(
          color: const Color(0xFF1B233D),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 30),
            Container(width: double.infinity, height: 40, color: Colors.black87),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 36, color: Colors.white70,
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.only(right: 8),
                      child: const Text('***', style: TextStyle(color: Colors.black, fontStyle: FontStyle.italic)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    height: 36, width: 50, color: Colors.white,
                    alignment: Alignment.center,
                    child: const Text('842', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            const Spacer(),
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text('For customer service call +971 800 AEGIS. This card is property of Aegis Finance.',
                style: TextStyle(color: Colors.white38, fontSize: 10), textAlign: TextAlign.center),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToggleItem(String title, String subtitle, bool value, ValueChanged<bool> onChanged, {bool isWarning = false}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: SwitchListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(title, style: TextStyle(color: isWarning && value ? Colors.redAccent : Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
        subtitle: Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 12)),
        value: value,
        onChanged: onChanged,
        activeColor: isWarning ? Colors.redAccent : const Color(0xFF4178F4),
        inactiveTrackColor: Colors.white10,
      ),
    );
  }
}
