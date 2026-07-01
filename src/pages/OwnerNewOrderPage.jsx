import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import { createOrder, fetchMenuItems } from '../api/apiClient'
import { useCoffeeStore } from '../store/useCoffeeStore'

const roleCanCreate = (role) => ['admin', 'owner', 'owuner'].includes(role)

function groupMenuItems(items) {
  return items.reduce((groups, item) => {
    const category = item.category || 'Hot Drinks'
    if (!groups[category]) groups[category] = []
    groups[category].push(item)
    return groups
  }, {})
}

function OwnerNewOrderPage() {
  const { authToken, user } = useCoffeeStore()
  const role = user?.role || sessionStorage.getItem('coffeeLabUserRole')
  const [menuItems, setMenuItems] = useState([])
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState([])
  const [selectedQuantities, setSelectedQuantities] = useState({})
  const [orderItems, setOrderItems] = useState([])
  const [identifr, setIdentifr] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const groupedMenu = useMemo(() => groupMenuItems(menuItems.filter((item) => item.available)), [menuItems])
  const selectedMenuItems = menuItems.filter((item) => selectedMenuItemIds.includes(item.id))
  const orderTotal = orderItems.reduce((total, item) => total + Number(item.priceCents || 0) * Number(item.quantity || 1), 0)

  useEffect(() => {
    let isMounted = true
    async function loadMenu() {
      setIsLoading(true)
      setError('')
      try {
        const items = await fetchMenuItems()
        if (isMounted) setMenuItems(items)
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load menu items.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadMenu()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (orderItems.length === 0) {
      setError('Add at least one menu item before creating the order.')
      return
    }
    if (!identifr.trim()) {
      setError('Enter an identifier for this order.')
      return
    }

    setIsSaving(true)
    try {
      await createOrder(authToken, {
        items: orderItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
        identifr: identifr.trim(),
      })
      setSelectedMenuItemIds([])
      setSelectedQuantities({})
      setOrderItems([])
      setIdentifr('')
      setMessage('Order created. Ready for the next one.')
    } catch (err) {
      setError(err.message || 'Failed to create order.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddItem = () => {
    setMessage('')
    setError('')
    if (selectedMenuItems.length === 0) {
      setError('Tick at least one menu item to add.')
      return
    }
    setOrderItems((items) => [
      ...items,
      ...selectedMenuItems.map((item) => ({
        ...item,
        quantity: Number(selectedQuantities[item.id] || 1),
      })),
    ])
    setSelectedMenuItemIds([])
    setSelectedQuantities({})
  }

  const handleToggleMenuItem = (itemId) => {
    setSelectedMenuItemIds((itemIds) => {
      if (itemIds.includes(itemId)) {
        setSelectedQuantities((quantities) => {
          const next = { ...quantities }
          delete next[itemId]
          return next
        })
        return itemIds.filter((id) => id !== itemId)
      }
      setSelectedQuantities((quantities) => ({ ...quantities, [itemId]: quantities[itemId] || 1 }))
      return [...itemIds, itemId]
    })
  }

  const handleQuantityChange = (itemId, value) => {
    const quantity = Math.max(1, Number(value || 1))
    setSelectedQuantities((quantities) => ({ ...quantities, [itemId]: quantity }))
  }

  const handleRemoveItem = (indexToRemove) => {
    setOrderItems((items) => items.filter((_, index) => index !== indexToRemove))
  }

  if (!authToken || !roleCanCreate(role)) {
    return (
      <main className="min-h-screen bg-transparent">
        <Navbar />
        <section className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8">
          <div className="luxury-surface rounded-3xl border border-beige/60 bg-white/90 p-10 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
            <h1 className="text-3xl font-semibold text-coffee-900 dark:text-cream">Owner Access Required</h1>
            <p className="mt-3 text-sm text-coffee-700 dark:text-beige">
              Sign in as an owner to create orders for the kitchen queue.
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="mb-6 rounded-3xl border border-beige/60 bg-white/90 p-6 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
          <h1 className="text-3xl font-semibold text-coffee-900 dark:text-cream">New Order</h1>
          <p className="mt-2 text-sm text-coffee-700 dark:text-beige">
            Pick one or more available menu items and assign a table or order identifier.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <form onSubmit={handleSubmit} className="luxury-surface rounded-3xl border border-beige/60 bg-white/90 p-6 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-coffee-900 dark:text-cream">Menu items</p>
                  <span className="rounded-full bg-beige/80 px-3 py-1 text-xs font-semibold text-coffee-800 dark:bg-coffee-800 dark:text-cream">
                    {selectedMenuItemIds.length} selected
                  </span>
                </div>
                {isLoading ? (
                  <p className="rounded-2xl border border-beige/60 bg-white/70 px-4 py-3 text-sm text-coffee-700 dark:border-coffee-700 dark:bg-coffee-900/70 dark:text-beige">
                    Loading menu...
                  </p>
                ) : (
                  <div className="max-h-[420px] space-y-4 overflow-y-auto rounded-2xl border border-beige/60 bg-white/70 p-4 dark:border-coffee-700 dark:bg-coffee-900/70">
                    {Object.entries(groupedMenu).map(([category, items]) => (
                      <section key={category}>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-coffee-700 dark:text-beige">
                          {category}
                        </h3>
                        <div className="space-y-2">
                          {items.map((item) => {
                            const checked = selectedMenuItemIds.includes(item.id)
                            return (
                              <label
                                key={item.id}
                                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${
                                  checked
                                    ? 'border-gold bg-gold/15'
                                    : 'border-beige/60 bg-beige/10 hover:border-gold/70 dark:border-coffee-700 dark:bg-coffee-950/60'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleToggleMenuItem(item.id)}
                                  className="mt-1 h-4 w-4 accent-gold"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-start justify-between gap-3">
                                    <span className="font-semibold text-coffee-900 dark:text-cream">{item.name}</span>
                                    <span className="shrink-0 text-sm font-semibold text-coffee-900 dark:text-cream">{item.price}</span>
                                  </span>
                                  <span className="mt-1 block text-sm text-coffee-700 dark:text-beige">{item.description}</span>
                                  {checked && (
                                    <span className="mt-3 flex items-center gap-2 text-sm font-medium text-coffee-900 dark:text-cream">
                                      Count
                                      <input
                                        type="number"
                                        min="1"
                                        value={selectedQuantities[item.id] || 1}
                                        onChange={(event) => handleQuantityChange(item.id, event.target.value)}
                                        onClick={(event) => event.stopPropagation()}
                                        className="h-10 w-20 rounded-xl border border-beige bg-white px-3 text-sm text-coffee-900 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                                      />
                                    </span>
                                  )}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                disabled={isLoading || selectedMenuItemIds.length === 0}
                className="rounded-full bg-coffee-800 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-coffee-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add Item{selectedMenuItemIds.length === 1 ? '' : 's'}
              </button>

              <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
                Identifier
                <input
                  value={identifr}
                  onChange={(event) => setIdentifr(event.target.value)}
                  placeholder="T1, T2, Alex, Window"
                  className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
                />
              </label>

              {message && <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-200">{message}</p>}
              {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</p>}

              <Button type="submit" disabled={isSaving || isLoading}>
                {isSaving ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
          </form>

          <aside className="rounded-3xl border border-beige/60 bg-white/90 p-6 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-coffee-900 dark:text-cream">Current Order</h2>
              <span className="rounded-full bg-beige/80 px-3 py-1 text-xs font-semibold text-coffee-800 dark:bg-coffee-800 dark:text-cream">
                {orderItems.length} item{orderItems.length === 1 ? '' : 's'}
              </span>
            </div>
            {orderItems.length > 0 ? (
              <div className="mt-4 space-y-3">
                {orderItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="rounded-2xl border border-beige/60 bg-beige/10 p-4 dark:border-coffee-700 dark:bg-coffee-900/70">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-coffee-900 dark:text-cream">{item.name}</p>
                        <p className="mt-1 text-sm text-coffee-700 dark:text-beige">{item.category} · x{item.quantity || 1}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-coffee-700 dark:text-beige">{item.description}</p>
                    <p className="mt-2 text-sm font-semibold text-coffee-900 dark:text-cream">
                      ${((Number(item.priceCents || 0) * Number(item.quantity || 1)) / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-beige/70 pt-4 text-sm font-semibold text-coffee-900 dark:border-coffee-700 dark:text-cream">
                  <span>Total</span>
                  <span>${(orderTotal / 100).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-coffee-700 dark:text-beige">Add items to build this customer order.</p>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}

export default OwnerNewOrderPage
