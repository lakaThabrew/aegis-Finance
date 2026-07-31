import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/aegis_ui.dart';

class QrPaymentScreen extends StatefulWidget {
  const QrPaymentScreen({super.key});

  @override
  State<QrPaymentScreen> createState() => _QrPaymentScreenState();
}

class _QrPaymentScreenState extends State<QrPaymentScreen> {
  final ApiService _apiService = ApiService();
  bool _isProcessing = false;

  Future<void> _processPayment() async {
    setState(() => _isProcessing = true);
    await _apiService.processQrPayment('merchant_123', 50.0);
    if (!mounted) return;
    setState(() => _isProcessing = false);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment successful!')));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: aegisBackground,
        appBar: AppBar(title: const Text('QR payment', style: TextStyle(fontWeight: FontWeight.bold))),
        body: AegisScenicBackground(
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 18, 24, 28),
              child: Column(children: [
                const Text('Scan to pay', style: TextStyle(color: Colors.white, fontSize: 27, fontWeight: FontWeight.w800)),
                const SizedBox(height: 6),
                const Text('Align a merchant QR code inside the frame.', style: TextStyle(color: Colors.white54)),
                const Spacer(),
                Container(
                  width: 258,
                  height: 258,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF618BFF), Color(0xFF9A62ED)]),
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: [BoxShadow(color: aegisBlue.withOpacity(.35), blurRadius: 32, spreadRadius: 2)],
                  ),
                  child: Container(
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22)),
                    child: const Icon(Icons.qr_code_scanner_rounded, size: 156, color: Color(0xFF101936)),
                  ),
                ),
                const SizedBox(height: 32),
                AegisSurface(
                  padding: const EdgeInsets.all(16),
                  child: const Row(children: [
                    CircleAvatar(backgroundColor: Color(0x1A16C79A), child: Icon(Icons.storefront_rounded, color: Color(0xFF16C79A))),
                    SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Merchant name', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      SizedBox(height: 3),
                      Text('Verified Aegis merchant', style: TextStyle(color: Colors.white54, fontSize: 12)),
                    ])),
                    Icon(Icons.verified_rounded, color: Color(0xFF16C79A)),
                  ]),
                ),
                const Spacer(),
                _isProcessing ? const CircularProgressIndicator(color: aegisBlue) : AegisPrimaryButton(label: 'Confirm payment', icon: Icons.lock_outline_rounded, onPressed: _processPayment),
              ]),
            ),
          ),
        ),
      );
}
