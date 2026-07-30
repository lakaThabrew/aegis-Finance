import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import 'qr_payment_screen.dart';
import 'card_management_screen.dart';
import 'transfer_screen.dart';
import 'fraud_alert_screen.dart';
import 'login_screen.dart';
import 'security_center_screen.dart';
import 'ai_assistant_screen.dart';
import 'offline_payment_screen.dart';
import 'analytics_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> with TickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _data;
  int _selectedIndex = 0;
  
  late AnimationController _mainAnimController;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));
    _mainAnimController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));
    _fetchData();
  }

  @override
  void dispose() {
    _mainAnimController.dispose();
    super.dispose();
  }

  void _fetchData() async {
    final data = await _apiService.getDashboardData();
    if (mounted) {
      setState(() => _data = data);
      _mainAnimController.forward();
    }
  }

  void _onItemTapped(int index) {
    if (index == 4) {
      _apiService.logout();
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
      return;
    }
    if (_selectedIndex != index) {
      setState(() => _selectedIndex = index);
    }
  }

  Widget _buildHomeView() {
    if (_data == null) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF4178F4)));
    }
    return CustomScrollView(
      key: const PageStorageKey('home'),
      slivers: [
        SliverAppBar(
          expandedHeight: 200,
          floating: false,
          pinned: true,
          backgroundColor: const Color(0xFF070B18),
          elevation: 0,
          flexibleSpace: FlexibleSpaceBar(
            background: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(
                  'assets/aegis-security-hero.png',
                  fit: BoxFit.cover,
                  alignment: Alignment.centerRight,
                  opacity: const AlwaysStoppedAnimation(0.68),
                ),
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      colors: [Color(0xF0070B18), Color(0xB0070B18), Color(0x33070B18)],
                    ),
                  ),
                ),
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                              Text('Good Day,', style: TextStyle(color: Colors.white54, fontSize: 13)),
                              Text('Aegis Customer',
                                style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                            ]),
                            Row(children: [
                              _AnimatedTapButton(
                                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AiAssistantScreen())),
                                child: _buildAppBarAction(Icons.support_agent_rounded, const Color(0xFF9A62ED)),
                              ),
                              const SizedBox(width: 8),
                              _AnimatedTapButton(
                                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FraudAlertScreen())),
                                child: _buildAppBarAction(Icons.notifications_rounded, Colors.white24),
                              ),
                              const SizedBox(width: 8),
                              CircleAvatar(
                                radius: 18,
                                backgroundColor: const Color(0xFF4178F4).withOpacity(0.2),
                                child: const Icon(Icons.person_rounded, color: Color(0xFF4178F4), size: 20),
                              ),
                            ]),
                          ],
                        ),
                        const SizedBox(height: 20),
                        const Text('TOTAL BALANCE', style: TextStyle(color: Colors.white38, fontSize: 11, letterSpacing: 2)),
                        const SizedBox(height: 4),
                        Text('AED ${_data!['totalBalance']}',
                          style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.bold, letterSpacing: -1)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _StaggeredAnim(
                  controller: _mainAnimController,
                  begin: 0.1, end: 0.4,
                  child: _buildBalanceCard(),
                ),
                const SizedBox(height: 28),
                _StaggeredAnim(
                  controller: _mainAnimController,
                  begin: 0.2, end: 0.5,
                  child: _buildSectionTitle('Quick Actions'),
                ),
                const SizedBox(height: 16),
                _StaggeredAnim(
                  controller: _mainAnimController,
                  begin: 0.3, end: 0.6,
                  child: _buildQuickActions(),
                ),
                const SizedBox(height: 28),
                _StaggeredAnim(
                  controller: _mainAnimController,
                  begin: 0.4, end: 0.7,
                  child: _buildSectionTitle('Recent Transactions', trailing: TextButton(
                    onPressed: () {},
                    child: const Text('See All', style: TextStyle(color: Color(0xFF4178F4), fontSize: 13)),
                  )),
                ),
                const SizedBox(height: 12),
                _StaggeredAnim(
                  controller: _mainAnimController,
                  begin: 0.5, end: 1.0,
                  child: _buildTransactionsList(),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAppBarAction(IconData icon, Color color) {
    return Container(
      width: 36, height: 36,
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(icon, color: color, size: 18),
    );
  }

  Widget _buildBalanceCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF4178F4), Color(0xFF9A62ED)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(
          color: const Color(0xFF4178F4).withOpacity(0.3),
          blurRadius: 20, offset: const Offset(0, 8),
        )],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
            Text('Active Account', style: TextStyle(color: Colors.white70, fontSize: 12)),
            SizedBox(height: 4),
            Text('****  ****  ****  1234',
              style: TextStyle(color: Colors.white, fontSize: 16, letterSpacing: 2, fontWeight: FontWeight.w600)),
          ]),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text('Savings', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, {Widget? trailing}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        if (trailing != null) trailing,
      ],
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {'icon': Icons.swap_horiz_rounded, 'label': 'Transfer', 'color': const Color(0xFF4178F4), 'screen': const TransferScreen()},
      {'icon': Icons.qr_code_scanner_rounded, 'label': 'QR Pay', 'color': const Color(0xFF9A62ED), 'screen': const QrPaymentScreen()},
      {'icon': Icons.credit_card_rounded, 'label': 'Cards', 'color': const Color(0xFF16C79A), 'screen': const CardManagementScreen()},
      {'icon': Icons.receipt_long_rounded, 'label': 'Bills', 'color': const Color(0xFFFF7B5E), 'screen': null},
    ];
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: actions.map((a) {
        final color = a['color'] as Color;
        final screen = a['screen'] as Widget?;
        return _AnimatedTapButton(
          onTap: () {
            if (screen != null) {
              // Add a slight delay before pushing so the scale animation completes
              Future.delayed(const Duration(milliseconds: 150), () async {
                final result = await Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
                if (result == true) {
                  _fetchData();
                }
              });
            }
          },
          child: Column(children: [
            Container(
              width: 64, height: 64,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: color.withOpacity(0.25)),
              ),
              child: Icon(a['icon'] as IconData, color: color, size: 28),
            ),
            const SizedBox(height: 8),
            Text(a['label'] as String, style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ]),
        );
      }).toList(),
    );
  }

  Widget _buildTransactionsList() {
    final transactions = (_data!['recentTransactions'] as List);
    return Column(
      children: transactions.map((tx) {
        final isNeg = tx['amount'] < 0;
        return _AnimatedTapButton(
          onTap: () {},
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
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
                  color: (isNeg ? Colors.redAccent : Colors.greenAccent).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  isNeg ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
                  color: isNeg ? Colors.redAccent : Colors.greenAccent,
                  size: 20,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(tx['desc'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                const SizedBox(height: 2),
                Text(tx['date'], style: const TextStyle(color: Colors.white38, fontSize: 12)),
              ])),
              Text(
                '${isNeg ? '-' : '+'}AED ${(tx['amount'] as num).abs()}',
                style: TextStyle(
                  color: isNeg ? Colors.redAccent : Colors.greenAccent,
                  fontWeight: FontWeight.bold, fontSize: 14,
                ),
              ),
            ]),
          ),
        );
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget body;
    switch (_selectedIndex) {
      case 0: body = _buildHomeView(); break;
      case 1: body = const AnalyticsScreen(key: PageStorageKey('analytics')); break;
      case 2: body = const OfflinePaymentScreen(key: PageStorageKey('offline')); break;
      case 3: body = const SecurityCenterScreen(key: PageStorageKey('security')); break;
      default: body = _buildHomeView();
    }

    return Scaffold(
      backgroundColor: const Color(0xFF070B18),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        switchInCurve: Curves.easeOut,
        switchOutCurve: Curves.easeIn,
        transitionBuilder: (child, animation) {
          return FadeTransition(
            opacity: animation,
            child: SlideTransition(
              position: Tween<Offset>(begin: const Offset(0, 0.05), end: Offset.zero).animate(animation),
              child: child,
            ),
          );
        },
        child: body,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0D1530),
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
        ),
        child: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: const Color(0xFF4178F4),
          unselectedItemColor: Colors.white38,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.pie_chart_rounded), label: 'Analytics'),
            BottomNavigationBarItem(icon: Icon(Icons.wifi_off_rounded), label: 'Offline'),
            BottomNavigationBarItem(icon: Icon(Icons.security_rounded), label: 'Security'),
            BottomNavigationBarItem(icon: Icon(Icons.logout_rounded), label: 'Logout'),
          ],
        ),
      ),
    );
  }
}

// Custom widget for staggered slide & fade animations
class _StaggeredAnim extends StatelessWidget {
  final AnimationController controller;
  final double begin;
  final double end;
  final Widget child;

  const _StaggeredAnim({required this.controller, required this.begin, required this.end, required this.child});

  @override
  Widget build(BuildContext context) {
    final fade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: controller, curve: Interval(begin, end, curve: Curves.easeOut)),
    );
    final slide = Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(
      CurvedAnimation(parent: controller, curve: Interval(begin, end, curve: Curves.easeOutCubic)),
    );

    return FadeTransition(
      opacity: fade,
      child: SlideTransition(
        position: slide,
        child: child,
      ),
    );
  }
}

// Custom widget for tap scale (bounce) effect
class _AnimatedTapButton extends StatefulWidget {
  final Widget child;
  final VoidCallback onTap;

  const _AnimatedTapButton({required this.child, required this.onTap});

  @override
  State<_AnimatedTapButton> createState() => _AnimatedTapButtonState();
}

class _AnimatedTapButtonState extends State<_AnimatedTapButton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 100));
    _scale = Tween<double>(begin: 1.0, end: 0.92).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) {
        _controller.reverse();
        widget.onTap();
      },
      onTapCancel: () => _controller.reverse(),
      child: ScaleTransition(
        scale: _scale,
        child: widget.child,
      ),
    );
  }
}
