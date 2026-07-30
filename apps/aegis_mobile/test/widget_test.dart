import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aegis_mobile/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const AegisMobileApp());
    await tester.pump(const Duration(milliseconds: 300));

    // Verify that the login screen loads — check for the AEGIS brand text and shield icon.
    expect(find.text('AEGIS'), findsOneWidget);
    expect(find.byIcon(Icons.shield_rounded), findsOneWidget);
  });
}
