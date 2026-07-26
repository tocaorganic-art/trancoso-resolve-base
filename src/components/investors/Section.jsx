import { motion } from 'framer-motion';

export default function Section({ id = undefined, eyebrow = undefined, title = undefined, subtitle = undefined, children, tone = 'default', className = '' }) {
  const toneStyles = {
    default: 'bg-background',
    sand: 'bg-sand/40 dark:bg-neutral-900/60',
    dark: 'bg-[#1A1208] text-white',
  };

  return (
    <section id={id} className={`scroll-mt-24 py-16 md:py-24 ${toneStyles[tone]} ${className}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        {(eyebrow || title) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mb-10 md:mb-14 max-w-3xl"
          >
            {eyebrow && (
              <p className={`text-xs font-bold uppercase tracking-[0.12em] mb-3 ${tone === 'dark' ? 'text-orange-400' : 'text-orange-700'}`}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className={`text-3xl md:text-4xl font-display font-extrabold leading-tight tracking-[-0.02em] ${tone === 'dark' ? 'text-white' : 'text-foreground'}`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`mt-4 text-base md:text-lg leading-relaxed ${tone === 'dark' ? 'text-white/70' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
