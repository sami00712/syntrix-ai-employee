'use client';

import { LayoutDashboard, Settings, Users, LogOut, MessageSquare, ArrowLeft, Bot } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

export default function DashboardSidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads', href: '/dashboard/leads', icon: Users },
    { label: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-[#0a0a0f] border-r border-white/5 hidden md:flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Bot size={18} className="text-white" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">Syntrix<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">AI</span></h2>
        </Link>
      </div>

      <div className="px-4 mb-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white/30 hover:text-white/60 transition-colors group rounded-lg hover:bg-white/[0.03]"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-white border border-indigo-500/10'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/50'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">{user?.role || 'staff'}</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
