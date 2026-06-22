'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const pc = config?.primary_color || '#4F46E5';
  const bc = config?.button_color || pc;
  const hc = config?.header_color || pc;
  const tc = config?.text_color || '#FFFFFF';
  const bg = config?.background_color || '#F9FAFB';
  const bizName = config?.business_name || 'Assistant';
  const agentName = config?.employee_name || 'AI';
  const initial = bizName.charAt(0).toUpperCase();
  const welcomeMsg = config?.welcome_message || 'Hello! How can I help you today?';
  const logoUrl = config?.logo_url;

  function Avatar({ src, fallback, size = 32 }: { src?: string; fallback: string; size?: number }) {
    return (
      <div
        className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold"
        style={{ width: size, height: size, fontSize: size * 0.45, backgroundColor: pc, minWidth: size }}
      >
        {src ? (
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          fallback
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: bg }}>
      <style>{`
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .msg-anim {
          animation: messageIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .dot { animation: dotPulse 1.4s ease-in-out infinite both; }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.16s; }
        .dot:nth-child(3) { animation-delay: 0.32s; }
      `}</style>

      <header
        className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ backgroundColor: hc, color: tc }}
      >
        <Avatar src={logoUrl} fallback={initial} size={36} />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm leading-tight truncate">{bizName}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="text-xs font-medium" style={{ opacity: 0.85 }}>{agentName} is Online</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ backgroundColor: bg }}>
        <div className="flex items-start gap-2.5 msg-anim">
          <Avatar src={logoUrl} fallback={initial} size={30} />
          <div
            className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm border"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#374151',
              borderColor: 'rgba(0,0,0,0.06)'
            }}
          >
            {welcomeMsg}
          </div>
        </div>

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 msg-anim ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            style={{ animationDelay: '0s' }}
          >
            {msg.role === 'assistant' && (
              <Avatar src={logoUrl} fallback={initial} size={30} />
            )}
            {msg.role === 'user' && (
              <div
                className="w-[30px] h-[30px] rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: pc, minWidth: 30 }}
              >
                <User size={14} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-tr-sm text-white'
                  : 'rounded-tl-sm shadow-sm border'
              }`}
              style={
                msg.role === 'user'
                  ? { backgroundColor: pc, color: '#FFFFFF' }
                  : { backgroundColor: '#FFFFFF', color: '#374151', borderColor: 'rgba(0,0,0,0.06)' }
              }
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className="text-[10px] mt-1.5 font-medium"
                style={{ opacity: 0.6, color: msg.role === 'user' ? '#FFFFFF' : '#6B7280' }}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5 msg-anim">
            <Avatar src={logoUrl} fallback={initial} size={30} />
            <div
              className="px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm border"
              style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.06)' }}
            >
              <div className="flex gap-1.5 items-center" style={{ height: 20 }}>
                <div className="dot w-2 h-2 rounded-full" style={{ backgroundColor: pc }} />
                <div className="dot w-2 h-2 rounded-full" style={{ backgroundColor: pc }} />
                <div className="dot w-2 h-2 rounded-full" style={{ backgroundColor: pc }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 px-4 py-3 border-t" style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="w-full h-11 rounded-xl px-4 pr-12 text-sm outline-none transition-all placeholder:font-medium"
            style={{
              backgroundColor: bg,
              color: '#374151',
              border: '1px solid rgba(0,0,0,0.08)'
            }}
            onFocus={(e) => { e.target.style.borderColor = pc; e.target.style.boxShadow = `0 0 0 3px ${pc}1A`; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.08)'; e.target.style.boxShadow = 'none'; }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: bc }}
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[9px] text-center font-medium mt-2 tracking-wider uppercase" style={{ color: '#D1D5DB' }}>Powered by Syntrix AI</p>
      </div>
    </div>
  );
}
