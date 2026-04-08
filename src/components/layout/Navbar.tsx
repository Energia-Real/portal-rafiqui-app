'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useHydration } from '@/hooks/useHydration';
import { Recycle, ShoppingBag, LayoutDashboard, ClipboardList, Menu, X, LogOut } from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydration();
  const { isAuthenticated, logout } = useAuthStore();

  const navLinks = [
    { href: '/donar', label: 'Donar Paneles', icon: <Recycle size={18} />, public: true, disabled: false },
    { href: '/market', label: 'Marketplace', icon: <ShoppingBag size={18} />, public: true, disabled: true },
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, public: true, disabled: true },
    { href: '/panel-interno/solicitudes', label: 'Solicitudes', icon: <ClipboardList size={18} />, authOnly: true, disabled: false },
  ];

  const filteredLinks = navLinks.filter((link) => {
    if (link.authOnly) return hydrated && isAuthenticated;
    return true;
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const renderLink = (link: typeof navLinks[0], mobile = false) => {
    const isActive = pathname === link.href;

    if (link.disabled) {
      return (
        <span
          key={link.href}
          className={`${mobile ? 'flex flex-col px-4 py-3' : 'relative flex flex-col items-center px-4 py-2'} rounded-xl font-medium text-dark-500 cursor-not-allowed opacity-60`}
        >
          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold mb-0.5 w-fit">
            Próximamente
          </span>
          <span className={`flex items-center ${mobile ? 'gap-3' : 'gap-2'}`}>
            {link.icon}
            {link.label}
          </span>
        </span>
      );
    }

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
        className={`relative flex items-center ${mobile ? 'gap-3 px-4 py-3' : 'gap-2 px-4 py-2'} rounded-xl font-medium transition-all duration-300 ${
          isActive
            ? mobile
              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
              : 'text-white'
            : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
        }`}
      >
        {link.icon}
        {link.label}
        {isActive && !mobile && (
          <motion.div
            layoutId="navbar-indicator"
            className="absolute inset-0 bg-primary-500/20 border border-primary-500/50 rounded-xl -z-10"
          />
        )}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? '/panel-interno/solicitudes' : '/'} className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
              <img
                src="https://res.cloudinary.com/dszhbfyki/image/upload/v1768532345/logo-min.png"
                alt="Rafiqui Logo"
                className="h-10 w-auto"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {filteredLinks.map((link) => renderLink(link))}
          </div>

          {/* Right side: logout for admin, mobile menu button for others */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-dark-300 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-all text-sm"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-all"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-dark-700"
          >
            <div className="px-4 py-4 space-y-2">
              {filteredLinks.map((link) => renderLink(link, true))}
              {isAuthenticated && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-dark-300 hover:text-red-400 hover:bg-dark-700/50 transition-all"
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
