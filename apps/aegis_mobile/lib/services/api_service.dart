import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://api.mock-aegis-admin.local/v1';
  String? _authToken;

  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  bool get isAuthenticated => _authToken != null;

  Future<bool> login(String username, String password) async {
    // Mock network delay
    await Future.delayed(const Duration(seconds: 1));
    if (username.isNotEmpty && password == 'password') {
      _authToken = 'mock-jwt-token-12345';
      return true;
    }
    return false;
  }

  void logout() {
    _authToken = null;
  }

  Future<Map<String, dynamic>> getDashboardData() async {
    await Future.delayed(const Duration(milliseconds: 800));
    return {
      'totalBalance': 1250000.00,
      'accounts': [
        {'type': 'Savings Account', 'number': 'Aegis ** 1234567890', 'balance': 1250000.00},
        {'type': 'Current Account', 'number': 'Aegis ** 0987654321', 'balance': 850000.00},
      ],
      'recentTransactions': [
        {'desc': 'Grocery Hub', 'date': 'Jan 3, 2065', 'amount': -54.20},
        {'desc': 'HyperLoop Coffee', 'date': 'Jan 3, 2065', 'amount': -12.99},
        {'desc': 'Quantum Grid Store', 'date': 'Jan 2, 2065', 'amount': -450.00},
      ]
    };
  }

  Future<bool> processQrPayment(String merchantId, double amount) async {
    await Future.delayed(const Duration(seconds: 1));
    return true;
  }
}
