import { motion } from "framer-motion";

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
          <div className="w-12 h-12 rounded-brand-lg bg-brand-primary flex items-center justify-center shadow-brand">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.header>
  );
}