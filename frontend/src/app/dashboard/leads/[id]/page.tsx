'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Building, Briefcase, Calendar, MessageCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';

interface Message {
  role: string;
  message: string;
  timestamp: string;
}

interface Session {
  id: number;
  created_at: string;
  conversations: Message[];
}

interface Lead {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  intent?: string;
  business_type?: string;
  requested_service?: string;
  status: string;
  created_at: string;
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('new');
  const [updating, setUpdating] = useState(false);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const { token, logout } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [leadRes, sessionsRes] = await Promise.all([
          fetch(`${apiUrl}/leads/${resolvedParams.id}`, { headers }),
          fetch(`${apiUrl}/leads/${resolvedParams.id}/sessions`, { headers })
        ]);
        if (!leadRes.ok) throw new Error('Failed to fetch lead');
        const leadData = await leadRes.json();
        setLead(leadData);
        setStatus(leadData.status);
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setSessions(Array.isArray(sessionsData) ? sessionsData : []);
        }
      } catch (err) {
        setError('Could not load lead details.');
      } finally {
        setLoading(false);
      }
    };
    if (apiUrl && token) fetchLead();
  }, [apiUrl, token, resolvedParams.id]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`${apiUrl}/leads/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setStatus(newStatus);
        if (lead) setLead({ ...lead, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-[#0a0a0f] items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full" />
    </div>
  );

  if (error || !lead) return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <DashboardSidebar />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-10 text-center max-w-md">
          <p className="text-white/40 text-sm">{error || 'Lead not found.'}</p>
          <Link href="/dashboard/leads" className="inline-block mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Back to Leads</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/5 p-6 flex items-center gap-4 sticky top-0 z-10">
          <Link href="/dashboard/leads" className="p-2 hover:bg-white/[0.03] rounded-lg transition-colors text-white/30">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{lead.name || 'Anonymous'}</h1>
            <p className="text-sm text-white/30">{lead.email}</p>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-6">Conversation History</h3>
              {sessions.length === 0 ? (
                <p className="text-white/20 text-sm text-center py-10">No conversations recorded.</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <MessageCircle size={16} className="text-indigo-400" />
                          <span className="text-sm font-medium">Session #{session.id}</span>
                          <span className="text-xs text-white/30">{new Date(session.created_at).toLocaleDateString()}</span>
                        </div>
                        <ChevronDown size={16} className={`text-white/30 transition-transform ${expandedSession === session.id ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSession === session.id && (
                        <div className="px-5 pb-4 space-y-3">
                          {session.conversations?.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-3.5 rounded-xl text-sm leading-relaxed ${
                                msg.role === 'user'
                                  ? 'bg-indigo-500/10 text-white border border-indigo-500/10'
                                  : 'bg-white/[0.03] text-white/70 border border-white/5'
                              }`}>
                                {msg.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
                <User size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold">{lead.name || 'Anonymous'}</h2>
              <p className="text-sm text-white/40 mt-1">{lead.email}</p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-white/20 mt-0.5" />
                <div>
                  <p className="text-[10px] text-white/20 font-medium uppercase tracking-wider">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-sm font-medium text-white/60 hover:text-indigo-400 transition-colors">{lead.email}</a>
                </div>
              </div>
              {lead.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-white/20 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-white/20 font-medium uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-medium text-white/60">{lead.phone}</p>
                  </div>
                </div>
              )}
              {lead.business_type && (
                <div className="flex items-start gap-3">
                  <Briefcase size={16} className="text-white/20 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-white/20 font-medium uppercase tracking-wider">Business Type</p>
                    <p className="text-sm font-medium text-white/60">{lead.business_type}</p>
                  </div>
                </div>
              )}
              {lead.requested_service && (
                <div className="flex items-start gap-3">
                  <Building size={16} className="text-white/20 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-white/20 font-medium uppercase tracking-wider">Service</p>
                    <p className="text-sm font-medium text-white/60">{lead.requested_service}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-white/20 mt-0.5" />
                <div>
                  <p className="text-[10px] text-white/20 font-medium uppercase tracking-wider">Created</p>
                  <p className="text-sm font-medium text-white/60">{new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
              <p className="text-[10px] text-white/20 font-medium uppercase tracking-wider mb-3">Status</p>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm font-medium text-white outline-none focus:border-indigo-500/30 transition-all disabled:opacity-40"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
              {updating && <p className="text-xs text-indigo-400/60 mt-2">Updating...</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
