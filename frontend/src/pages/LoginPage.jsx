import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Activity,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('priya.sharma@shieldcorp.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authStep, setAuthStep] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // Mouse tilt tracking for 3D glass card
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);
  const glowX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glowY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both corporate email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      setAuthStep('Validating credentials...');
      await new Promise((r) => setTimeout(r, 200));
      setAuthStep('Authenticating session...');
      
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
      setAuthStep('');
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans selection:bg-[#ccff00] selection:text-slate-950">
      {/* Dynamic Background Noise & Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#ccff00_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(204,255,0,0.08)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_90%,rgba(16,185,129,0.06)_0%,transparent_50%)] pointer-events-none" />

      {/* Floating Animated Ambient Glass Orbs */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -35, 25, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-28 w-96 h-96 rounded-full bg-[#ccff00]/12 blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -45, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-36 -right-28 w-[30rem] h-[30rem] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, 25, -25, 0],
          y: [0, 20, -20, 0],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-500/8 blur-[110px] pointer-events-none"
      />

      {/* Header Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-6 relative z-10 max-w-md w-full"
      >
        <div className="flex items-center justify-center gap-3">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ccff00] to-[#99cc00] flex items-center justify-center text-slate-950 shadow-xl shadow-[#ccff00]/25 relative group cursor-pointer"
          >
            <Shield className="w-6 h-6 stroke-[2.2]" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              AgentShield <span className="text-[#ccff00]">AI</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400">
              Policy-Governed Framework for Autonomous Agents
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3D Glassmorphic Interactive Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          perspective: 1000,
        }}
        className="w-full max-w-md relative z-20"
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="relative rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-slate-900/40 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(204,255,0,0.04)] overflow-hidden transition-all duration-200"
        >
          {/* Specular Highlight along top edge */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Interactive Mouse Torch Light */}
          <motion.div
            className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${glowX} ${glowY}, rgba(204, 255, 0, 0.08), transparent 80%)`,
            }}
          />

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Corporate Email */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Corporate Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#ccff00] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@shieldcorp.io"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-white/10 bg-slate-950/60 text-white placeholder-slate-500 backdrop-blur-md focus:outline-none focus:border-[#ccff00] focus:ring-2 focus:ring-[#ccff00]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#ccff00] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 text-xs rounded-xl border border-white/10 bg-slate-950/60 text-white placeholder-slate-500 backdrop-blur-md focus:outline-none focus:border-[#ccff00] focus:ring-2 focus:ring-[#ccff00]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Hints */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                    rememberMe
                      ? 'bg-[#ccff00] border-[#ccff00] text-slate-950'
                      : 'border-white/20 bg-slate-950/50'
                  }`}
                >
                  {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-slate-300 text-[11px]">Remember device token</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Default demo password for all accounts is 'password123'.")}
                className="text-[11px] text-[#ccff00]/80 hover:text-[#ccff00] hover:underline"
              >
                Password hint?
              </button>
            </div>

            {/* Error Message Alert */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2.5 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span className="flex-1">{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01, boxShadow: '0 0 25px rgba(204, 255, 0, 0.35)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ccff00] via-[#c2f500] to-[#99cc00] hover:to-[#aae000] text-slate-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#ccff00]/20 transition-all relative overflow-hidden group cursor-pointer disabled:opacity-75"
            >
              {/* Shimmer line */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-slate-950" />
                  <span>{authStep || 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Registration link */}
          <div className="mt-5 text-center border-t border-white/5 pt-4">
            <span className="text-slate-400 text-xs">New enterprise employee? </span>
            <Link
              to="/register"
              className="text-xs font-bold text-[#ccff00] hover:underline inline-flex items-center gap-1 group"
            >
              <span>Register new account</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
