import 'package:flutter/material.dart';
import '../widgets/aegis_ui.dart';

class FraudAlertScreen extends StatelessWidget {
  const FraudAlertScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: aegisBackground,
        appBar: AppBar(
          title: const Text('Security alert', style: TextStyle(fontWeight: FontWeight.bold)),
          foregroundColor: Colors.white,
        ),
        body: AegisScenicBackground(
          alignment: Alignment.topCenter,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
            child: AegisSurface(
              child: Column(children: [
                Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(color: Colors.redAccent.withOpacity(.13), shape: BoxShape.circle, border: Border.all(color: Colors.redAccent.withOpacity(.45))),
                  child: const Icon(Icons.shield_outlined, color: Colors.redAccent, size: 39),
                ),
                const SizedBox(height: 18),
                const Text('Suspicious transaction', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                const SizedBox(height: 7),
                const Text('We paused this payment to keep your account secure.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white60, height: 1.4)),
                const SizedBox(height: 24),
                _detail('Merchant', 'Quantum Chrono Rentals'),
                _detail('Amount', 'AED 249.50', strong: true),
                _detail('Date & time', '12 July 2065, 14:32 GMT'),
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: Colors.redAccent.withOpacity(.09), borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.redAccent.withOpacity(.22))),
                  child: const Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Icon(Icons.info_outline_rounded, color: Colors.redAccent, size: 19),
                    SizedBox(width: 10),
                    Expanded(child: Text('This activity is different from your usual payment pattern.', style: TextStyle(color: Color(0xFFFFB4AB), height: 1.4))),
                  ]),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton.icon(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.check_circle_outline_rounded),
                    label: const Text('This was me'),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF16A87A), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.report_outlined),
                    label: const Text('Report fraud'),
                    style: OutlinedButton.styleFrom(foregroundColor: Colors.redAccent, side: const BorderSide(color: Colors.redAccent), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
                  ),
                ),
                TextButton.icon(onPressed: () {}, icon: const Icon(Icons.lock_outline_rounded, size: 17), label: const Text('Freeze my account'), style: TextButton.styleFrom(foregroundColor: Colors.white54)),
              ]),
            ),
          ),
        ),
      );

  static Widget _detail(String label, String value, {bool strong = false}) => Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Colors.white.withOpacity(.08)))),
        child: Row(children: [
          Expanded(child: Text(label, style: const TextStyle(color: Colors.white54, fontSize: 13))),
          Flexible(child: Text(value, textAlign: TextAlign.right, style: TextStyle(color: Colors.white, fontWeight: strong ? FontWeight.w800 : FontWeight.w600))),
        ]),
      );
}
