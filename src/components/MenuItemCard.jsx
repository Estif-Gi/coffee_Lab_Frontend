import { motion as Motion } from 'framer-motion'

function MenuItemCard({ item }) {
  return (
    <Motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="luxury-surface rounded-3xl border border-beige/60 p-5 shadow-lg dark:border-coffee-700"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-coffee-900 dark:text-cream">{item.name}</h3>
        <span className="rounded-full bg-gold/20 px-3 py-1 text-sm font-semibold text-coffee-800">
          {item.price}
        </span>
      </div>
      <p className="text-sm text-coffee-700 dark:text-beige">{item.description}</p>
      {item.featured && (
        <p className="mt-4 inline-flex rounded-full bg-coffee-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cream">
          Featured
        </p>
      )}
    </Motion.article>
  )
}

export default MenuItemCard
