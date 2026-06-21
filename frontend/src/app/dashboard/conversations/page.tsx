'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Clock, User, ChevronRight, Loader2, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';

interface Session {
  id: number;
  lead_id?: number;
  created_at: string;
}

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token, logout } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${apiUrl}/chat/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          if (res.status === 401) logout();
          throw new Error('Failed to fetch sessions');
        }
        const data = await res.json();
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (apiUrl && token) fetchSessions();
  }, [apiUrl, token, logout]);

  const filteredSessions = sessions.filter(s => 
    s.id.toString().includes(searchTerm)
  );

  if (loading) return (
    <div className="flex h-screen bg-[#0a0a0f] items-center justify-center">
      <Loader2 className="animate-spin text-indigo-400" size={32} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/5 p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Conversations</h1>
            <p className="text-sm text-white/30 mt-0.5">Monitor real-time interactions with your AI</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input 
                type="text" 
                placeholder="Search session ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-black/40 border border-white/5 rounded-lg text-sm text-white outline-none focus:border-indigo-500/30 transition-all w-56 placeholder:text-white/20"
              />
            </div>
            <button className="p-2 bg-black/40 border border-white/5 rounded-lg text-white/30 hover:text-white/60 hover:border-white/10 transition-all">
              <Filter size={16} />
            </button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
          <div className="grid grid-cols-1 gap-4">
            {filteredSessions.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-16 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto">
                  <MessageSquare size={28} className="text-white/10" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white/60">No active conversations</h3>
                  <p className="text-sm text-white/20">When users interact with your widget, they will appear here.</p>
                </div>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/5">
                      <MessageSquare size={22} className="text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-white">Session #{session.id}</h3>
                        {session.lead_id && (
                          <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-lg text-[9px] font-medium uppercase tracking-wider border border-emerald-500/10">
                            Linked to Lead
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 text-white/30 text-xs">
                          <Clock size={12} />
                          {new Date(session.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href={session.lead_id ? `/dashboard/leads/${session.lead_id}` : '#'}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                      session.lead_id 
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:translate-x-0.5' 
                        : 'bg-white/[0.03] text-white/20 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    View Details
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
