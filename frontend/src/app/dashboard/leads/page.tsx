'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Filter, ExternalLink, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';

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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { token, logout } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch(`${apiUrl}/leads/`, { headers });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            logout();
            return;
          }
          throw new Error('Failed to fetch leads');
        }

        const data = await res.json();
        setLeads(data);
      } catch (err) {
        console.error('Failed to fetch leads', err);
        setError('Could not connect to the backend server.');
      } finally {
        setLoading(false);
      }
    };
    if (apiUrl && token) fetchLeads();
  }, [apiUrl, token, logout]);

  const filteredLeads = leads.filter(lead => 
    (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     lead.company?.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/[0.03] rounded-lg transition-colors text-white/30 md:hidden">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Leads</h1>
              <p className="text-sm text-white/30 mt-0.5">Manage and track your potential customers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-2 hidden md:block">
              <p className="text-[10px] font-medium text-white/20 uppercase tracking-wider">Total</p>
              <p className="text-sm font-semibold text-indigo-400">{filteredLeads.length} Leads</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="pl-9 pr-4 py-2 bg-black/40 border border-white/5 rounded-lg text-sm text-white outline-none focus:border-indigo-500/30 transition-all w-56 placeholder:text-white/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 bg-black/40 border border-white/5 rounded-lg text-white/30 hover:text-white/60 hover:border-white/10 transition-all">
              <Filter size={16} />
            </button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-medium text-white/30 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-medium text-white/30 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-4 text-[10px] font-medium text-white/30 uppercase tracking-wider">Intent</th>
                    <th className="px-6 py-4 text-[10px] font-medium text-white/30 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-medium text-white/30 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-white/20 text-sm font-medium">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center">
                            <Users size={24} className="text-white/10" />
                          </div>
                          {searchTerm ? 'No leads match your search.' : 'No leads found yet.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs">
                              {lead.name?.[0] || 'A'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{lead.name || 'Anonymous'}</span>
                              <span className="text-xs text-white/30">{lead.company || 'Personal'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <a href={`mailto:${lead.email}`} className="text-sm font-medium text-white/60 hover:text-indigo-400 transition-colors">{lead.email}</a>
                            <span className="text-xs text-white/20">{lead.phone || 'No phone'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs text-white/40 capitalize">{lead.intent?.replace('_', ' ') || 'General Inquiry'}</span>
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
