import 'package:flutter/material.dart';

const aegisBackground = Color(0xFF070B18);
const aegisBlue = Color(0xFF4178F4);
const aegisViolet = Color(0xFF9A62ED);

class AegisScenicBackground extends StatelessWidget {
  const AegisScenicBackground({super.key, required this.child, this.alignment = Alignment.bottomCenter});

  final Widget child;
  final Alignment alignment;

  @override
  Widget build(BuildContext context) => Stack(
        children: [
          Positioned.fill(
            child: Image.asset(
              'assets/secure-card-hero.png',
              fit: BoxFit.cover,
              alignment: alignment,
              opacity: const AlwaysStoppedAnimation(0.17),
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xB3070B18), aegisBackground, aegisBackground],
                  stops: [0, .56, 1],
                ),
              ),
            ),
          ),
          child,
        ],
      );
}

class AegisSurface extends StatelessWidget {
  const AegisSurface({super.key, required this.child, this.padding = const EdgeInsets.all(20)});

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) => Container(
        padding: padding,
        decoration: BoxDecoration(
          color: const Color(0xFF111A34).withOpacity(.9),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: Colors.white.withOpacity(.1)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(.22), blurRadius: 24, offset: const Offset(0, 12))],
        ),
        child: child,
      );
}

class AegisPrimaryButton extends StatelessWidget {
  const AegisPrimaryButton({super.key, required this.label, required this.onPressed, this.icon});

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;

  @override
  Widget build(BuildContext context) => SizedBox(
        width: double.infinity,
        height: 54,
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [aegisBlue, aegisViolet]),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: aegisBlue.withOpacity(.28), blurRadius: 16, offset: const Offset(0, 7))],
          ),
          child: ElevatedButton.icon(
            onPressed: onPressed,
            icon: icon == null ? const SizedBox.shrink() : Icon(icon, color: Colors.white, size: 19),
            label: Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent),
          ),
        ),
      );
}
