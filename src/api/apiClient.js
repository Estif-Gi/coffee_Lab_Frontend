const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
function formatPrice(item) {
  if (typeof item.price === 'number') return `$${(item.price / 100).toFixed(2)}`
  if (typeof item.price === 'string' && item.price.trim()) {
    return item.price.startsWith('$') ? item.price : `$${item.price}`
  }
  if (typeof item.priceCents === 'number') return `$${(item.priceCents / 100).toFixed(2)}`
  if (typeof item.priceCents === 'string' && item.priceCents.trim()) {
    const cents = Number(item.priceCents)
    return Number.isFinite(cents) ? `$${(cents / 100).toFixed(2)}` : '$0.00'
  }
  return '$0.00'
}

function formatDate(value) {
  if (!value) return 'TBD'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function normalizeMenuItems(data) {
  const items = Array.isArray(data)
    ? data
    : data?.data || data?.items || data?.menu || []

  return items.map((item) => ({
    id: item.id || item._id || item.name,
    category: item.category || 'Hot Drinks',
    name: item.name || 'Unnamed Item',
    description: item.description || item.desc || '',
    price: formatPrice(item),
    priceCents: Number(item.priceCents ?? item.price ?? 0),
    featured: item.featured ?? false,
    imageUrl: item.imageUrl || item.image || '',
    publicId: item.publicId || '',
    available: item.available ?? true,
    sortOrder: item.sortOrder ?? 0,
  }))
}

function formatLocation(value) {
  if (!value) return 'Coffee Lab Studio, Downtown'
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if ('address' in value && typeof value.address === 'string') return value.address
    const lat = value.latitude ?? value.lat
    const lng = value.longitude ?? value.lng
    if (typeof lat === 'number' && typeof lng === 'number') {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
    return JSON.stringify(value)
  }
  return 'Coffee Lab Studio, Downtown'
}

function normalizeEvents(data) {
  const items = Array.isArray(data)
    ? data
    : data?.data || data?.items || data?.events || []

  return items.map((item) => ({
    id: item.id || item._id || item.title,
    title: item.title || 'Untitled Event',
    description: item.description || '',
    image: item.image || item.imageUrl ||
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    date: formatDate(item.startsAt || item.startAt || item.date),
    location: formatLocation(item.location),
  }))
}

async function requestApi(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  if (!response.ok) {
    const errorPayload = await response.text().catch(() => '')
    let message = `API request failed: ${response.status} ${response.statusText}`
    try {
      const parsed = JSON.parse(errorPayload)
      message = parsed.message || parsed.error || message
    } catch {
      if (errorPayload) message = `${message} ${errorPayload}`
    }
    throw new Error(message)
  }
  return response.json()
}

function makeRequestOptions(token, method = 'GET', body = undefined, headers = {}) {
  const options = { method, headers: { ...headers } }
  if (token) {
    options.headers.Authorization = `Bearer ${token}`
  }
  if (body !== undefined) {
    if (body instanceof FormData) {
      options.body = body
    } else {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(body)
    }
  }
  return options
}

export async function fetchMenuItems() {
  const data = await requestApi('/api/menu')
  return normalizeMenuItems(data)
}

export async function fetchEvents() {
  const data = await requestApi('/api/events')
  return normalizeEvents(data)
}

function normalizePromotions(data) {
  const rawItems = Array.isArray(data)
    ? data
    : data?.data || data?.items || data?.promotions || []

  const items = Array.isArray(rawItems)
    ? rawItems
    : rawItems
    ? [rawItems]
    : []

  return items.map((item) => ({
    id: item.id || item._id || item.title,
    title: item.title || 'Untitled Promotion',
    description: item.description || '',
    image:
      item.image || item.imageUrl || item.imageUrl?.url ||
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80',
    imageUrl: item.imageUrl || item.image || '',
    publicId: item.publicId || item.public_id || '',
    discountType: item.discountType || item.type || 'percentage',
    discountValue: item.discountValue ?? item.value ?? 0,
    startAt: item.startAt || item.startsAt || item.start || '',
    endAt: item.endAt || item.expiresAt || item.end || '',
    active: item.active ?? true,
  }))
}

export async function fetchPromotions() {
  const data = await requestApi('/api/promotions')
  return normalizePromotions(data)
}

export async function createMenuItem(token, item) {
  const formData = new FormData()
  formData.append('category', item.category)
  formData.append('name', item.name)
  formData.append('description', item.description)
  formData.append('priceCents', item.priceCents)
  if (item.imageUrl) formData.append('imageUrl', item.imageUrl)
  if (item.imageFile) formData.append('image', item.imageFile)
  return requestApi('/api/menu', makeRequestOptions(token, 'POST', formData))
}

export async function updateMenuItem(token, itemId, item) {
  const formData = new FormData()
  formData.append('category', item.category)
  formData.append('name', item.name)
  formData.append('description', item.description)
  formData.append('priceCents', item.priceCents)
  if (item.imageUrl) formData.append('imageUrl', item.imageUrl)
  if (item.imageFile) formData.append('image', item.imageFile)
  return requestApi(`/api/menu/${itemId}`, makeRequestOptions(token, 'PATCH', formData))
}

export async function deleteMenuItem(token, itemId) {
  return requestApi(`/api/menu/${itemId}`, makeRequestOptions(token, 'DELETE'))
}

export async function createEvent(token, event) {
  const formData = new FormData()
  formData.append('title', event.title)
  formData.append('startsAt', event.startsAt)
  formData.append('description', event.description)
  if (event.imageUrl) formData.append('image', event.imageUrl)
  if (event.imageFile) formData.append('image', event.imageFile)
  return requestApi('/api/events', makeRequestOptions(token, 'POST', formData))
}

export async function updateEvent(token, eventId, event) {
  const formData = new FormData()
  formData.append('title', event.title)
  formData.append('startsAt', event.startsAt)
  formData.append('description', event.description)
  if (event.imageUrl) formData.append('image', event.imageUrl)
  if (event.imageFile) formData.append('image', event.imageFile)
  return requestApi(`/api/events/${eventId}`, makeRequestOptions(token, 'PATCH', formData))
}

export async function deleteEvent(token, eventId) {
  return requestApi(`/api/events/${eventId}`, makeRequestOptions(token, 'DELETE'))
}

export async function createPromotion(token, promo) {
  const formData = new FormData()
  formData.append('title', promo.title)
  formData.append('description', promo.description)
  formData.append('discountType', promo.discountType)
  formData.append('discountValue', String(promo.discountValue))
  formData.append('startAt', promo.startAt)
  formData.append('endAt', promo.endAt)
  if (promo.imageFile) formData.append('image', promo.imageFile)
  return requestApi('/api/promotions', makeRequestOptions(token, 'POST', formData))
}

export async function updatePromotion(token, promoId, promo) {
  const formData = new FormData()
  formData.append('title', promo.title)
  formData.append('description', promo.description)
  formData.append('discountType', promo.discountType)
  formData.append('discountValue', String(promo.discountValue))
  formData.append('startAt', promo.startAt)
  formData.append('endAt', promo.endAt)
  if (promo.imageFile) formData.append('image', promo.imageFile)
  return requestApi(`/api/promotions/${promoId}`, makeRequestOptions(token, 'PATCH', formData))
}

export async function deletePromotion(token, promoId) {
  return requestApi(`/api/promotions/${promoId}`, makeRequestOptions(token, 'DELETE'))
}

function normalizeOrders(data) {
  const rawItems = Array.isArray(data)
    ? data
    : data?.data || data?.items || data?.orders || []

  return rawItems.map((item) => {
    const orderItems = Array.isArray(item.items) && item.items.length > 0
      ? item.items
      : [item]

    return {
      id: item.id || item._id,
      menuItemId: item.menuItemId,
      category: item.category || 'Hot Drinks',
      name: item.name || 'Unnamed Item',
      description: item.description || '',
      price: formatPrice(item),
      priceCents: Number(item.priceCents ?? 0),
      identifr: item.identifr || '',
      isServed: item.isServed ?? false,
      createdAt: item.createdAt || '',
      items: orderItems.map((orderItem) => ({
        id: orderItem.menuItemId || orderItem.id || orderItem._id || orderItem.name,
        menuItemId: orderItem.menuItemId,
        category: orderItem.category || 'Hot Drinks',
        name: orderItem.name || 'Unnamed Item',
        description: orderItem.description || '',
        price: formatPrice(orderItem),
        priceCents: Number(orderItem.priceCents ?? 0),
        quantity: Number(orderItem.quantity || 1),
      })),
    }
  })
}

export async function createOrder(token, order) {
  return requestApi('/api/orders', makeRequestOptions(token, 'POST', order))
}

export async function fetchActiveOrders(token) {
  const data = await requestApi('/api/orders/active', makeRequestOptions(token))
  return normalizeOrders(data)
}

export async function fetchServedOrders(token) {
  const data = await requestApi('/api/orders/served', makeRequestOptions(token))
  return normalizeOrders(data)
}

export async function updateOrderServed(token, orderId, isServed) {
  return requestApi(`/api/orders/${orderId}`, makeRequestOptions(token, 'PATCH', { isServed }))
}

export async function signupUser(payload) {
  return requestApi('/api/users/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function loginUser(payload) {
  return requestApi('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
