'use client';

import { useState, useEffect } from 'react';
import { Users, MessageSquare, LayoutDashboard, ExternalLink, LogOut, Settings, TrendingUp, Zap, Clock, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';

interface Stats {
  total_leads: number;
  total_chats: number;
  new_leads: number;
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

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, logout, user } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const [leadsRes, statsRes] = await Promise.all([
          fetch(`${apiUrl}/leads/`, { headers }),
          fetch(`${apiUrl}/business/stats`, { headers })
        ]);

        if (!leadsRes.ok || !statsRes.ok) {
          if (leadsRes.status === 401 || leadsRes.status === 403) {
            logout();
            return;
          }
          throw new Error('Failed to fetch dashboard data');
        }

        const leadsData = await leadsRes.json();
        const statsData = await statsRes.json();
        
        setLeads(leadsData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to fetch leads', err);
        setError('Could not connect to the backend server.');
      } finally {
        setLoading(false);
      }
    };
    if (apiUrl && token) fetchData();
  }, [apiUrl, token, logout]);

  if (loading) return (
    <div className="flex h-screen bg-[#0a0a0f] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-400" size={32} />
        <p className="text-white/30 text-sm font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] font-sans text-white overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/5 p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Overview</h1>
            <p className="text-sm text-white/30 mt-0.5">Welcome back, {user?.full_name || 'Admin'}</p>
          </div>
          <div className="flex items-center gap-3">
            {error && <span className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-xs font-medium border border-red-500/10">{error}</span>}
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg text-xs font-medium border border-emerald-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Leads', value: stats?.total_leads || 0, icon: Users, gradient: 'from-indigo-500 to-violet-500' },
              { label: 'Total Chats', value: stats?.total_chats || 0, icon: MessageSquare, gradient: 'from-emerald-500 to-teal-500' },
              { label: 'Pending Actions', value: stats?.new_leads || 0, icon: Zap, gradient: 'from-amber-500 to-orange-500' },
            ].map((card, i) => (
              <div key={i} className="relative bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 group overflow-hidden">
                <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} p-[1px] mb-4`}>
                  <div className="w-full h-full rounded-xl bg-[#0a0a0f] flex items-center justify-center group-hover:bg-transparent transition-all duration-500">
                    <card.icon size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-xs font-medium text-white/30 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{card.value}</h3>
              </div>
            ))}
          </div>

          {/* Recent Leads Table */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Recent Leads</h3>
                <p className="text-sm text-white/30 mt-0.5">The most recent interactions from your widget</p>
              </div>
              <Link href="/dashboard/leads" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-medium text-white/30 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-medium text-white/30 uppercase tracking-wider">Intent</th>
                    <th className="px-6 py-4 text-[10px] font-medium text-white/30 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-medium text-white/30 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-white/20 text-sm font-medium">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center">
                            <Users size={24} className="text-white/10" />
                          </div>
                          No leads found yet. Start by embedding your widget!
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leads.slice(0, 5).map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs">
                              {lead.name?.[0] || 'A'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{lead.name || 'Anonymous'}</span>
                              <span className="text-xs text-indigo-400/60">{lead.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs text-white/40">{lead.intent?.replace('_', ' ') || 'General Inquiry'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider ${
                            lead.status === 'new' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/10' : 
                            lead.status === 'contacted' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/10' :
                            'bg-emerald-500/10 text-emerald-300 border border-emerald-500/10'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              lead.status === 'new' ? 'bg-indigo-400' : 
                              lead.status === 'contacted' ? 'bg-amber-400' :
                              'bg-emerald-400'
                            }`} />
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/dashboard/leads/${lead.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] text-white/30 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all border border-white/5"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
