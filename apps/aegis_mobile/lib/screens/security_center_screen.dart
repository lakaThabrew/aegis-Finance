import 'package:flutter/material.dart';

class SecurityCenterScreen extends StatelessWidget {
  const SecurityCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070B18),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            backgroundColor: const Color(0xFF070B18),
            elevation: 0,
            automaticallyImplyLeading: false,
            title: const Text('Security Center', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Security Score Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      image: const DecorationImage(
                        image: AssetImage('assets/aegis-security-hero.png'),
                        fit: BoxFit.cover,
                        opacity: 0.45,
                        alignment: Alignment.centerRight,
                      ),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1B233D), Color(0xFF2A3458)],
                        begin: Alignment.topLeft, end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: const Color(0xFF4178F4).withOpacity(0.2)),
                      boxShadow: [BoxShadow(
                        color: const Color(0xFF4178F4).withOpacity(0.1),
                        blurRadius: 20, offset: const Offset(0, 8),
                      )],
                    ),
                    child: Row(children: [
                      Stack(alignment: Alignment.center, children: [
                        SizedBox(
                          width: 90, height: 90,
                          child: CircularProgressIndicator(
                            value: 0.94,
                            backgroundColor: Colors.white10,
                            color: Colors.greenAccent,
                            strokeWidth: 6,
                          ),
                        ),
                        Column(children: const [
                          Text('94', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
                          Text('/100', style: TextStyle(color: Colors.white38, fontSize: 11)),
                        ]),
                      ]),
                      const SizedBox(width: 24),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: const [
                          Icon(Icons.verified_rounded, color: Colors.greenAccent, size: 18),
                          SizedBox(width: 6),
                          Text('Strong Security', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
                        ]),
                        const SizedBox(height: 8),
                        _buildTag('MFA Active', Colors.greenAccent),
                        const SizedBox(height: 6),
                        _buildTag('2 Trusted Devices', const Color(0xFF4178F4)),
                      ])),
                    ]),
                  ),
                  const SizedBox(height: 28),
                  // Security Checklist
                  const Text('Security Checklist', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 14),
                  _buildCheckItem('Two-Factor Authentication', true, Icons.phonelink_lock_rounded),
                  _buildCheckItem('Biometric Login', true, Icons.fingerprint_rounded),
                  _buildCheckItem('Email Verification', true, Icons.mark_email_read_rounded),
                  _buildCheckItem('Recovery Phone', false, Icons.phone_rounded),
                  const SizedBox(height: 28),
                  const Text('Trusted Devices', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 14),
                  _buildDeviceCard('9465G (Current)', 'Active right now', Icons.phone_android_rounded, true),
                  _buildDeviceCard('Chrome Browser', 'Last: 2 days ago', Icons.laptop_mac_rounded, false),
                  const SizedBox(height: 28),
                  const Text('Recent Login Activity', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 14),
                  _buildActivityCard('Dubai, AE', '192.168.1.1', 'Success', Colors.greenAccent),
                  _buildActivityCard('Unknown Location', '10.0.0.5', 'Blocked', Colors.redAccent),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  static Widget _buildTag(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }

  static Widget _buildCheckItem(String label, bool done, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(children: [
        Icon(icon, color: done ? Colors.greenAccent : Colors.white38, size: 22),
        const SizedBox(width: 14),
        Expanded(child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 14))),
        Icon(done ? Icons.check_circle_rounded : Icons.cancel_rounded,
          color: done ? Colors.greenAccent : Colors.redAccent, size: 20),
      ]),
    );
  }

  static Widget _buildDeviceCard(String name, String status, IconData icon, bool isCurrent) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isCurrent
          ? const Color(0xFF4178F4).withOpacity(0.3)
          : Colors.white.withOpacity(0.06)),
      ),
      child: Row(children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(
            color: const Color(0xFF4178F4).withOpacity(0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: const Color(0xFF4178F4), size: 22),
        ),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 2),
          Text(status, style: const TextStyle(color: Colors.white38, fontSize: 12)),
        ])),
        isCurrent
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.greenAccent.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text('Active', style: TextStyle(color: Colors.greenAccent, fontSize: 11, fontWeight: FontWeight.bold)),
            )
          : OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.redAccent),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: const Text('Revoke', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
            ),
      ]),
    );
  }

  static Widget _buildActivityCard(String loc, String ip, String status, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(Icons.location_on_rounded, color: color, size: 22),
        ),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(loc, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 2),
          Text('IP: $ip', style: const TextStyle(color: Colors.white38, fontSize: 12)),
        ])),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(status, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
        ),
      ]),
    );
  }
}
