'use client';

import { motion } from 'framer-motion';
import { CollectionRequestForm } from '@/components/forms/CollectionRequestForm';
import { Recycle, Truck, CheckCircle, Leaf, Clock, Shield } from 'lucide-react';

export default function DonarPage() {
  const benefits = [
    {
      icon: <Truck className="text-primary-400" size={24} />,
      title: 'Recolección Gestionada',
      description: 'Nos encargamos de la logística de recolección.',
    },
    {
      icon: <Recycle className="text-primary-400" size={24} />,
      title: 'Reciclaje Certificado',
      description: 'Procesamos con estándares internacionales.',
    },
    {
      icon: <Leaf className="text-primary-400" size={24} />,
      title: 'Certificado de Impacto',
      description: 'Recibe un reporte de tu contribución ambiental.',
    },
  ];

  const steps = [
    { number: '01', title: 'Solicita', description: 'Llena el formulario con tus datos' },
    { number: '02', title: 'Confirmamos', description: 'Te enviamos una propuesta en 24-48 hrs' },
    { number: '03', title: 'Recolectamos', description: 'Pasamos por tus paneles' },
    { number: '04', title: 'Reciclamos', description: 'Transformamos los materiales' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-eco-gradient" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium mb-6">
                <Recycle size={16} />
                Solicitar Recolección
              </span>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                Dona tus Paneles,{' '}
                <span className="text-gradient">Transforma el Futuro</span>
              </h1>
              
              <p className="text-lg text-dark-300 mb-8">
                Cada panel solar en desuso contiene materiales valiosos que pueden tener 
                una segunda vida. Solicita la recolección y sé parte del cambio.
              </p>

              {/* Benefits */}
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="p-2 bg-primary-500/10 rounded-lg">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{benefit.title}</h3>
                      <p className="text-dark-400 text-sm">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="card">
                <h2 className="text-xl font-bold text-white mb-6">
                  Solicitar Recolección
                </h2>
                <CollectionRequestForm />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 px-4 border-t border-dark-700">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-dark-400">
              Un proceso simple y transparente de principio a fin.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-dark-700" />
                )}
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/30 mb-4">
                    <span className="text-2xl font-display font-bold text-primary-400">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-dark-400 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-dark-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Clock className="text-primary-400 mb-3" size={32} />
              <p className="text-2xl font-bold text-white">24-48 hrs</p>
              <p className="text-dark-400 text-sm">Tiempo de respuesta</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="text-primary-400 mb-3" size={32} />
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-dark-400 text-sm">Proceso certificado</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="text-primary-400 mb-3" size={32} />
              <p className="text-2xl font-bold text-white">2,000 ton</p>
              <p className="text-dark-400 text-sm">Capacidad anual de reciclaje</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
