'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function WidgetPage() {
  const { api_key } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [config, setConfig] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${apiUrl}/widget/config/${api_key}`);
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error('Failed to load widget config', err);
      }
    };
    if (api_key) fetchConfig();
  }, [api_key, apiUrl]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const sessionRes = await fetch(`${apiUrl}/widget/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key })
        });
        const sessionData = await sessionRes.json();
        currentSessionId = sessionData.id;
        setSessionId(currentSessionId);
      }
      const res = await fetch(`${apiUrl}/widget/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentSessionId, message: userMsg, api_key })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20">
        <div className="p-6 border-b border-white/5 flex items-center gap-3" style={{ backgroundColor: config?.header_color || '#4F46E5' }}>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm backdrop-blur-sm">
            {config?.name?.[0] || 'A'}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{config?.name || 'Syntrix AI'}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-white/70 font-medium uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>

        <div className="h-[400px] overflow-y-auto p-6 space-y-4" style={{ backgroundColor: config?.background_color || '#0a0a0f' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: config?.primary_color || '#4F46E5' }}>
              {config?.name?.[0] || 'A'}
            </div>
            <div className="max-w-[80%] bg-black/20 backdrop-blur-sm border border-white/5 p-4 rounded-2xl rounded-tl-none text-sm text-white/80 leading-relaxed">
              {config?.welcome_message || 'Hello! How can I help you today?'}
            </div>
          </div>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'items-start'} gap-3`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${msg.role === 'user' ? 'bg-white/10' : ''}`}
                style={msg.role === 'assistant' ? { backgroundColor: config?.primary_color || '#4F46E5' } : {}}>
                {msg.role === 'user' ? <User size={14} /> : config?.name?.[0] || 'A'}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl border text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-tr-none border-indigo-400/20'
                  : 'bg-black/20 backdrop-blur-sm text-white/80 rounded-tl-none border-white/5'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: config?.primary_color || '#4F46E5' }}>
                {config?.name?.[0] || 'A'}
              </div>
              <div className="bg-black/20 backdrop-blur-sm border border-white/5 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="w-full h-12 bg-black/20 border border-white/5 rounded-xl px-5 pr-14 text-sm text-white outline-none focus:border-indigo-500/30 transition-all placeholder:text-white/20"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-lg transition-all active:scale-95 disabled:opacity-30"
              style={{ backgroundColor: config?.button_color || config?.primary_color || '#4F46E5' }}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[8px] text-center text-white/10 uppercase tracking-widest mt-3 font-medium">Powered by Syntrix AI</p>
        </div>
      </div>
    </div>
  );
}
