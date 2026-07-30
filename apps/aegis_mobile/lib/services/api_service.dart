import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthenticatedClient extends http.BaseClient {
  final http.Client _inner = http.Client();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    final token = await _storage.read(key: 'jwt_token');
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    request.headers['Content-Type'] = 'application/json';
    return _inner.send(request);
  }
}

class ApiService {
  final _storage = const FlutterSecureStorage();
  String? _authToken;
  final http.Client _client = AuthenticatedClient();

  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  bool get isAuthenticated => _authToken != null;

  String get _keycloakUrl => dotenv.env['KEYCLOAK_TOKEN_URL'] ?? 'http://10.10.11.63:8080/realms/aegis/protocol/openid-connect/token';
  String get _apiGateway => dotenv.env['API_GATEWAY_URL'] ?? 'http://10.10.11.63:8084';
  String get _coreBankingUrl => dotenv.env['CORE_BANKING_URL'] ?? 'http://10.10.11.63:8081/api/v1/core';

  Future<bool> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse(_keycloakUrl),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: {
          'grant_type': 'password',
          'client_id': 'aegis-frontend',
          'username': username,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _authToken = data['access_token'];
        await _storage.write(key: 'jwt_token', value: _authToken);
        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    _authToken = null;
    await _storage.delete(key: 'jwt_token');
  }

  Future<void> loadToken() async {
    _authToken = await _storage.read(key: 'jwt_token');
  }

  Future<Map<String, dynamic>> getDashboardData() async {
    try {
      final accountsResponse = await _client.get(Uri.parse('$_coreBankingUrl/accounts'));
      final transactionsResponse = await _client.get(Uri.parse('$_coreBankingUrl/transactions'));

      double totalBalance = 0.0;
      List<Map<String, dynamic>> formattedAccounts = [];
      
      if (accountsResponse.statusCode == 200) {
        List<dynamic> accountsData = jsonDecode(accountsResponse.body);
        for (var acc in accountsData) {
          double balance = acc['balance']?.toDouble() ?? 0.0;
          totalBalance += balance;
          formattedAccounts.add({
            'type': '${acc['currency']} Account',
            'number': 'Aegis ** ' + acc['accountNumber'].toString().substring(acc['accountNumber'].toString().length >= 4 ? acc['accountNumber'].toString().length - 4 : 0),
            'rawNumber': acc['accountNumber'],
            'balance': balance,
          });
        }
      }

      List<Map<String, dynamic>> formattedTransactions = [];
      if (transactionsResponse.statusCode == 200) {
        List<dynamic> txData = jsonDecode(transactionsResponse.body);
        for (var tx in txData) {
          bool isOutgoing = false;
          if (tx['senderAccount'] != null && formattedAccounts.any((a) => a['rawNumber'] == tx['senderAccount']['accountNumber'])) {
            isOutgoing = true;
          }
          
          double amount = tx['amount']?.toDouble() ?? 0.0;
          if (isOutgoing) amount = -amount;

          formattedTransactions.add({
            'desc': tx['reference'] ?? 'Transaction',
            'date': tx['createdAt'] != null ? tx['createdAt'].toString().substring(0, 10) : 'Recent',
            'amount': amount,
          });
        }
      }

      return {
        'totalBalance': totalBalance,
        'accounts': formattedAccounts,
        'recentTransactions': formattedTransactions,
      };
    } catch (e) {
      print('Error fetching dashboard data: $e');
      return {
        'totalBalance': 0.0,
        'accounts': [],
        'recentTransactions': [],
      };
    }
  }

  Future<bool> processTransfer(String senderAccount, String receiverAccount, double amount) async {
    try {
      final response = await _client.post(
        Uri.parse('$_coreBankingUrl/transfer'),
        body: jsonEncode({
          'senderAccountNumber': senderAccount,
          'receiverAccountNumber': receiverAccount,
          'amount': amount,
          'idempotencyKey': DateTime.now().millisecondsSinceEpoch.toString()
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<bool> processQrPayment(String merchantId, double amount) async {
    try {
      final accountsResponse = await _client.get(Uri.parse('$_coreBankingUrl/accounts'));
      if (accountsResponse.statusCode == 200) {
        List<dynamic> accountsData = jsonDecode(accountsResponse.body);
        if (accountsData.isNotEmpty) {
           return processTransfer(accountsData.first['accountNumber'], merchantId, amount);
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getCards() async {
    try {
      final response = await _client.get(Uri.parse('$_coreBankingUrl/cards'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as List<dynamic>;
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      print('Error fetching cards: $e');
      return [];
    }
  }

  Future<bool> updateCardControls(String cardId, Map<String, bool> controls) async {
    try {
      final response = await _client.patch(
        Uri.parse('$_coreBankingUrl/cards/$cardId/controls'),
        body: jsonEncode(controls),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Error updating card controls: $e');
      return false;
    }
  }
}
