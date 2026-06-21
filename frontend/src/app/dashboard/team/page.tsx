'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, Trash2, Clock, X, Check, MoreVertical } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';

interface TeamMember {
  id: number;
  email: string;
  full_name?: string;
  role: string;
  created_at: string;
}

interface Invitation {
  id: number;
  email: string;
  role: string;
  token: string;
  created_at: string;
  is_used: boolean;
}

export default function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [isInviting, setIsInviting] = useState(false);
  
  const { token, logout, user } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, invitesRes] = await Promise.all([
        fetch(`${apiUrl}/team/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/team/invites`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!membersRes.ok || !invitesRes.ok) {
        if (membersRes.status === 401 || membersRes.status === 403) {
          logout();
          return;
        }
        throw new Error('Failed to fetch team data');
      }

      const membersData = await membersRes.json();
      const invitesData = await invitesRes.json();
      
      setMembers(membersData);
      setInvites(invitesData);
    } catch (err) {
      console.error(err);
      setError('Could not load team members. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiUrl && token) fetchData();
  }, [apiUrl, token]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const res = await fetch(`${apiUrl}/team/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to send invitation');
      }

      setIsInviteModalOpen(false);
      setInviteEmail('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (id: number) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      const res = await fetch(`${apiUrl}/team/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to remove member');
      }

      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevokeInvite = async (id: number) => {
    if (!confirm('Revoke this invitation?')) return;
    
    try {
      const res = await fetch(`${apiUrl}/team/invites/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to revoke invitation');

      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRoleUpdate = async (id: number, newRole: string) => {
    try {
      const res = await fetch(`${apiUrl}/team/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isOwner = user?.role === 'owner';

  return (
    <div className="flex h-screen bg-[#0a0a0f] font-sans text-white">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/5 p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Team</h1>
            <p className="text-sm text-white/30 mt-0.5">Manage your organization's administrators and staff</p>
          </div>
          <div className="flex items-center gap-3">
            {isOwner && (
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:shadow-indigo-500/20 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <UserPlus size={18} />
                Invite Member
              </button>
            )}
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/10 text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3">
              <X size={18} />
              {error}
            </div>
          )}

          {/* Members Table */}
          <section className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border border-white/5">
                  <Users size={16} className="text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white">Team Members</h3>
              </div>
              <div className="text-xs font-medium text-white/30 uppercase tracking-wider">{members.length} Members</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Name & Email</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Joined Date</th>
                    {isOwner && <th className="px-6 py-4 text-[11px] font-semibold text-white/30 uppercase tracking-widest text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={isOwner ? 4 : 3} className="px-6 py-20 text-center text-white/20 text-sm font-medium">Loading team data...</td>
                    </tr>
                  ) : members.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-indigo-400 font-bold border border-white/5">
                            {member.full_name?.[0] || member.email[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">{member.full_name || 'Team Member'}</span>
                            <span className="text-xs text-white/30">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isOwner && String(member.id) !== String(user?.id) ? (
                          <select 
                            value={member.role}
                            onChange={(e) => handleRoleUpdate(member.id, e.target.value)}
                            className="text-[10px] font-semibold uppercase tracking-wider bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 focus:border-indigo-500/30 transition-all cursor-pointer text-white/70 outline-none"
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            member.role === 'owner' ? 'bg-indigo-500/10 text-indigo-300' : 
                            member.role === 'admin' ? 'bg-amber-500/10 text-amber-300' :
                            'bg-white/5 text-white/50'
                          }`}>
                            {member.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-white/30">
                        {new Date(member.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      {isOwner && (
                        <td className="px-6 py-4 text-right">
                          {String(member.id) !== String(user?.id) && (
                            <button 
                              onClick={() => handleRemoveMember(member.id)}
                              className="w-8 h-8 rounded-lg bg-white/5 text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center ml-auto"
                              title="Remove Member"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pending Invitations */}
          {invites.length > 0 && (
            <section className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-amber-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-white/5">
                    <Clock size={16} className="text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-white">Pending Invitations</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Email</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-white/30 uppercase tracking-widest">Sent At</th>
                      {isOwner && <th className="px-6 py-4 text-[11px] font-semibold text-white/30 uppercase tracking-widest text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invites.map((invite) => (
                      <tr key={invite.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-white">{invite.email}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/5 text-white/50 px-2 py-1 rounded-lg">
                            {invite.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-white/30">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </td>
                        {isOwner && (
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleRevokeInvite(invite.id)}
                              className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-3 py-1 bg-red-500/10 rounded-lg"
                            >
                              Revoke
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/5 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">Invite Team Member</h3>
                <p className="text-xs text-white/30 mt-0.5">Send a secure invite link</p>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-2 text-white/30 hover:bg-white/5 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/30 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input 
                    type="email" 
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl focus:border-indigo-500/30 font-medium text-white outline-none transition-all placeholder:text-white/20"
                    placeholder="sami@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/30 uppercase tracking-widest px-1">Role Permission</label>
                <div className="grid grid-cols-2 gap-2">
                  {['admin', 'staff'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setInviteRole(role)}
                      className={`py-3 rounded-xl font-medium text-sm border transition-all ${
                        inviteRole === role 
                          ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' 
                          : 'border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10'
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/50 font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isInviting}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:shadow-indigo-500/20 text-white font-medium rounded-xl transition-all shadow-lg flex items-center justify-center"
                >
                  {isInviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
