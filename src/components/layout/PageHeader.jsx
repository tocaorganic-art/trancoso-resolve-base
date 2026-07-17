import { motion } from "framer-motion";

/**
 * Header padronizado para todas as páginas do app
 * Design system: Navy (#0a1628) + Âmbar gradiente
 * Linguagem local: Trancoso/Bahia - calorosa, humana, acolhedora
 */
export default function PageHeader({ title, subtitle, icon: Icon }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-5 pt-6 pb-2"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.header>
  );
}