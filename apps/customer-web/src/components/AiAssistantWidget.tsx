import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Bot } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import api from '../api/client';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
};

export default function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'bot',
      text: 'Hello! I\'m Aegis AI 👋\n\nI can help you with your finances — check balances, analyze spending, or find transactions.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [financialContext, setFinancialContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch financial context when widget opens (or mount)
  useEffect(() => {
    async function fetchContext() {
      try {
        const [accRes, txRes] = await Promise.all([
          api.get('/api/v1/core/accounts'),
          api.get('/api/v1/core/transactions')
        ]);
        const data = {
          accounts: accRes.data,
          transactions: txRes.data,
        };
        setFinancialContext(JSON.stringify(data));
      } catch (error) {
        console.error('Failed to fetch financial context for AI', error);
        setFinancialContext('No context available');
      }
    }
    
    if (isOpen && !financialContext) {
      fetchContext();
    }
  }, [isOpen, financialContext]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        throw new Error('API key not found');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.1-pro', 'gemini-2.5-pro', 'gemini-1.5-pro'];
      const prompt = `You are Aegis AI, a helpful AI financial assistant for Aegis Finance. You are talking to the user. Here is the user's financial context in JSON format: ${financialContext}. The user asks: ${userMessage.text}. Provide a short, friendly, and helpful response. Do not expose the raw JSON to the user. Keep it brief and conversational. If the context does not have the answer, just say so.`;
      
      let responseText = null;

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          responseText = result.response.text();
          if (responseText) {
            break;
          }
        } catch (err) {
          console.warn(`Model ${modelName} failed, falling back to next...`, err);
        }
      }

      if (!responseText) {
        throw new Error('All Gemini models failed to generate a response');
      }
      
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'bot', text: responseText }]);
    } catch (error) {
      setMessages((prev) => [...prev, { 
        id: Date.now().toString(), 
        sender: 'bot', 
        text: 'I encountered an error. Please make sure VITE_GEMINI_API_KEY is set in your .env file.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    '📊 Spending summary',
    '💸 Last transaction',
    '💡 Savings tips',
    '💳 Total balance'
  ];

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-2xl shadow-blue-500/20 transition-transform hover:scale-110 active:scale-95"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[80vh] w-[400px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1530]/95 text-white shadow-2xl backdrop-blur-xl transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-inner shadow-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold leading-tight">Aegis AI</h3>
                <p className="text-[11px] text-emerald-400">Online &bull; Context Aware</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex gap-2 overflow-x-auto border-b border-white/5 p-3 scrollbar-none">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim())} // strip emoji for query
                className="whitespace-nowrap rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-tr-sm'
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
                  } whitespace-pre-wrap`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl bg-white/5 border border-white/10 p-3 rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Aegis AI..."
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition"
              />
              <button
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
