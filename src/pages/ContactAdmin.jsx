import { useState } from 'react'

const TELEGRAM_KEY = import.meta.env.VITE_TELEGRAM_KEY
const TELEGRAM_EST_ID = import.meta.env.VITE_TELEGRAM_EST_ID
const TELEGRAM_G_ID = import.meta.env.VITE_TELEGRAM_G_ID

const ContactAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    // email: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const payload = {
      name: formData.name.trim(),
      // email: formData.email.trim(),
      message: formData.message.trim(),
    }

    if (!payload.name || !payload.message) {
      setError('Please provide your name and a message.')
      setLoading(false)
      return
    }

    const text = [
      '📩 New text to Coffee Lab',
      '',
      `👤 From: ${payload.name}`,
      // `✉️ Email: ${payload.email || '—'}`,
      '',
      '💬 Message:',
      payload.message,
    ].join('\n')

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_KEY}/sendMessage?chat_id=${TELEGRAM_G_ID}&text=${encodeURIComponent(text)}`

    try {
      const response = await fetch(telegramUrl)
      const data = await response.json()
      if (!response.ok || data.ok === false) {
        throw new Error(data.description || 'Telegram send failed')
      }

      setSent(true)
      setFormData({ name: '', message: '' })
    } catch (err) {
      console.error('Telegram notification failed:', err)
      setError('Unable to send your message. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="luxury-surface space-y-4 rounded-3xl border border-beige/60 p-6 shadow-lg dark:border-coffee-700"
      >
        {sent ? (
          <div className="rounded-3xl bg-emerald-500/10 p-6 text-center text-sm text-emerald-200">
            Thank you! Your message has been sent.
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
              required
            />
            {/* <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
            /> */}
            <textarea
              rows="4"
              placeholder="Message"
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold tracking-wide text-coffee-900 shadow-lg transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Sending…' : 'Send Message'}
            </button>
          </>
        )}
      </form>

      <div className="luxury-surface rounded-3xl border border-beige/60 p-6 shadow-lg dark:border-coffee-700">
        <h3 className="mb-3 text-xl font-semibold text-coffee-900 dark:text-cream">Visit Us</h3>
        <p className="mb-4 text-sm text-coffee-700 dark:text-beige">
          Gemo 1 condominium, Addis Ababa, Ethiopia
        </p>
        <div className="overflow-hidden rounded-2xl border border-beige/30 bg-black/50">
          <iframe
            title="Coffee Lab Location"
            src="https://maps.google.com/maps?q=XP47%2B576+Coffee+lab,+Addis+Ababa&output=embed"
            className="h-52 w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          <a
            href="https://maps.app.goo.gl/jwAo8vwG1Cau12SeA"
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-amber-400 hover:text-amber-300"
          >
            Open exact pinned location in Google Maps
          </a>
        </p>
        <div className="mt-4 flex gap-3 text-sm text-coffee-700 dark:text-beige">
          <a href='https://www.instagram.com/coffeelab.eth?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' target='_blank' className="rounded-full border border-beige px-3 py-1">Instagram</a>
          <a href='https://www.tiktok.com/@coffee.lab5?is_from_webapp=1&sender_device=pc' target='_blank' className="rounded-full border border-beige px-3 py-1">TikTok</a>
          <span className="rounded-full border border-beige px-3 py-1">X</span>
        </div>
      </div>
    </div>
  )
}


export default ContactAdmin