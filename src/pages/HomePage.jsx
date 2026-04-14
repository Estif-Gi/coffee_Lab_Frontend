import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import Button from '../components/Button'
import EventCard from '../components/EventCard'
import Navbar from '../components/Navbar'
import SectionWrapper from '../components/SectionWrapper'
import SkeletonCard from '../components/SkeletonCard'
import { useCoffeeStore } from '../store/useCoffeeStore'
import { fetchPromotions } from '../api/apiClient'
import ContactAdmin from './ContactAdmin'

function formatDateTime(value) {
  if (!value) return 'TBD'
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function HomePage() {
  const { events, isLoading, fetchEvents } = useCoffeeStore()
  const [promotions, setPromotions] = useState([])
  const [isPromotionsLoading, setIsPromotionsLoading] = useState(false)

  useEffect(() => {
    fetchEvents()
    const loadPromotions = async () => {
      setIsPromotionsLoading(true)
      try {
        const data = await fetchPromotions()
        setPromotions(data)
      } catch (error) {
        console.error('Failed to load promotions:', error)
      } finally {
        setIsPromotionsLoading(false)
      }
    }

    loadPromotions()
  }, [fetchEvents])

  const visiblePromotions = promotions.filter((promotion) => promotion.active !== false)

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />
      <section
        id="home"
        className="relative isolate overflow-hidden px-4 pb-20 pt-14 md:px-8 md:pt-24"
      >
        <img
          src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1800&q=80"
          alt="Coffee beans and brewing setup"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-coffee-950/85 via-coffee-900/70 to-coffee-800/60"></div>
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6"
        >
          {/* <img
            src="/coffee%20lab%20(1).webp"
            alt="Coffee Lab emblem"
            className="h-12 w-auto rounded-md border border-gold/40 shadow-lg"
          /> */}
          <p className="rounded-full border border-gold/40 bg-gold/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cream">
            Premium Coffee Show
          </p>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-cream md:text-6xl">
            Where Coffee Meets Innovation
          </h1>
          <p className="max-w-2xl text-base text-cream/90 md:text-lg">
            Coffee Lab is an immersive coffee experience featuring modern brew artistry, curated
            events, and sensory storytelling.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#events">
              <Button>Explore Events</Button>
            </a>
            <Link to="/menu">
              <Button variant="secondary">View Menu</Button>
            </Link>
          </div>
        </Motion.div>
      </section>

      <SectionWrapper id="events" subtitle="Community" title="Upcoming Events">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, idx) => <SkeletonCard key={idx} />)
            : events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </SectionWrapper>

      <SectionWrapper id="highlights" subtitle="Featured" title="Promotion & Highlights">
        <div className="grid gap-6 lg:grid-cols-2">
          {isPromotionsLoading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="luxury-surface animate-pulse rounded-3xl border border-beige/60 bg-beige/10 p-6 shadow-xl dark:border-coffee-700"
              >
                <div className="mb-4 h-52 w-full rounded-3xl bg-beige/40 dark:bg-coffee-900" />
                <div className="space-y-3">
                  <div className="h-6 w-3/4 rounded-full bg-beige/40 dark:bg-coffee-900" />
                  <div className="h-4 w-full rounded-full bg-beige/40 dark:bg-coffee-900" />
                  <div className="h-10 w-24 rounded-full bg-beige/40 dark:bg-coffee-900" />
                </div>
              </div>
            ))
          ) : visiblePromotions.length > 0 ? (
            visiblePromotions.map((promotion) => (
              <article
                key={promotion.id}
                className="group overflow-hidden rounded-3xl border border-beige/60 bg-white shadow-xl transition hover:-translate-y-1 hover:border-gold/70 hover:shadow-2xl dark:border-coffee-700 dark:bg-coffee-950"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={promotion.image}
                    alt={promotion.title}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-coffee-950/75 via-coffee-950/10 to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {promotion.discountType && promotion.discountType !== 'none' && promotion.discountValue !== 0 ? (
                      <span className="rounded-full bg-gold/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-950">
                        {promotion.discountType === 'percentage'
                          ? `${promotion.discountValue}% Off`
                          : `$${promotion.discountValue} Off`}
                      </span>
                    ) :null}
                    <span className="rounded-full bg-beige/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-900 dark:bg-coffee-800 dark:text-cream">
                      {promotion.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-coffee-900 dark:text-cream">
                      {promotion.title}
                    </h3>
                    <p className="mt-2 text-sm text-coffee-700 dark:text-beige">{promotion.description}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-beige/70 p-4 text-sm text-coffee-900 dark:bg-coffee-900/70 dark:text-cream">
                      <span className="block text-xs uppercase tracking-[0.2em] text-coffee-700 dark:text-beige">Starts</span>
                      <span className="mt-1 block font-semibold">{formatDateTime(promotion.startAt)}</span>
                    </div>
                    <div className="rounded-3xl bg-beige/70 p-4 text-sm text-coffee-900 dark:bg-coffee-900/70 dark:text-cream">
                      <span className="block text-xs uppercase tracking-[0.2em] text-coffee-700 dark:text-beige">Ends</span>
                      <span className="mt-1 block font-semibold">{formatDateTime(promotion.endAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* <Button className="mt-2">View Offer</Button>
                    {promotion.publicId && (
                      <span className="rounded-full border border-beige/80 px-3 py-1 text-xs font-semibold text-coffee-700 dark:border-coffee-700 dark:text-beige">
                        {promotion.publicId}
                      </span>
                    )} */}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-coffee-700 dark:text-beige">No promotions available at the moment.</p>
          )}
        </div>
      </SectionWrapper>

      <SectionWrapper id="contact" subtitle="Connect" title="Contact Coffee Lab">
        <ContactAdmin/>
      </SectionWrapper>
    </main>
  )
}

export default HomePage
