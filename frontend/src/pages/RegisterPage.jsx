import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
  Shield,
  User,
  Mail,
  Building,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Layers,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Product Engineering');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Mouse tilt for glass card
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await register({ name, email, department, password });
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans selection:bg-[#ccff00] selection:text-slate-950">
      {/* Background Mesh & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ccff00_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(204,255,0,0.08)_0%,transparent_50%)] pointer-events-none" />

      {/* Ambient Floating Orbs */}
      <motion.div
        animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -right-28 w-96 h-96 rounded-full bg-[#ccff00]/10 blur-[110px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -40, 40, 0], y: [0, 30, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 -left-28 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 relative z-10 max-w-md w-full"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10 mb-3 shadow-lg">
          <Shield className="w-3.5 h-3.5 text-[#ccff00]" />
          <span className="text-[11px] font-mono text-slate-300 font-semibold uppercase tracking-wider">
            Safe Role Bootstrap Guard
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Create Corporate Account</h1>
        <p className="text-xs text-slate-400 mt-1">Register as a certified corporate expense submitter</p>
      </motion.div>

      {/* 3D Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ perspective: 1000 }}
        className="w-full max-w-lg relative z-20"
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-slate-900/40 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          <form className="space-y-4" onSubmit={handleRegister}>
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#ccff00] transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-white/10 bg-slate-950/60 text-white placeholder-slate-500 backdrop-blur-md focus:outline-none focus:border-[#ccff00] focus:ring-2 focus:ring-[#ccff00]/20 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#ccff00] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@shieldcorp.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-white/10 bg-slate-950/60 text-white placeholder-slate-500 backdrop-blur-md focus:outline-none focus:border-[#ccff00] focus:ring-2 focus:ring-[#ccff00]/20 transition-all"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Department
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#ccff00] transition-colors">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Product Engineering"
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
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-11 py-2.5 text-xs rounded-xl border border-white/10 bg-slate-950/60 text-white placeholder-slate-500 backdrop-blur-md focus:outline-none focus:border-[#ccff00] focus:ring-2 focus:ring-[#ccff00]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Notice */}
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] text-slate-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Default Safe Role: </strong>
                <span>
                  Public registrations automatically grant <span className="font-mono text-[#ccff00]">EMPLOYEE</span>{' '}
                  privileges. Manager and Admin roles are provisioned strictly via Infosec authorization.
                </span>
              </div>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01, boxShadow: '0 0 25px rgba(204, 255, 0, 0.35)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ccff00] to-[#99cc00] hover:to-[#aae000] text-slate-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#ccff00]/20 transition-all cursor-pointer disabled:opacity-75"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </motion.button>
          </form>

          <div className="mt-5 text-center border-t border-white/5 pt-4">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1 group"
            >
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Already have an account? Sign in</span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
