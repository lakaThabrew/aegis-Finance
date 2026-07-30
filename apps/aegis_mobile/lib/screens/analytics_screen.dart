import 'package:flutter/material.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

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
            title: const Text('Financial Insights', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            automaticallyImplyLeading: false,
            actions: [
              Container(
                margin: const EdgeInsets.only(right: 16),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF4178F4).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF4178F4).withOpacity(0.3)),
                ),
                child: const Text('July 2026', style: TextStyle(color: Color(0xFF4178F4), fontSize: 12, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Overview Cards
                  Row(children: [
                    Expanded(child: _buildStatCard('Income', 12000, Colors.greenAccent, Icons.arrow_downward_rounded)),
                    const SizedBox(width: 12),
                    Expanded(child: _buildStatCard('Expenses', 4250, Colors.redAccent, Icons.arrow_upward_rounded)),
                  ]),
                  const SizedBox(height: 12),
                  _buildNetCard(7750),
                  const SizedBox(height: 28),
                  const Text('Spending Breakdown', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  _buildCategoryCard('Groceries', 0.40, 1700, const Color(0xFF4178F4), Icons.shopping_cart_rounded),
                  _buildCategoryCard('Utilities', 0.25, 1062, const Color(0xFF9A62ED), Icons.bolt_rounded),
                  _buildCategoryCard('Entertainment', 0.15, 637, const Color(0xFFFF7B5E), Icons.movie_rounded),
                  _buildCategoryCard('Others', 0.20, 851, Colors.teal, Icons.more_horiz_rounded),
                  const SizedBox(height: 28),
                  const Text('Savings Progress', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  _buildSavingsCard(0.516),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, double amount, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(color: color.withOpacity(0.8), fontSize: 12)),
        ]),
        const SizedBox(height: 10),
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final val = Tween<double>(begin: 0, end: amount).animate(
              CurvedAnimation(parent: _controller, curve: Curves.easeOutQuart),
            ).value;
            return Text('AED ${val.toStringAsFixed(0)}', 
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold));
          },
        ),
      ]),
    );
  }

  Widget _buildNetCard(double targetAmount) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [
          const Color(0xFF4178F4).withOpacity(0.15),
          const Color(0xFF9A62ED).withOpacity(0.15),
        ]),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Net Savings', style: TextStyle(color: Colors.white54, fontSize: 13)),
          const SizedBox(height: 4),
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              final val = Tween<double>(begin: 0, end: targetAmount).animate(
                CurvedAnimation(parent: _controller, curve: Curves.easeOutQuart),
              ).value;
              return Text('AED ${val.toStringAsFixed(0)}', 
                style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold));
            },
          ),
        ]),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.greenAccent.withOpacity(0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Text('+64.6%', style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 14)),
        ),
      ]),
    );
  }

  Widget _buildCategoryCard(String label, double targetPct, double targetAmount, Color color, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(children: [
        Row(children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
              AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  final val = Tween<double>(begin: 0, end: targetAmount).animate(
                    CurvedAnimation(parent: _controller, curve: Curves.easeOutQuart),
                  ).value;
                  return Text('AED ${val.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white70, fontSize: 13));
                },
              ),
            ]),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  final val = Tween<double>(begin: 0, end: targetPct).animate(
                    CurvedAnimation(parent: _controller, curve: Curves.easeOutQuart),
                  ).value;
                  return LinearProgressIndicator(
                    value: val, minHeight: 6,
                    backgroundColor: Colors.white10,
                    valueColor: AlwaysStoppedAnimation<Color>(color),
                  );
                },
              ),
            ),
          ])),
        ]),
      ]),
    );
  }

  Widget _buildSavingsCard(double targetPct) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1B233D), Color(0xFF2A3458)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: const [
          Text('Emergency Fund', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          Text('AED 7,750 / AED 15,000', style: TextStyle(color: Colors.white38, fontSize: 12)),
        ]),
        const SizedBox(height: 12),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              final val = Tween<double>(begin: 0, end: targetPct).animate(
                CurvedAnimation(parent: _controller, curve: Curves.easeOutQuart),
              ).value;
              return LinearProgressIndicator(
                value: val, minHeight: 10,
                backgroundColor: const Color(0xFF0D1530),
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF4178F4)),
              );
            },
          ),
        ),
        const SizedBox(height: 8),
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final val = Tween<double>(begin: 0, end: targetPct * 100).animate(
              CurvedAnimation(parent: _controller, curve: Curves.easeOutQuart),
            ).value;
            return Text('${val.toStringAsFixed(1)}% towards goal', style: const TextStyle(color: Colors.white54, fontSize: 12));
          },
        ),
      ]),
    );
  }
}
