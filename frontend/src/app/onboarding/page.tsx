'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { 
  Building2, 
  Bot, 
  MessageSquare, 
  ChevronRight, 
  Sparkles,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    employee_name: '',
    welcome_message: 'Hello! I am your AI assistant. How can I help you today?'
  });
  
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const res = await fetch(`${apiUrl}/business/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || '',
            employee_name: data.employee_name || '',
            welcome_message: data.welcome_message || 'Hello! I am your AI assistant. How can I help you today?'
          });
          
          if (data.onboarding_completed) {
            router.push('/dashboard');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) checkOnboarding();
  }, [token, router, apiUrl]);

  const handleNext = () => setStep(step + 1);
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/business/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          onboarding_completed: true
        })
      });

      if (res.ok) {
        setStep(4);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        throw new Error('Onboarding failed');
      }
    } catch (err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-xl">
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20">
          
          <div className="h-1 w-full bg-white/5">
            <div className={`h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ${
              step === 1 ? 'w-1/4' : step === 2 ? 'w-2/4' : step === 3 ? 'w-3/4' : 'w-full'
            }`} />
          </div>

          <div className="p-12 sm:p-14">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border border-white/5">
                  <Building2 size={28} className="text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-2">What&apos;s your business called?</h1>
                  <p className="text-sm text-white/40">This will be shown as the header of your chat widget.</p>
                </div>
                <input 
                  type="text"
                  autoFocus
                  placeholder="e.g. Sami's Agency"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 bg-black/40 border border-white/5 focus:border-indigo-500/30 rounded-xl text-base font-medium outline-none transition-all placeholder:text-white/20"
                />
                <button 
                  disabled={!formData.name}
                  onClick={handleNext}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-40 text-white rounded-xl font-semibold text-base shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  Continue
                  <ChevronRight className="group-hover:translate-x-0.5 transition-transform" size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border border-white/5">
                  <Bot size={28} className="text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-2">Name your AI Employee</h1>
                  <p className="text-sm text-white/40">Give your Syntrix AI assistant a personality.</p>
                </div>
                <input 
                  type="text"
                  autoFocus
                  placeholder="e.g. Aria, Max, Support Bot"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({...formData, employee_name: e.target.value})}
                  className="w-full px-5 py-4 bg-black/40 border border-white/5 focus:border-indigo-500/30 rounded-xl text-base font-medium outline-none transition-all placeholder:text-white/20"
                />
                <div className="flex gap-4 pt-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/[0.03] border border-white/5 text-white/50 rounded-xl font-medium hover:bg-white/[0.06] transition-all">Back</button>
                  <button 
                    disabled={!formData.employee_name}
                    onClick={handleNext}
                    className="flex-[2] py-4 bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-40 text-white rounded-xl font-semibold text-base shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    Almost there
                    <ChevronRight className="group-hover:translate-x-0.5 transition-transform" size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border border-white/5">
                  <MessageSquare size={28} className="text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-2">Set a welcome message</h1>
                  <p className="text-sm text-white/40">What&apos;s the first thing your customers should see?</p>
                </div>
                <textarea 
                  rows={4}
                  autoFocus
                  value={formData.welcome_message}
                  onChange={(e) => setFormData({...formData, welcome_message: e.target.value})}
                  className="w-full px-5 py-4 bg-black/40 border border-white/5 focus:border-indigo-500/30 rounded-xl text-base font-medium outline-none transition-all resize-none"
                />
                <div className="flex gap-4 pt-2">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 bg-white/[0.03] border border-white/5 text-white/50 rounded-xl font-medium hover:bg-white/[0.06] transition-all">Back</button>
                  <button 
                    disabled={!formData.welcome_message || loading}
                    onClick={handleSubmit}
                    className="flex-[2] py-4 bg-gradient-to-r from-indigo-500 to-violet-500 disabled:opacity-40 text-white rounded-xl font-semibold text-base shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><Sparkles size={18} /> Finish Setup</>}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-10 space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 flex items-center justify-center mx-auto border border-emerald-400/10">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-2">Setup Complete!</h1>
                  <p className="text-sm text-white/40">Taking you to your new AI dashboard...</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-indigo-400 text-sm font-medium">
                  <Loader2 className="animate-spin" size={16} />
                  Initializing workspace
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-white/20 hover:text-white/40 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
