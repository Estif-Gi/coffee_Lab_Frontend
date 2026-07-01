import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import { fetchActiveOrders, fetchServedOrders, updateOrderServed } from '../api/apiClient'
import { useCoffeeStore } from '../store/useCoffeeStore'

function groupByIdentifier(orders) {
  return orders.reduce((groups, order) => {
    const key = order.identifr || 'No identifier'
    if (!groups[key]) {
      groups[key] = {
        identifr: key,
        orders: [],
        items: [],
        createdAt: order.createdAt,
      }
    }
    groups[key].orders.push(order)
    groups[key].items.push(...(order.items || [order]))
    if (order.createdAt && (!groups[key].createdAt || new Date(order.createdAt) < new Date(groups[key].createdAt))) {
      groups[key].createdAt = order.createdAt
    }
    return groups
  }, {})
}

function AdminOrdersPage() {
  const { authToken, user } = useCoffeeStore()
  const isAdmin = user?.role === 'admin' || sessionStorage.getItem('coffeeLabUserRole') === 'admin'
  const [activeOrders, setActiveOrders] = useState([])
  const [servedOrders, setServedOrders] = useState([])
  const [showServed, setShowServed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const groupedOrders = useMemo(() => Object.values(groupByIdentifier(activeOrders)), [activeOrders])

  const loadOrders = async ({ quiet = false } = {}) => {
    if (!authToken || !isAdmin) return
    if (!quiet) setIsLoading(true)
    setError('')
    try {
      const [active, served] = await Promise.all([
        fetchActiveOrders(authToken),
        fetchServedOrders(authToken),
      ])
      setActiveOrders(active)
      setServedOrders(served.slice(0, 20))
    } catch (err) {
      setError(err.message || 'Failed to load orders.')
    } finally {
      if (!quiet) setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    const poll = window.setInterval(() => loadOrders({ quiet: true }), 7000)
    return () => window.clearInterval(poll)
  }, [authToken, isAdmin])

  const handleMarkServed = async (group) => {
    const previousActive = activeOrders
    const previousServed = servedOrders
    const servedIds = new Set(group.orders.map((order) => order.id))
    setActiveOrders((orders) => orders.filter((item) => !servedIds.has(item.id)))
    setServedOrders((orders) => [
      ...group.orders.map((order) => ({ ...order, isServed: true })),
      ...orders,
    ].slice(0, 20))
    setError('')

    try {
      await Promise.all(group.orders.map((order) => updateOrderServed(authToken, order.id, true)))
    } catch (err) {
      setActiveOrders(previousActive)
      setServedOrders(previousServed)
      setError(err.message || 'Failed to mark order as served.')
    }
  }

  if (!authToken || !isAdmin) {
    return (
      <main className="min-h-screen bg-transparent">
        <Navbar />
        <section className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8">
          <div className="luxury-surface rounded-3xl border border-beige/60 bg-white/90 p-10 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
            <h1 className="text-3xl font-semibold text-coffee-900 dark:text-cream">Admin Access Required</h1>
            <p className="mt-3 text-sm text-coffee-700 dark:text-beige">
              Sign in as an admin to view and manage the kitchen queue.
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
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-beige/60 bg-white/90 p-6 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-coffee-900 dark:text-cream">Kitchen Orders</h1>
            <p className="mt-2 text-sm text-coffee-700 dark:text-beige">
              Active orders refresh automatically every 7 seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadOrders()}
            className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-coffee-900 shadow-lg transition hover:brightness-110"
          >
            Refresh
          </button>
        </div>

        {error && <p className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</p>}

        {isLoading ? (
          <p className="rounded-3xl border border-beige/60 bg-white/90 p-6 text-sm text-coffee-700 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90 dark:text-beige">
            Loading kitchen queue...
          </p>
        ) : activeOrders.length === 0 ? (
          <p className="rounded-3xl border border-beige/60 bg-white/90 p-6 text-sm text-coffee-700 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90 dark:text-beige">
            No active orders right now.
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {groupedOrders.map((group) => (
              <section key={group.identifr} className="rounded-3xl border border-beige/60 bg-white/90 p-5 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-coffee-900 dark:text-cream">{group.identifr}</h2>
                  <span className="rounded-full bg-beige/70 px-3 py-1 text-xs font-semibold text-coffee-800 dark:bg-coffee-800 dark:text-cream">
                    {group.items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)} item{group.items.reduce((sum, item) => sum + Number(item.quantity || 1), 0) === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="space-y-3">
                  {group.items.map((item, index) => (
                    <article key={`${item.id}-${index}`} className="rounded-2xl border border-beige/60 bg-beige/10 p-4 dark:border-coffee-700 dark:bg-coffee-900/70">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-coffee-900 dark:text-cream">{item.name}</h3>
                          <p className="mt-1 text-sm text-coffee-700 dark:text-beige">{item.category} · x{item.quantity || 1}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-coffee-900 dark:text-cream">
                          ${((Number(item.priceCents || 0) * Number(item.quantity || 1)) / 100).toFixed(2)}
                        </p>
                      </div>
                    </article>
                  ))}
                  <div className="flex items-center justify-between border-t border-beige/70 pt-4 text-sm font-semibold text-coffee-900 dark:border-coffee-700 dark:text-cream">
                    <span>Total</span>
                    <span>${(group.items.reduce((sum, item) => sum + Number(item.priceCents || 0) * Number(item.quantity || 1), 0) / 100).toFixed(2)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMarkServed(group)}
                    className="w-full rounded-full bg-coffee-800 px-4 py-3 text-sm font-semibold text-cream transition hover:bg-coffee-700"
                  >
                    Mark as Served
                  </button>
                </div>
              </section>
            ))}
          </div>
        )}

        <section className="mt-8 rounded-3xl border border-beige/60 bg-white/90 p-5 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
          <button
            type="button"
            onClick={() => setShowServed((value) => !value)}
            className="flex w-full items-center justify-between text-left text-lg font-semibold text-coffee-900 dark:text-cream"
          >
            Recently Served
            <span className="text-sm">{showServed ? 'Hide' : 'Show'}</span>
          </button>
          {showServed && (
            <div className="mt-4 divide-y divide-beige/70 dark:divide-coffee-700">
              {servedOrders.length === 0 ? (
                <p className="py-3 text-sm text-coffee-700 dark:text-beige">No served orders yet.</p>
              ) : (
                servedOrders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-coffee-900 dark:text-cream">{order.identifr}</p>
                      <p className="text-sm text-coffee-700 dark:text-beige">
                        {(order.items || [order]).map((item) => `${item.name} x${item.quantity || 1}`).join(', ')}
                      </p>
                    </div>
                    <p className="text-sm text-coffee-700 dark:text-beige">
                      ${((order.items || [order]).reduce((sum, item) => sum + Number(item.priceCents || 0) * Number(item.quantity || 1), 0) / 100).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default AdminOrdersPage
