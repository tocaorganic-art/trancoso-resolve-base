import { motion } from 'framer-motion';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#1a0c00] via-[#2d1200] to-[#1a0c00] flex items-center justify-center px-4 overflow-hidden">
      {/* Aurora blobs */}
      <motion.div
        className="absolute top-[-80px] left-[-80px] w-[360px] h-[360px] rounded-full bg-orange-600/20 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-amber-500/15 blur-[90px] pointer-events-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo / ícone / título */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-lg shadow-orange-900/30"
          >
            <Icon className="w-7 h-7 text-white" aria-hidden="true" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-white/60 mt-2">{subtitle}</p>}
        </motion.div>

        {/* Glassmorphism card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {children}
        </div>

        {footer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-white/60 mt-6"
          >
            {footer}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}