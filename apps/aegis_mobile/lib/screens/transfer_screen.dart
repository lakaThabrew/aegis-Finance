import 'package:flutter/material.dart';
import '../widgets/aegis_ui.dart';
import '../services/api_service.dart';

class TransferScreen extends StatefulWidget {
  const TransferScreen({super.key});

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> {
  final _amountController = TextEditingController();
  bool _isProcessing = false;
  bool _isLoadingAccounts = true;
  String? _fromAccount;
  String? _fromAccountRaw;
  List<Map<String, dynamic>> _accounts = [];
  List<Map<String, dynamic>> _beneficiaries = [];
  String? _beneficiaryAccount;
  String _purpose = 'General transfer';

  @override
  void initState() {
    super.initState();
    _loadAccounts();
  }

  Future<void> _loadAccounts() async {
    final results = await Future.wait([ApiService().getDashboardData(), ApiService().getBeneficiaries()]);
    final data = results[0] as Map<String, dynamic>;
    final beneficiaries = results[1] as List<Map<String, dynamic>>;
    if (!mounted) return;
    setState(() {
      _accounts = List<Map<String, dynamic>>.from(data['accounts'] ?? []);
      if (_accounts.isNotEmpty) {
        _fromAccount = _accounts.first['number'];
        _fromAccountRaw = _accounts.first['rawNumber'];
      }
      _beneficiaries = beneficiaries;
      if (beneficiaries.isNotEmpty) _beneficiaryAccount = beneficiaries.first['beneficiaryAccountNumber']?.toString();
      _isLoadingAccounts = false;
    });
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _processTransfer() async {
    if (_fromAccountRaw == null || _beneficiaryAccount == null) return;
    
    double? amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter a valid amount')));
      return;
    }

    setState(() => _isProcessing = true);
    
    bool success = await ApiService().processTransfer(_fromAccountRaw!, _beneficiaryAccount!, amount);
    
    if (!mounted) return;
    setState(() => _isProcessing = false);
    
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Transfer successful!')));
      Navigator.pop(context, true); // Return true to signal refresh
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Transfer failed. Please try again.')));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: aegisBackground,
        appBar: AppBar(title: const Text('Send money', style: TextStyle(fontWeight: FontWeight.bold))),
        body: AegisScenicBackground(
          alignment: Alignment.topCenter,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Fast, protected transfers', style: TextStyle(color: Colors.white, fontSize: 25, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              const Text('Every payment is checked by Aegis security before it leaves your account.', style: TextStyle(color: Colors.white54, height: 1.4)),
              const SizedBox(height: 24),
              AegisSurface(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  _label('From account'),
                  if (_isLoadingAccounts)
                    const Center(child: CircularProgressIndicator())
                  else if (_accounts.isEmpty)
                    const Text('No accounts available', style: TextStyle(color: Colors.white))
                  else
                    _select(
                      value: _fromAccount!, 
                      icon: Icons.account_balance_wallet_outlined, 
                      options: _accounts.map((a) => a['number'] as String).toList(), 
                      onChanged: (v) {
                        setState(() {
                          _fromAccount = v!;
                          _fromAccountRaw = _accounts.firstWhere((a) => a['number'] == v)['rawNumber'];
                        });
                      }
                    ),
                  const SizedBox(height: 18),
                  _label('To beneficiary'),
                  if (_isLoadingAccounts)
                    const Center(child: CircularProgressIndicator())
                  else if (_beneficiaries.isEmpty)
                    const Text('Add a beneficiary in the web app before transferring.', style: TextStyle(color: Colors.white60))
                  else
                    _select(value: _beneficiaryAccount!, icon: Icons.person_outline_rounded, options: _beneficiaries.map((beneficiary) => beneficiary['beneficiaryAccountNumber'].toString()).toList(), onChanged: (v) => setState(() => _beneficiaryAccount = v!)),
                  if (_beneficiaryAccount != null)
                    Padding(padding: const EdgeInsets.only(top: 6), child: Text(_beneficiaries.firstWhere((beneficiary) => beneficiary['beneficiaryAccountNumber'].toString() == _beneficiaryAccount)['beneficiaryName'].toString(), style: const TextStyle(color: Colors.white54, fontSize: 12))),
                  const SizedBox(height: 18),
                  _label('Amount'),
                  TextField(
                    controller: _amountController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                    decoration: const InputDecoration(prefixIcon: Icon(Icons.payments_outlined, color: Color(0xFF8DA9FF)), suffixText: 'AED', suffixStyle: TextStyle(color: Colors.white54)),
                  ),
                  const SizedBox(height: 18),
                  _label('Purpose'),
                  _select(value: _purpose, icon: Icons.description_outlined, options: const ['General transfer', 'Rent', 'Bills'], onChanged: (v) => setState(() => _purpose = v!)),
                ]),
              ),
              const SizedBox(height: 16),
              AegisSurface(
                padding: const EdgeInsets.all(16),
                child: const Row(children: [
                  Icon(Icons.verified_user_outlined, color: Color(0xFF7EE5C3)),
                  SizedBox(width: 12),
                  Expanded(child: Text('Transaction fee', style: TextStyle(color: Colors.white60))),
                  Text('AED 0.00', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ]),
              ),
              const SizedBox(height: 24),
              _isProcessing 
                ? const Center(child: CircularProgressIndicator(color: aegisBlue)) 
                : AegisPrimaryButton(
                    label: 'Review transfer', 
                    icon: Icons.arrow_forward_rounded, 
                    onPressed: (_accounts.isEmpty || _beneficiaries.isEmpty || _isLoadingAccounts) ? () {} : _processTransfer
                  ),
            ]),
          ),
        ),
      );

  static Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(text, style: const TextStyle(color: Colors.white60, fontSize: 13, fontWeight: FontWeight.w600)),
      );

  static Widget _select({required String value, required IconData icon, required List<String> options, required ValueChanged<String?> onChanged}) => DropdownButtonFormField<String>(
        value: value,
        isExpanded: true,
        dropdownColor: const Color(0xFF141C37),
        iconEnabledColor: Colors.white54,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        decoration: InputDecoration(prefixIcon: Icon(icon, color: const Color(0xFF8DA9FF))),
        items: options.map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(),
        onChanged: onChanged,
      );
}
