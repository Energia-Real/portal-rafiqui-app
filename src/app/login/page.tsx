'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useHydration } from '@/hooks/useHydration';
import { Lock, Mail, Loader2, AlertCircle, Leaf } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const hydrated = useHydration();
  const { loginAdmin, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace('/panel-interno/solicitudes');
    }
  }, [hydrated, isAuthenticated, router]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;

  const fieldClass = (value: string, valid: boolean, isTouched: boolean) => {
    if (!isTouched || !value) return '';
    return valid ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const { success, error: loginError } = await loginAdmin(email, password);
    if (success) {
      router.push('/panel-interno/solicitudes');
    } else {
      setError(loginError ?? 'Credenciales incorrectas.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-eco-gradient" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo + tagline */}
        <div className="flex flex-col items-center mb-8">
          <motion.img
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src="https://res.cloudinary.com/dszhbfyki/image/upload/v1768530966/logo-removebg-preview.png"
            alt="Rafiqui"
            className="h-20 w-auto mb-4"
          />
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-xs font-medium">
            <Leaf size={12} />
            Panel de administración
          </span>
        </div>

        <div className="card">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-white mb-1">Acceso interno</h1>
            <p className="text-dark-400 text-sm">Solo para administradores de Rafiqui.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  required
                  autoComplete="email"
                  placeholder="admin@rafiqui.com"
                  aria-label="Correo electrónico"
                  className={`w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors ${fieldClass(email, emailValid, touched.email)}`}
                />
              </div>
              {touched.email && email && !emailValid && (
                <p className="text-red-400 text-xs mt-1 ml-1">Ingresa un correo válido</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-label="Contraseña"
                  className={`w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors ${fieldClass(password, passwordValid, touched.password)}`}
                />
              </div>
              {touched.password && password && !passwordValid && (
                <p className="text-red-400 text-xs mt-1 ml-1">Mínimo 6 caracteres</p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
