import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../services/api_service.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

class AiAssistantScreen extends StatefulWidget {
  const AiAssistantScreen({super.key});

  @override
  State<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends State<AiAssistantScreen> {
  final List<Map<String, dynamic>> _messages = [
    {'sender': 'bot', 'text': 'Hello! I\'m Aegis AI 👋\n\nI can help you with your finances — check balances, analyze spending, freeze cards, or find transactions.'},
  ];
  final _controller = TextEditingController();
  bool _isTyping = false;
  final ScrollController _scrollController = ScrollController();
  String? _financialContext;

  @override
  void initState() {
    super.initState();
    _fetchContext();
  }

  Future<void> _fetchContext() async {
    try {
      final data = await ApiService().getDashboardData();
      _financialContext = jsonEncode(data);
    } catch (e) {
      _financialContext = "No context available";
    }
  }

  void _sendMessage() async {
    if (_controller.text.trim().isEmpty) return;
    final userText = _controller.text.trim();
    _controller.clear();

    setState(() {
      _messages.add({'sender': 'user', 'text': userText});
      _isTyping = true;
    });
    _scrollToBottom();

    try {
      final apiKey = dotenv.env['GEMINI_API_KEY'];
      if (apiKey == null) {
        throw Exception('API key not found');
      }
      final modelsToTry = ['gemini-3.6-flash', 'gemini-3.1-pro', 'gemini-2.5-pro', 'gemini-1.5-pro'];
      final prompt = 'You are Aegis AI, a helpful AI financial assistant for Aegis Finance. You are talking to the user. Here is the user\'s financial context in JSON format: $_financialContext. The user asks: $userText. Provide a short, friendly, and helpful response. Do not expose the raw JSON to the user. Keep it brief and conversational. If the context does not have the answer, just say so.';
      final content = [Content.text(prompt)];
      
      GenerateContentResponse? response;
      for (final modelName in modelsToTry) {
        try {
          final model = GenerativeModel(model: modelName, apiKey: apiKey);
          response = await model.generateContent(content);
          if (response.text != null && response.text!.trim().isNotEmpty) {
            break;
          }
        } catch (e) {
          print('Model $modelName failed, falling back to next... Error: $e');
        }
      }

      if (response == null || response.text == null || response.text!.trim().isEmpty) {
        throw Exception('All Gemini models failed to generate a response');
      }
      
      if (mounted) {
        setState(() {
          _isTyping = false;
          _messages.add({'sender': 'bot', 'text': response!.text!.trim()});
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isTyping = false;
          _messages.add({'sender': 'bot', 'text': 'I encountered an error. Please make sure GEMINI_API_KEY is set in your .env file.'});
        });
        _scrollToBottom();
      }
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070B18),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1530),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF4178F4), Color(0xFF9A62ED)]),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
            Text('Aegis AI', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            Text('Online', style: TextStyle(color: Colors.greenAccent, fontSize: 11)),
          ]),
        ]),
      ),
      body: Stack(children: [
        Positioned.fill(
          child: Image.asset(
            'assets/secure-card-hero.png',
            fit: BoxFit.cover,
            alignment: Alignment.bottomCenter,
            opacity: const AlwaysStoppedAnimation(0.08),
          ),
        ),
        Column(children: [
        // Quick Prompts
        Container(
          color: const Color(0xFF0D1530),
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(children: [
              _buildChip('📊 Spending summary'),
              _buildChip('🔒 Freeze my card'),
              _buildChip('💸 Last transaction'),
              _buildChip('💡 Savings tips'),
            ]),
          ),
        ),
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: _messages.length + (_isTyping ? 1 : 0),
            itemBuilder: (context, index) {
              if (_isTyping && index == _messages.length) return _buildTypingIndicator();
              final msg = _messages[index];
              final isUser = msg['sender'] == 'user';
              return _buildMessage(msg['text'], isUser);
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
          decoration: BoxDecoration(
            color: const Color(0xFF0D1530),
            border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
          ),
          child: Row(children: [
            Expanded(
              child: TextField(
                controller: _controller,
                style: const TextStyle(color: Colors.white),
                onSubmitted: (_) => _sendMessage(),
                decoration: InputDecoration(
                  hintText: 'Ask Aegis AI...',
                  hintStyle: const TextStyle(color: Colors.white38),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.06),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                ),
              ),
            ),
            const SizedBox(width: 10),
            GestureDetector(
              onTap: _sendMessage,
              child: Container(
                width: 46, height: 46,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF4178F4), Color(0xFF9A62ED)]),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
              ),
            ),
          ]),
        ),
        ]),
      ]),
    );
  }

  Widget _buildChip(String label) {
    return GestureDetector(
      onTap: () {
        _controller.text = label.replaceAll(RegExp(r'[^\w\s]'), '').trim();
        _sendMessage();
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: const Color(0xFF4178F4).withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF4178F4).withOpacity(0.3)),
        ),
        child: Text(label, style: const TextStyle(color: Color(0xFF4178F4), fontSize: 12, fontWeight: FontWeight.w500)),
      ),
    );
  }

  Widget _buildMessage(String text, bool isUser) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: isUser
            ? const LinearGradient(colors: [Color(0xFF4178F4), Color(0xFF9A62ED)])
            : null,
          color: isUser ? null : Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: isUser ? const Radius.circular(18) : const Radius.circular(4),
            bottomRight: isUser ? const Radius.circular(4) : const Radius.circular(18),
          ),
          border: isUser ? null : Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: isUser 
            ? Text(text, style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.5))
            : MarkdownBody(
                data: text,
                styleSheet: MarkdownStyleSheet(
                  p: const TextStyle(color: Colors.white, fontSize: 14, height: 1.5),
                  listBullet: const TextStyle(color: Colors.white),
                  strong: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(18), topRight: Radius.circular(18),
            bottomLeft: Radius.circular(4), bottomRight: Radius.circular(18),
          ),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: const [
          _TypingDot(delay: 0),
          SizedBox(width: 4),
          _TypingDot(delay: 200),
          SizedBox(width: 4),
          _TypingDot(delay: 400),
        ]),
      ),
    );
  }
}

class _TypingDot extends StatefulWidget {
  final int delay;
  const _TypingDot({required this.delay});

  @override
  State<_TypingDot> createState() => _TypingDotState();
}

class _TypingDotState extends State<_TypingDot> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    Future.delayed(Duration(milliseconds: widget.delay), () {
      if (mounted) _ctrl.repeat(reverse: true);
    });
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) => Transform.translate(
        offset: Offset(0, -4 * _ctrl.value),
        child: Container(
          width: 8, height: 8,
          decoration: const BoxDecoration(color: Colors.white54, shape: BoxShape.circle),
        ),
      ),
    );
  }
}
