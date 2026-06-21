'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Save, Shield, Terminal, Bot, Palette, MessageSquare, Image as ImageIcon, Loader2, Upload, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';
import ChatPreview from '@/components/ChatPreview';

export default function SettingsPage() {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    employee_name: '', 
    system_prompt: '',
    welcome_message: '',
    primary_color: '#4F46E5',
    button_color: '#4F46E5',
    header_color: '#4F46E5',
    text_color: '#FFFFFF',
    background_color: '#FFFFFF',
    widget_icon: 'bot',
    logo_url: ''
  });
  
  const { token, logout } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!apiUrl || !token) return;
      
      try {
        const res = await fetch(`${apiUrl}/business/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            logout();
            return;
          }
          throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        setBusiness(data);
          setFormData({
          name: data.name || '',
          employee_name: data.employee_name || '',
          system_prompt: data.system_prompt || '',
          welcome_message: data.welcome_message || 'Hello! How can I help you today?',
          primary_color: data.primary_color || '#4F46E5',
          button_color: data.button_color || '#4F46E5',
          header_color: data.header_color || '#4F46E5',
          text_color: data.text_color || '#FFFFFF',
          background_color: data.background_color || '#FFFFFF',
          widget_icon: data.widget_icon || 'bot',
          logo_url: data.logo_url || ''
        });
        setError(null);
      } catch (err: any) {
        console.error('Fetch business failed:', err);
        setError(err.message || 'Failed to connect to the backend server.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusiness();
  }, [apiUrl, token, logout]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch(`${apiUrl}/business/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      if (res.ok) {
        const data = await res.json();
        const fullUrl = data.logo_url.startsWith('http') 
          ? data.logo_url 
          : `${apiUrl?.replace('/api/v1', '')}${data.logo_url}`;
        setFormData({ ...formData, logo_url: fullUrl });
      }
    } catch (err) {
      console.error('Logo upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/business/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updated = await res.json();
        setBusiness(updated);
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const copyCode = () => {
    if (!business) return;
    const widgetBase = process.env.NEXT_PUBLIC_WIDGET_URL || window.location.origin;
    const widgetUrl = `${widgetBase}/widget.js`;
    const code = `<script src="${widgetUrl}" data-api-key="${business.api_key}" async></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex h-screen bg-[#0a0a0f] items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-indigo-400 mx-auto mb-4" size={40} />
        <p className="text-white/30 text-sm font-medium animate-pulse">Loading configuration...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white/[0.03] border border-white/5 p-12 rounded-[2.5rem] max-w-md">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Connection Failed</h1>
          <p className="text-white/40 font-medium mb-8 leading-relaxed text-sm">
            {error}. <br /> Please ensure your backend server is running.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/10 transition-all active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] font-sans text-white">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <header className="bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/5 p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Widget Configuration</h1>
            <p className="text-sm text-white/30 mt-0.5">Customize your AI employee's behavior and appearance</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </header>

        <div className="p-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Branding Section */}
            <section className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Palette size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">Visual Branding</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Primary Theme Color</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                      className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                    />
                    <input 
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                      className="flex-1 px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm font-mono text-white/60 outline-none focus:border-indigo-500/30 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Chatbot Button Color</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color"
                      value={formData.button_color}
                      onChange={(e) => setFormData({...formData, button_color: e.target.value})}
                      className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                    />
                    <input 
                      type="text"
                      value={formData.button_color}
                      onChange={(e) => setFormData({...formData, button_color: e.target.value})}
                      className="flex-1 px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm font-mono text-white/60 outline-none focus:border-indigo-500/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Header Color</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color"
                      value={formData.header_color}
                      onChange={(e) => setFormData({...formData, header_color: e.target.value})}
                      className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                    />
                    <input 
                      type="text"
                      value={formData.header_color}
                      onChange={(e) => setFormData({...formData, header_color: e.target.value})}
                      className="flex-1 px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm font-mono text-white/60 outline-none focus:border-indigo-500/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Header Text Color</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                      className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                    />
                    <input 
                      type="text"
                      value={formData.text_color}
                      onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                      className="flex-1 px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm font-mono text-white/60 outline-none focus:border-indigo-500/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Chat Background Color</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                      className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                    />
                    <input 
                      type="text"
                      value={formData.background_color}
                      onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                      className="flex-1 px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm font-mono text-white/60 outline-none focus:border-indigo-500/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Business Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm font-medium text-white outline-none focus:border-indigo-500/30 transition-all"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Widget Icon</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, widget_icon: 'bot'})}
                      className={`flex items-center justify-center gap-2.5 p-4 rounded-xl border transition-all ${
                        formData.widget_icon === 'bot' 
                        ? 'border-indigo-500/30 bg-indigo-500/10 text-white' 
                        : 'border-white/5 bg-black/20 text-white/40 hover:text-white/60 hover:border-white/10'
                      }`}
                    >
                      <Bot size={20} />
                      <span className="font-medium text-sm">Robot Icon</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, widget_icon: 'message'})}
                      className={`flex items-center justify-center gap-2.5 p-4 rounded-xl border transition-all ${
                        formData.widget_icon === 'message' 
                        ? 'border-indigo-500/30 bg-indigo-500/10 text-white' 
                        : 'border-white/5 bg-black/20 text-white/40 hover:text-white/60 hover:border-white/10'
                      }`}
                    >
                      <MessageSquare size={20} />
                      <span className="font-medium text-sm">Message Icon</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Business Logo</label>
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-white/10" size={20} />
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                          <Loader2 className="animate-spin text-indigo-400" size={16} />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all active:scale-95 disabled:opacity-40"
                      >
                        {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                        {formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                      </button>
                      <p className="text-[10px] text-white/20 font-medium">Recommended: Square, min 200x200px</p>
                    </div>

                    {formData.logo_url && (
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, logo_url: ''})}
                        className="text-xs font-medium text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* AI Settings */}
            <section className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">AI Personality</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-white/30 uppercase tracking-wider">AI Agent Name</label>
                  <input 
                    type="text"
                    value={formData.employee_name}
                    onChange={(e) => setFormData({...formData, employee_name: e.target.value})}
                    className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm font-medium text-white outline-none focus:border-indigo-500/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Welcome Message</label>
                  <input 
                    type="text"
                    value={formData.welcome_message}
                    onChange={(e) => setFormData({...formData, welcome_message: e.target.value})}
                    className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm font-medium text-white outline-none focus:border-indigo-500/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-white/30 uppercase tracking-wider">AI Training Instructions (System Prompt)</label>
                <textarea 
                  rows={6}
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
                  className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm font-medium text-white leading-relaxed outline-none focus:border-indigo-500/30 transition-all resize-none"
                  placeholder="Tell the AI how to behave, what services you offer, and how to handle leads..."
                />
              </div>
            </section>

            {/* Integration Section */}
            <section className="bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-cyan-500/5 border border-white/5 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Terminal size={18} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Embed Code</h3>
                </div>
                
                <p className="text-sm text-white/40 mb-6 max-w-2xl leading-relaxed">
                  Copy the following script and paste it at the very bottom of your website's <code className="text-indigo-400 font-medium">&lt;body&gt;</code> tag.
                </p>

                <div className="bg-black/40 border border-white/5 rounded-xl p-5 font-mono text-xs flex justify-between items-center group hover:bg-black/60 transition-all">
                  <code className="text-indigo-300/60 break-all pr-4">
                    {business ? `<script src="${process.env.NEXT_PUBLIC_WIDGET_URL || window.location.origin}/widget.js" data-api-key="${business.api_key}" async></script>` : '// Loading configuration...'}
                  </code>
                  <button 
                    onClick={copyCode}
                    disabled={!business}
                    className="flex-shrink-0 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all active:scale-90 disabled:opacity-30"
                  >
                    {copied ? <Check className="text-emerald-400" size={16} /> : <Copy size={16} className="text-white/40" />}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Live Preview</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-medium text-white/20 uppercase tracking-wider">Sync</span>
                </div>
              </div>
              
              <ChatPreview 
                businessName={formData.name}
                agentName={formData.employee_name}
                welcomeMessage={formData.welcome_message}
                primaryColor={formData.primary_color}
                buttonColor={formData.button_color}
                headerColor={formData.header_color}
                textColor={formData.text_color}
                backgroundColor={formData.background_color}
                widgetIcon={formData.widget_icon}
                systemPrompt={formData.system_prompt}
                logoUrl={formData.logo_url}
              />
              
              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl text-center">
                <p className="text-[10px] font-medium text-white/20 uppercase tracking-wider leading-relaxed">
                  Changes reflect exactly how customers will see your agent.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
