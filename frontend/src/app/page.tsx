'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Zap, 
  Users, 
  MessageSquare, 
  Shield, 
  BarChart3, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  Menu,
  X,
  Star,
  ChevronLeft,
  MessageCircle,
  ThumbsUp,
  Loader2,
  Sparkles,
  Radio,
  Workflow,
  Globe
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, token, logout } = useAuth();
  const isLoggedIn = !!token && !!user;

  const features = [
    {
      title: "AI Chat Support",
      description: "Provide instant, 24/7 support to your customers with an AI that understands your business.",
      icon: MessageSquare,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Lead Capture",
      description: "Automatically extract and save lead information from conversations directly into your dashboard.",
      icon: Users,
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "Smart Memory",
      description: "Your AI remembers past interactions, providing a personalized experience for returning users.",
      icon: Zap,
      gradient: "from-amber-500 to-orange-500"
    },
    {
      title: "Business Analytics",
      description: "Track performance, conversation volume, and lead conversion rates with detailed reports.",
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      business: "E-commerce Store",
      text: "Syntrix AI has completely transformed how we handle customer inquiries. It captures leads while I sleep!",
      rating: 5
    },
    {
      name: "Marcus Chen",
      business: "Marketing Agency",
      text: "Integration was incredibly simple. Within 5 minutes, we had a custom AI trained on our specific service offerings.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      business: "Local Restaurant",
      text: "Our customers love the instant response. It handles reservations and basic questions perfectly without human intervention.",
      rating: 5
    },
    {
      name: "David Smith",
      business: "SaaS Startup",
      text: "Best decision for our support team. We've seen a 40% reduction in simple support tickets since deploying the widget.",
      rating: 4
    }
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedName, setFeedName] = useState('');
  const [feedBusiness, setFeedBusiness] = useState('');
  const [feedContent, setFeedContent] = useState('');
  const [feedRating, setFeedRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [apiTestimonials, setApiTestimonials] = useState<any[]>([]);
  const [feedSubmitted, setFeedSubmitted] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  useEffect(() => {
    if (!apiUrl) return;
    fetch(`${apiUrl}/feedback`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setApiTestimonials(data) })
      .catch(() => {});
  }, [apiUrl]);

  const handleFeedbackSubmit = async () => {
    if (!feedContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/feedback?user_name=${encodeURIComponent(feedName)}&business_name=${encodeURIComponent(feedBusiness)}&content=${encodeURIComponent(feedContent)}&rating=${feedRating}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApiTestimonials(prev => [data, ...prev]);
        setFeedSubmitted(true);
        setFeedName('');
        setFeedBusiness('');
        setFeedContent('');
        setFeedRating(5);
      } else if (res.status === 403) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const allTestimonials = [...apiTestimonials, ...testimonials];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-indigo-500/30 selection:text-white overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Bot size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Syntrix<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">AI</span></span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it Works" },
              { href: "#testimonials", label: "Clients" },
              { href: "#pricing", label: "Pricing" },
            ].map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-indigo-400 to-cyan-400 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="h-8 w-px bg-white/10 mx-2"
            />
            
            {isLoggedIn ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4"
              >
                <Link
                  href="/dashboard"
                  className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-white/50 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4"
              >
                <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
                >
                  <span className="relative z-10">Get Started Free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
              </motion.div>
            )}
          </div>

          <button className="md:hidden p-2 text-white/60 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-[#0f0f1a]/95 backdrop-blur-2xl border-b border-white/5 p-6 space-y-4"
            >
              {[
                { href: "#features", label: "Features" },
                { href: "#how-it-works", label: "How it Works" },
                { href: "#testimonials", label: "Clients" },
                { href: "#pricing", label: "Pricing" },
              ].map((item) => (
                <a key={item.href} href={item.href} className="block text-lg font-medium text-white/80 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard" className="w-full text-center py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl font-semibold shadow-lg" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    <button onClick={logout} className="w-full text-center py-4 border border-white/10 rounded-2xl font-medium text-white/60">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="w-full text-center py-4 border border-white/10 rounded-2xl font-medium text-white/60" onClick={() => setIsMenuOpen(false)}>Login</Link>
                    <Link href="/signup" className="w-full text-center py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl font-semibold shadow-lg" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-28 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 px-4 py-2 rounded-full text-xs font-medium tracking-wide mb-8 backdrop-blur-sm"
          >
            <Sparkles size={14} className="text-indigo-400" />
            Syntrix AI v0.1.0
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.92] mb-8"
          >
            Deploy Your
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
              AI Employee
            </span>
            <br />
            In Under 60 Seconds
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed mb-12"
          >
            The most advanced autonomous AI agents for your business.
            Scale support, capture leads, and automate 24/7.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-lg shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10">{isLoggedIn ? "Open Dashboard" : "Start Building Now"}</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-medium text-lg transition-all duration-300 flex items-center gap-2"
            >
              See How It Works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-8"
          >
            <p className="text-xs font-medium text-white/30 uppercase tracking-[0.3em]">Trusted by modern businesses worldwide</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-40">
              {["VERCEL", "NOTION", "INTERCOM", "STRIPE", "FIGMA"].map((name) => (
                <span key={name} className="text-xl font-bold tracking-tighter text-white/50">{name}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Hero Glow Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] -z-0" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[80px] -z-0" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide mb-6">
              <Radio size={12} />
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Everything You Need</h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">Powerful tools to automate your customer engagement and grow your business.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white/[0.03] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} p-[1px] mb-6`}>
                  <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center group-hover:bg-transparent transition-all duration-500">
                    <f.icon size={24} className="text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-transparent to-transparent group-hover:to-white/[0.02] pointer-events-none transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-28 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide mb-6">
              <Workflow size={12} />
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Deploy in Minutes</h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">Three simple steps to launch your AI employee and start capturing leads.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              {
                step: "01",
                title: "Customize Your AI",
                desc: "Train your AI employee with your business details, services, and a custom system prompt that defines its personality."
              },
              {
                step: "02",
                title: "Embed the Widget",
                desc: "Copy a single script tag and paste it into your website. Your AI employee goes live instantly with zero downtime."
              },
              {
                step: "03",
                title: "Capture Leads Automatically",
                desc: "Your AI engages visitors, answers questions, and extracts leads — all saved directly to your dashboard."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 h-full hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500">
                  <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-violet-400">{item.step}</span>
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">{item.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-gradient-to-r from-indigo-500/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Example Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-cyan-500/5 border border-white/5 rounded-[2.5rem] p-10 md:p-14 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[100px]" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Example AI Employee Prompt</h3>
              </div>
              <p className="text-white/40 mb-8 max-w-3xl leading-relaxed">
                Here is an example of how you can configure your AI employee to represent{' '}
                <span className="text-white font-semibold">SK Pro Digital Solutions</span>:
              </p>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 md:p-8 font-mono text-sm leading-relaxed text-white/60 overflow-x-auto">
                <pre className="whitespace-pre-wrap">You are an AI Employee for SK Pro Digital Solutions.

Your role:
- Help customers professionally and explain services clearly.
- MANDATORY: You must capture the customer's EMAIL address.
- Once you have their name and business type, immediately ask for their email.
- Keep replies short, human-like, and focused on converting visitors.

Services:
- Website Development
- AI Automation
- WhatsApp Automation
- AI Chatbots
- Business Landing Pages

Rules:
- Never say you are just an AI assistant.
- Talk like a real support/sales employee.
- If customer shows interest, you MUST ask for their:
  - name
  - business type
  - EMAIL (CRITICAL)</pre>
              </div>
              <p className="text-sm text-white/30 mt-6 italic">
                This prompt tells the AI exactly how to behave, what services you offer, and how to capture leads.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-28 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide mb-6">
              <MessageCircle size={12} />
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Loved by Businesses</h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">Join hundreds of companies scaling their support with AI.</p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden py-6">
              <motion.div
                className="flex gap-6"
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -50 && activeTestimonial < allTestimonials.length - 1) {
                    setActiveTestimonial(activeTestimonial + 1);
                  } else if (info.offset.x > 50 && activeTestimonial > 0) {
                    setActiveTestimonial(activeTestimonial - 1);
                  }
                }}
                animate={{ x: `calc(-${activeTestimonial * 100}% - ${activeTestimonial * 24}px)` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {allTestimonials.map((t, i) => (
                  <motion.div
                    key={i}
                    className="min-w-full bg-white/[0.03] border border-white/5 p-10 md:p-14 rounded-[2.5rem] flex flex-col items-center text-center space-y-6"
                  >
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, star) => (
                        <Star key={star} size={22} className={star < (t.rating || 5) ? "text-amber-400 fill-amber-400" : "text-white/10"} />
                      ))}
                    </div>
                    <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-medium italic">
                      &ldquo;{t.text || t.content}&rdquo;
                    </p>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{t.name || t.user_name}</h4>
                      <p className="text-sm font-medium text-indigo-400 tracking-wide mt-1">{t.business || t.business_name}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="flex justify-center mt-8 gap-2">
              {allTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    activeTestimonial === i ? 'w-10 bg-gradient-to-r from-indigo-400 to-violet-400' : 'w-2 bg-white/10 hover:bg-white/20'
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={() => isLoggedIn ? setShowFeedback(true) : window.location.href = '/login'}
                className="inline-flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white transition-colors group"
              >
                <MessageCircle size={16} />
                Give us feedback
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-28 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide mb-6">
              <Sparkles size={12} />
              Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Currently Free</h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">We're in beta — use all features for free today.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-cyan-500/5 border border-white/5 rounded-[3rem] p-12 md:p-20 text-center overflow-hidden"
          >
            <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-8">
                <Zap size={12} />
                Beta — No Charge
              </div>

              <div className="text-7xl md:text-8xl font-bold tracking-tight mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">$0</span>
              </div>
              <p className="text-xl text-white/60 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
                Build the ultimate AI Employee system with us. All features included, no credit card needed.
              </p>

              <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-6 py-3 rounded-2xl">
                  <CheckCircle2 className="text-emerald-400" size={18} />
                  <span className="text-sm font-medium text-white/70">Unlimited Conversations</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-6 py-3 rounded-2xl">
                  <CheckCircle2 className="text-emerald-400" size={18} />
                  <span className="text-sm font-medium text-white/70">Full Lead Extraction</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Free Now
                </Link>
                <button
                  onClick={() => isLoggedIn ? setShowFeedback(true) : window.location.href = '/login'}
                  className="px-10 py-5 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-medium text-lg transition-all duration-300"
                >
                  Give Feedback
                </button>
              </div>
              <p className="mt-8 text-xs font-medium text-white/20 uppercase tracking-[0.3em]">Pricing plans will be introduced soon.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 pb-16">
            <div className="space-y-5 max-w-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">Syntrix<span className="text-indigo-400">AI</span></span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed">
                The ultimate platform for autonomous AI employees. Empowering businesses with 24/7 intelligent automation.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 md:gap-20">
              {[
                {
                  title: "Product",
                  links: [
                    { label: "Features", href: "#features" },
                    { label: "Pricing", href: "#pricing" },
                    { label: "Dashboard", href: "/dashboard" },
                  ]
                },
                {
                  title: "Company",
                  links: [
                    { label: "Syntrix AI", href: "#" },
                    { label: "Partners", href: "#" },
                    { label: "Careers", href: "#" },
                  ]
                },
                {
                  title: "Legal",
                  links: [
                    { label: "Privacy", href: "#" },
                    { label: "Terms", href: "#" },
                  ]
                }
              ].map((group) => (
                <div key={group.title} className="space-y-4">
                  <h5 className="text-xs font-semibold text-white/40 uppercase tracking-widest">{group.title}</h5>
                  <ul className="space-y-3">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="text-sm font-medium text-white/30 hover:text-white transition-colors">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-xs font-medium text-white/20">© 2026 Syntrix AI Inc. Built for the future of AI.</p>
            <div className="flex gap-6">
              {[Zap, Shield, MessageSquare].map((Icon, i) => (
                <div key={i} className="text-white/20 hover:text-white/60 cursor-pointer transition-colors">
                  <Icon size={18} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
            onClick={() => { if (!submitting) setShowFeedback(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-[#111118] border border-white/5 rounded-[2rem] p-10 max-w-lg w-full shadow-2xl"
            >
              {feedSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6">
                    <ThumbsUp size={28} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-white/40 font-medium">Your feedback has been submitted successfully.</p>
                  <button
                    onClick={() => { setShowFeedback(false); setFeedSubmitted(false) }}
                    className="mt-8 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                      <MessageCircle size={20} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Give Feedback</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-medium text-white/40 uppercase tracking-wider block mb-2">Your Name</label>
                      <input
                        type="text"
                        value={feedName}
                        onChange={(e) => setFeedName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-5 py-3.5 bg-black/40 border border-white/5 rounded-xl text-sm font-medium text-white outline-none focus:border-indigo-500/50 focus:bg-black/60 transition-all duration-300 placeholder:text-white/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-white/40 uppercase tracking-wider block mb-2">Business Name</label>
                      <input
                        type="text"
                        value={feedBusiness}
                        onChange={(e) => setFeedBusiness(e.target.value)}
                        placeholder="e.g. SK Pro Digital Solutions"
                        className="w-full px-5 py-3.5 bg-black/40 border border-white/5 rounded-xl text-sm font-medium text-white outline-none focus:border-indigo-500/50 focus:bg-black/60 transition-all duration-300 placeholder:text-white/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-white/40 uppercase tracking-wider block mb-3">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedRating(star)}
                            className={`p-1 transition-all duration-200 ${star <= feedRating ? 'text-amber-400 scale-110' : 'text-white/10 hover:text-white/30'}`}
                          >
                            <Star size={28} fill={star <= feedRating ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-white/40 uppercase tracking-wider block mb-2">Your Feedback</label>
                      <textarea
                        rows={4}
                        value={feedContent}
                        onChange={(e) => setFeedContent(e.target.value)}
                        placeholder="Tell us about your experience..."
                        className="w-full px-5 py-3.5 bg-black/40 border border-white/5 rounded-xl text-sm font-medium text-white outline-none focus:border-indigo-500/50 focus:bg-black/60 transition-all duration-300 resize-none placeholder:text-white/20"
                      />
                    </div>
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={submitting || !feedContent.trim()}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={18} /> : <ThumbsUp size={18} />}
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
