'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Recycle, ShoppingBag, BarChart3, ArrowRight, Leaf, Zap, Globe } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Recycle className="text-primary-400" size={32} />,
      title: 'Dona tus Paneles',
      description: 'Solicita la recolección de paneles solares en desuso.',
      href: '/donar',
      color: 'primary',
      comingSoon: false,
    },
    {
      icon: <ShoppingBag className="text-accent-400" size={32} />,
      title: 'Marketplace',
      description: 'Compra materiales reciclados y obras de arte únicas.',
      href: '/market',
      color: 'accent',
      comingSoon: true,
    },
    {
      icon: <BarChart3 className="text-primary-400" size={32} />,
      title: 'Impacto ESG',
      description: 'Visualiza tu contribución al medio ambiente.',
      href: '/dashboard',
      color: 'primary',
      comingSoon: true,
    },
  ];

  const stats = [
    { value: '2,500+', label: 'Paneles Reciclados', icon: <Recycle size={20} /> },
    { value: '150 ton', label: 'CO₂ Ahorrado', icon: <Leaf size={20} /> },
    { value: '89%', label: 'Materiales Recuperados', icon: <Zap size={20} /> },
    { value: '12', label: 'Países', icon: <Globe size={20} /> },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-eco-gradient" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <img 
              src="https://res.cloudinary.com/dszhbfyki/image/upload/v1768530966/logo-removebg-preview.png" 
              alt="Rafiqui Logo" 
              className="h-24 md:h-32 w-auto mx-auto"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium mb-6">
              <Leaf size={16} />
              Economía Circular para Energía Solar
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
          >
            Transforma el{' '}
            <span className="text-gradient">Futuro Solar</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-dark-300 max-w-2xl mx-auto mb-10"
          >
            Rafiqui conecta donadores de paneles solares con empresas que transforman 
            residuos en recursos valiosos. Cada panel cuenta una historia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/donar" className="btn-primary flex items-center justify-center gap-2">
              Solicitar Recolección
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-4 border-y border-dark-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 mb-4">
                  {stat.icon}
                </div>
                <p className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-dark-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              Tres simples pasos para ser parte de la revolución del reciclaje solar.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {feature.comingSoon ? (
                  <div className={`card h-full opacity-60 cursor-not-allowed relative ${feature.color === 'accent' ? 'card-art' : ''}`}>
                    <span className="absolute top-4 right-4 text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Próximamente
                    </span>
                    <div className={`inline-flex p-3 rounded-xl mb-4 ${
                      feature.color === 'accent' ? 'bg-accent-500/10' : 'bg-primary-500/10'
                    }`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-dark-400 mb-4">{feature.description}</p>
                  </div>
                ) : (
                  <Link href={feature.href} className="block group">
                    <div className="card h-full hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/15 transition-all duration-300">
                      <div className="inline-flex p-3 rounded-xl mb-4 bg-primary-500/10">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-dark-400 mb-4">{feature.description}</p>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-400">
                        Explorar
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
