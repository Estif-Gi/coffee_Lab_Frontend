import { motion as Motion } from 'framer-motion'

function SectionWrapper({ id, title, subtitle, children }) {
  return (
    <Motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 text-coffee-900 dark:text-cream"
    >
      {(title || subtitle) && (
        <div className="mb-10 text-center dark:bg-coffee-900">
          {subtitle && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              {subtitle}
            </p>
          )}
          {title && (
            <h2 className="text-3xl font-bold text-coffee-900 dark:text-cream md:text-4xl">
              {title}
            </h2>
          )}
        </div>
      )}
      {children}
    </Motion.section>
  )
}

export default SectionWrapper
