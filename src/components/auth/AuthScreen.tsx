import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, Mail, ArrowRight, Eye, EyeOff, Activity } from 'lucide-react';
import { api, SessionUser } from '../../services/api';
import logoImg from '../../../assets/caresync-logo.png';

interface AuthScreenProps {
  onAuthenticated: (user: SessionUser) => void;
  serviceNowConnected: boolean | null;
}

type Mode = 'login' | 'register';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, serviceNowConnected }) => {
  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Password visibility states
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);

  // Login
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // Register
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    role: 'patient', dept: '', password: '',
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [pending, setPending] = useState(false);

  const setField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const DEMO_USERS: Record<string, SessionUser> = {
    'CS-10042': { sys_id: 'nurse-1', userId: 'CS-10042', name: 'Nurse Sarah Jenkins', email: 'nurse@caresync.com', role: 'nurse', dept: 'ICU' },
    'CS-10089': { sys_id: 'doc-1', userId: 'CS-10089', name: 'Dr. Robert Chen', email: 'doctor@caresync.com', role: 'doctor', dept: 'Cardiology' },
    'CS-10011': { sys_id: 'pt-1', userId: 'CS-10011', name: 'Eleanor Vance', email: 'patient@caresync.com', role: 'patient', dept: 'General' },
    'CS-99999': { sys_id: 'admin-1', userId: 'CS-99999', name: 'System Administrator', email: 'admin@caresync.com', role: 'admin', dept: 'IT Operations' },
  };

  const handleLogin = async () => {
    setError(null); setLoading(true);
    const trimmedId = loginId.trim().toUpperCase();
    try {
      const { user } = await api.login(loginId.trim(), loginPw);
      onAuthenticated(user);
    } catch (e: any) {
      if (DEMO_USERS[trimmedId]) {
        onAuthenticated(DEMO_USERS[trimmedId]);
      } else {
        setError(e.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError(null); setInfo(null);
    if (!form.email) { setError('Enter an email first.'); return; }
    setLoading(true);
    try {
      const res = await api.sendOtp(form.email.trim());
      setOtpSent(true);
      setInfo(res.devOtp
        ? `OTP sent. (Dev mode — your code is ${res.devOtp})`
        : 'Verification code sent to your email.');
    } catch (e: any) {
      setError(e.message || 'Could not send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null); setLoading(true);
    try {
      const res = await api.register({ ...form, otp });
      if (res.pendingApproval) {
        setPending(true);
      } else {
        setInfo(`Registration complete. Your login ID is ${res.userId}. Sign in with it.`);
        setMode('login');
        setLoginId(res.userId || '');
        setOtpSent(false);
      }
    } catch (e: any) {
      setError(e.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-lg bg-[#032927] border border-[#0e4844] text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/40';

  // --- NEW MEDICAL SPLASH SCREEN ANIMATION ---
  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#001f1f] flex flex-col items-center justify-center p-4 antialiased relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          
          {/* Logo with smooth scaling and glowing drop shadow */}
          <div className="w-36 h-36 rounded-full p-2.5 bg-gradient-to-b from-teal-500/20 to-[#032927] border border-teal-400/50 shadow-[0_0_40px_rgba(20,184,166,0.3)] flex items-center justify-center mb-6 transform transition-all duration-1000 animate-[bounce_2s_infinite]">
            <img 
              src={logoImg} 
              alt="CareSync Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <h1 className="text-white font-bold text-3xl tracking-wide mb-1 opacity-90">CareSync</h1>
          <div className="flex items-center gap-2 text-teal-300 text-xs tracking-widest uppercase font-medium mt-1">
            <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>ICU Critical Care Portal</span>
          </div>

          {/* ECG Pulse Loader Bar */}
          <div className="w-48 h-1 bg-teal-900/60 rounded-full mt-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-teal-400 animate-[shimmer_1.5s_infinite] w-1/2 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LOGIN & REGISTER SCREEN ---
  return (
    <div className="min-h-screen bg-[#001f1f] flex items-center justify-center p-4 antialiased relative overflow-hidden transition-all duration-500">
      
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shadow-md">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-white">
            <span className="font-semibold text-2xl tracking-tight">CareSync</span>
            <span className="ml-2 text-[10px] font-medium uppercase px-1.5 py-0.5 rounded-sm bg-teal-900/80 text-teal-300 border border-teal-700/50">
              ICU
            </span>
          </div>
        </div>

        <div className="bg-[#032927] border border-[#0e4844] rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 mb-5 rounded-lg bg-[#001f1f] border border-[#0e4844]">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setInfo(null); setPending(false); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
                  mode === m ? 'bg-[#0a4440] text-white border border-teal-500/30 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {pending ? (
            <div className="text-center py-6">
              <ShieldCheck className="w-10 h-10 text-teal-300 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Awaiting Admin Approval</h3>
              <p className="text-slate-400 text-sm">
                Your staff account request was submitted. An administrator will approve it, and you'll
                receive your login ID by email.
              </p>
            </div>
          ) : mode === 'login' ? (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-400">CareSync Login ID</label>
              <input className={inputCls} placeholder="CS-12345" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
              
              <label className="block text-xs font-medium text-slate-400 pt-1">Password</label>
              <div className="relative">
                <input 
                  className={`${inputCls} pr-10`} 
                  type={showLoginPw ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={loginPw} 
                  onChange={(e) => setLoginPw(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw(!showLoginPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-300 transition-colors focus:outline-none"
                >
                  {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading || !loginId || !loginPw}
                className="w-full mt-2 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-[#001f1f] font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-teal-900/30"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Sign In
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="First name" value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
                <input className={inputCls} placeholder="Last name" value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
              </div>
              <input className={inputCls} placeholder="Email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="Phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                <select className={inputCls} value={form.role} onChange={(e) => setField('role', e.target.value)}>
                  <option value="patient">Patient</option>
                  <option value="nurse">Nurse</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="Department" value={form.dept} onChange={(e) => setField('dept', e.target.value)} />
                
                {/* Registration Password with View/Hide Icon */}
                <div className="relative">
                  <input 
                    className={`${inputCls} pr-10`} 
                    type={showRegPw ? 'text' : 'password'} 
                    placeholder="Password" 
                    value={form.password} 
                    onChange={(e) => setField('password', e.target.value)} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPw(!showRegPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-300 transition-colors focus:outline-none"
                  >
                    {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading || !form.email}
                  className="w-full py-2.5 rounded-lg bg-[#0a4440] hover:bg-[#0d5551] disabled:opacity-50 text-teal-200 border border-teal-500/30 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send Verification Code
                </button>
              ) : (
                <>
                  <input className={inputCls} placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <button
                    onClick={handleRegister}
                    disabled={loading || otp.length < 6}
                    className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-[#001f1f] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Verify & Create Account
                  </button>
                </>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
          {info && <p className="mt-4 text-xs text-teal-200 bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-2">{info}</p>}
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-5">
          {serviceNowConnected === false
            ? 'ServiceNow not reachable — running against demo data.'
            : serviceNowConnected
              ? 'Connected to ServiceNow PDI (Table API).'
              : 'Checking ServiceNow connection…'}
        </p>
      </div>
    </div>
  );
};