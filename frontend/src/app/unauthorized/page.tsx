'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col justify-center items-center px-4">
      <div className="bg-white/[0.03] border border-white/5 p-8 rounded-2xl max-w-md w-full text-center">
        <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/10">
          <ShieldAlert className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-sm text-white/40 mb-8">
          You do not have the necessary permissions to access this page. This area is restricted to administrators only.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-medium hover:shadow-indigo-500/20 transition-all"
          >
            Go to Homepage
          </Link>
          <Link
            href="/login"
            className="block w-full py-3 px-4 border border-white/5 text-white/50 rounded-xl font-medium hover:bg-white/5 transition-all"
          >
            Login with different account
          </Link>
        </div>
      </div>
    </div>
  );
}
