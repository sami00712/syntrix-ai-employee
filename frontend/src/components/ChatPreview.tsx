'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Send, Bot, Loader2, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPreviewProps {
  businessName: string;
  agentName: string;
  welcomeMessage: string;
  primaryColor: string;
  buttonColor?: string;
  headerColor?: string;
  textColor?: string;
  backgroundColor?: string;
  widgetIcon?: string;
  systemPrompt?: string;
  logoUrl?: string;
}

export default function ChatPreview({ 
  businessName, 
  agentName, 
  welcomeMessage, 
  primaryColor,
  buttonColor = '#4F46E5',
  headerColor = '#4F46E5',
  textColor = '#FFFFFF',
  backgroundColor = '#FFFFFF',
  widgetIcon = 'bot',
  systemPrompt,
  logoUrl
}: ChatPreviewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setMessages([]);
    setSessionId(null);
  }, [welcomeMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const initSession = async () => {
    try {
      const res = await fetch(`${apiUrl}/chat/session`, { method: 'POST' });
      const data = await res.json();
      setSessionId(data.id);
      return data.id;
    } catch (err) {
      console.error('Failed to init session', err);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await initSession();
      }

      if (!currentSessionId) throw new Error('No session');

      const res = await fetch(`${apiUrl}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: userMsg,
          system_prompt: systemPrompt
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[380px] h-[600px] mx-auto">
      {/* Floating Button with Preview Label */}
      <div className="absolute -bottom-2 right-4 flex flex-col items-end z-20">
        <span className="text-[9px] font-medium text-white/40 uppercase tracking-wider bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10 mb-2 whitespace-nowrap">
          Button Preview
        </span>
        <div
          className="w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform shadow-black/20"
          style={{ backgroundColor: buttonColor }}
        >
          {widgetIcon === 'bot' ? <Bot size={28} /> : <MessageSquare size={28} />}
        </div>
      </div>

      <div className="w-full h-[550px] bg-[#111118] rounded-[2rem] border border-white/5 shadow-2xl shadow-black/20 overflow-hidden flex flex-col relative z-10">
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ backgroundColor: headerColor, color: textColor }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0 backdrop-blur-sm">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              businessName?.[0] || 'A'
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold leading-none">{businessName || 'Your Business'}</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[9px] font-medium uppercase tracking-wider opacity-70">{agentName || 'Assistant'} is Online</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 p-5 space-y-4 overflow-y-auto scroll-smooth"
          style={{ backgroundColor }}
        >
          {/* Welcome Message */}
          <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                agentName?.[0] || 'A'
              )}
            </div>
            <div className="max-w-[80%] bg-black/20 backdrop-blur-sm p-3.5 rounded-2xl rounded-tl-none border border-white/5 text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
              {welcomeMessage}
            </div>
          </div>

          {/* Dynamic Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'items-start'} gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden ${
                  msg.role === 'user' ? 'bg-white/10' : ''
                }`}
                style={msg.role === 'assistant' ? { backgroundColor: primaryColor } : {}}
              >
                {msg.role === 'user' ? (
                  <User size={12} />
                ) : (
                  logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    agentName?.[0] || 'A'
                  )
                )}
              </div>
              <div className={`max-w-[80%] p-3.5 rounded-2xl shadow-sm border text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-tr-none border-indigo-400/20'
                  : 'bg-black/20 backdrop-blur-sm text-white/80 rounded-tl-none border-white/5'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3 animate-pulse">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden"
                style={{ backgroundColor: primaryColor }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  agentName?.[0] || 'A'
                )}
              </div>
              <div className="bg-black/20 backdrop-blur-sm p-3.5 rounded-2xl rounded-tl-none border border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-5 bg-black/20 backdrop-blur-sm border-t border-white/5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="w-full h-11 bg-black/20 border border-white/5 rounded-xl px-4 pr-12 text-sm text-white outline-none focus:border-indigo-500/30 transition-all placeholder:text-white/20"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-1.5 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg transition-all active:scale-95 disabled:opacity-30"
              style={{ backgroundColor: primaryColor }}
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-[8px] text-center text-white/10 uppercase tracking-widest mt-3 font-medium">Powered by Syntrix AI</p>
        </div>
      </div>
    </div>
  );
}
