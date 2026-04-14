import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { useCoffeeStore } from '../store/useCoffeeStore'
import {
  fetchEvents,
  fetchMenuItems,
  fetchPromotions,
  createEvent,
  updateEvent,
  deleteEvent,
  createPromotion,
  updatePromotion,
  deletePromotion,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../api/apiClient'

const tabs = [
  { value: 'events', label: 'Events' },
  { value: 'promotions', label: 'Promotions' },
  { value: 'menu', label: 'Menu Items' },
]

const emptyForms = {
  events: {
    title: '',
    startsAt: '',
    description: '',
    imageFile: null,
  },
  promotions: {
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '0',
    startAt: '',
    endAt: '',
    imageFile: null,
  },
  menu: {
    category: 'Coffee',
    name: '',
    description: '',
    price: '',
    imageFile: null,
  },
}

function formatPriceForForm(price) {
  if (!price) return ''
  const numeric = Number(String(price).replace(/[^0-9.]/g, ''))
  return Number.isFinite(numeric) ? numeric.toFixed(2) : ''
}

function mapItemToForm(tab, item) {
  if (tab === 'events') {
    return {
      title: item.title || '',
      startsAt: item.startsAt || item.startAt || item.date || '',
      description: item.description || '',
      imageFile: null,
    }
  }

  if (tab === 'promotions') {
    return {
      title: item.title || '',
      description: item.description || '',
      discountType: item.discountType || 'percentage',
      discountValue: String(item.discountValue ?? item.value ?? 0),
      startAt: item.startAt || item.startsAt || '',
      endAt: item.endAt || item.expiresAt || '',
      imageFile: null,
    }
  }

  return {
    category: item.category || 'Coffee',
    name: item.name || '',
    description: item.description || '',
    price: formatPriceForForm(item.price),
    imageFile: null,
  }
}

function CRUDPage() {
  const { authToken, user } = useCoffeeStore()
  const isAdmin = sessionStorage.getItem('coffeeLabUserRole') === 'admin'
  const [activeTab, setActiveTab] = useState('events')
  const [events, setEvents] = useState([])
  const [promotions, setPromotions] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [form, setForm] = useState(emptyForms.events)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    loadData()
  }, [isAdmin])

  useEffect(() => {
    setSelectedItem(null)
    setForm(emptyForms[activeTab])
    setMessage('')
    setError('')
  }, [activeTab])

  const loadData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [eventsData, promotionsData, menuData] = await Promise.all([
        fetchEvents(),
        fetchPromotions(),
        fetchMenuItems(),
      ])
      setEvents(eventsData)
      setPromotions(promotionsData)
      setMenuItems(menuData)
    } catch (err) {
      setError(err.message || 'Failed to load admin data.')
    } finally {
      setIsLoading(false)
    }
  }

  const currentItems =
    activeTab === 'events'
      ? events
      : activeTab === 'promotions'
      ? promotions
      : menuItems

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectItem = (item) => {
    setSelectedItem(item)
    setForm(mapItemToForm(activeTab, item))
    setMessage('')
    setError('')
  }

  const resetForm = () => {
    setSelectedItem(null)
    setForm(emptyForms[activeTab])
    setMessage('')
    setError('')
  }

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this item permanently?')) return
    setIsSaving(true)
    setError('')
    try {
      if (activeTab === 'events') {
        await deleteEvent(authToken, item.id)
      } else if (activeTab === 'promotions') {
        await deletePromotion(authToken, item.id)
      } else {
        await deleteMenuItem(authToken, item.id)
      }
      setMessage('Item deleted successfully.')
      await loadData()
      resetForm()
    } catch (err) {
      setError(err.message || 'Failed to delete item.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      if (activeTab === 'events') {
        const payload = {
          title: form.title,
          startsAt: form.startsAt,
          description: form.description,
          imageFile: form.imageFile,
        }
        if (selectedItem) {
          await updateEvent(authToken, selectedItem.id, payload)
          setMessage('Event updated successfully.')
        } else {
          await createEvent(authToken, payload)
          setMessage('Event created successfully.')
        }
      } else if (activeTab === 'promotions') {
        const payload = {
          title: form.title,
          description: form.description,
          discountType: form.discountType,
          discountValue: form.discountValue,
          startAt: form.startAt,
          endAt: form.endAt,
          imageFile: form.imageFile,
        }
        if (selectedItem) {
          await updatePromotion(authToken, selectedItem.id, payload)
          setMessage('Promotion updated successfully.')
        } else {
          await createPromotion(authToken, payload)
          setMessage('Promotion created successfully.')
        }
      } else {
        const priceCents = Math.round(Number(form.price || '0') * 100)
        const payload = {
          category: form.category,
          name: form.name,
          description: form.description,
          priceCents,
          imageFile: form.imageFile,
        }
        if (selectedItem) {
          await updateMenuItem(authToken, selectedItem.id, payload)
          setMessage('Menu item updated successfully.')
        } else {
          await createMenuItem(authToken, payload)
          setMessage('Menu item created successfully.')
        }
      }
      await loadData()
      if (!selectedItem) {
        resetForm()
      }
    } catch (err) {
      setError(err.message || 'Failed to save item.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-transparent">
        <Navbar />
        <section className="mx-auto max-w-5xl px-4 py-16 text-center md:px-8">
          <div className="luxury-surface rounded-3xl border border-beige/60 bg-white/90 p-12 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
            <h1 className="mb-4 text-3xl font-semibold text-coffee-900 dark:text-cream">Admin Access Required</h1>
            <p className="text-sm text-coffee-700 dark:text-beige">
              You must be signed in as an admin to access CRUD operations for events, promotions, and menu items.
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-beige/60 bg-white/90 p-6 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-coffee-900 dark:text-cream">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-coffee-700 dark:text-beige">
                Manage events, promotions, and menu items for the Coffee Lab backend.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.value
                      ? 'bg-coffee-800 text-cream'
                      : 'bg-beige/80 text-coffee-900 hover:bg-beige dark:bg-coffee-900/80 dark:text-cream'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {message && <p className="text-sm text-green-700 dark:text-green-300">{message}</p>}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="luxury-surface rounded-3xl border border-beige/60 bg-white/90 p-6 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
            <h2 className="mb-4 text-xl font-semibold text-coffee-900 dark:text-cream">{tabs.find((item) => item.value === activeTab)?.label}</h2>
            {isLoading ? (
              <p className="text-sm text-coffee-700 dark:text-beige">Loading records...</p>
            ) : currentItems.length === 0 ? (
              <p className="text-sm text-coffee-700 dark:text-beige">No records found.</p>
            ) : (
              <div className="space-y-3">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-3xl border border-beige/50 bg-beige/10 p-4 transition hover:border-gold hover:bg-gold/10 dark:border-coffee-700 dark:bg-coffee-900/70"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-coffee-900 dark:text-cream">
                          {activeTab === 'menu'
                            ? item.name
                            : activeTab === 'promotions'
                            ? item.title
                            : item.title}
                        </p>
                        <p className="text-sm text-coffee-700 dark:text-beige">
                          {activeTab === 'menu'
                            ? item.category
                            : activeTab === 'promotions'
                            ? `${item.discountType} — ${item.discountValue}`
                            : item.startsAt || item.date}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectItem(item)}
                          className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-coffee-900 transition hover:brightness-110"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-coffee-700 dark:text-beige">
                      {activeTab === 'menu'
                        ? item.description
                        : activeTab === 'promotions'
                        ? item.description
                        : item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="luxury-surface rounded-3xl border border-beige/60 bg-white/90 p-6 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-coffee-900 dark:text-cream">
                  {selectedItem ? 'Edit' : 'Create'}{' '}
                  {tabs.find((item) => item.value === activeTab)?.label.slice(0, -1)}
                </h2>
                <p className="text-sm text-coffee-700 dark:text-beige">
                  {selectedItem
                    ? 'Update the selected record and save your changes.'
                    : 'Fill in the details and create a new record.'}
                </p>
              </div>
              {selectedItem && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Clear
                </Button>
              )}
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {activeTab === 'events' && (
                <>
                  <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                    Title
                    <input
                      value={form.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      required
                      className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                    />
                  </label>
                  <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                    Starts at
                    <input
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(e) => handleFieldChange('startsAt', e.target.value)}
                      required
                      className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                    />
                  </label>
                  <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                    Description
                    <textarea
                      value={form.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={4}
                      className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                    />
                  </label>
                  <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFieldChange('imageFile', e.target.files?.[0] || null)}
                      className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition file:cursor-pointer file:border-none file:bg-gold file:px-4 file:py-2 file:text-coffee-900 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                    />
                  </label>
                </>
              )}

              {activeTab === 'promotions' && (
                <>
                  <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                    Title
                    <input
                      value={form.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      required
                      className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                    />
                  </label>
                  <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                    Description
                    <textarea
                      value={form.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                    />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                      Discount type
                      <select
                        value={form.discountType}
                        onChange={(e) => handleFieldChange('discountType', e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed amount</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                      Discount value
                      <input
                        type="number"
                        value={form.discountValue}
                        min="0"
                        onChange={(e) => handleFieldChange('discountValue', e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                      Start date
                      <input
                        type="datetime-local"
                        value={form.startAt}
                        onChange={(e) => handleFieldChange('startAt', e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                      />
                    </label>
                    <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                      End date
                      <input
                        type="datetime-local"
                        value={form.endAt}
                        onChange={(e) => handleFieldChange('endAt', e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                      />
                    </label>
                  </div>
                  <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFieldChange('imageFile', e.target.files?.[0] || null)}
                      required={!selectedItem}
                      className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition file:cursor-pointer file:border-none file:bg-gold file:px-4 file:py-2 file:text-coffee-900 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                    />
                  </label>
                </>
              )}

              {activeTab === 'menu' && (
                <>
                  <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                    Category
                    <select
                      value={form.category}
                      onChange={(e) => handleFieldChange('category', e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                    >
                      <option value="Hot Drinks">Hot Drinks</option>
                      <option value="Cold Drinks">Cold Drinks</option>
                      <option value="Pastries / Snacks">Pastries / Snacks</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                    Name
                    <input
                      value={form.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      required
                      className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                    />
                  </label>
                  <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                    Description
                    <textarea
                      value={form.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                    />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                      Price ($)
                      <input
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => handleFieldChange('price', e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                      />
                    </label>
                  </div>
                  <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFieldChange('imageFile', e.target.files?.[0] || null)}
                      className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition file:cursor-pointer file:border-none file:bg-gold file:px-4 file:py-2 file:text-coffee-900 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                    />
                  </label>
                </>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : selectedItem ? 'Update Record' : 'Create Record'}
                </Button>
                {selectedItem && (
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    New Entry
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

export default CRUDPage
