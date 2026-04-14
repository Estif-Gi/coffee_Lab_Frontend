import { motion as Motion } from 'framer-motion'

function EventCard({ event }) {
  return (
    <Motion.article
      whileHover={{ y: -6 }}
      className="luxury-surface overflow-hidden rounded-3xl border border-beige/60 shadow-xl transition dark:border-coffee-700"
    >
      <img src={event.image} alt={event.title} className="h-44 w-full object-cover" loading="lazy" />
      <div className="space-y-3 p-5">
        <h3 className="text-xl font-semibold text-coffee-900 dark:text-cream">{event.title}</h3>
        <p className="text-sm text-coffee-700 dark:text-beige">{event.date}</p>
        {/* <p className="text-sm text-coffee-700 dark:text-beige">{event.location}</p> */}
        <p className="text-sm leading-relaxed text-coffee-700/90 dark:text-beige">{event.description}</p>
      </div>
    </Motion.article>
  )
}

export default EventCard
