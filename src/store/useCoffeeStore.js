import { create } from 'zustand'
import { fetchEvents, fetchMenuItems, loginUser, signupUser } from '../api/apiClient'

const storedToken = typeof window !== 'undefined' ? localStorage.getItem('coffeeLabToken') : null
const storedUser = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('coffeeLabUser') || 'null') : null

const eventSeed = [
  {
    id: 1,
    title: 'Latte Art Masterclass',
    date: 'Apr 18, 2026 - 6:00 PM',
    location: 'Coffee Lab Studio, Downtown',
    description: 'Hands-on workshop on advanced latte textures and pours.',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: 'Cold Brew Innovation Night',
    date: 'Apr 24, 2026 - 7:30 PM',
    location: 'Innovation Stage',
    description: 'Explore extraction science and modern cold coffee recipes.',
    image:
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    title: 'Bean Origins Tasting',
    date: 'May 02, 2026 - 4:30 PM',
    location: 'Sensory Lab Room',
    description: 'A guided tasting journey across premium single-origin beans.',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
  },
]

const menuSeed = [
  { id: 1, category: 'Coffee', name: 'Signature Espresso', price: '$4.50', featured: true, description: 'Bold crema-rich espresso with caramel finish.' },
  { id: 2, category: 'Coffee', name: 'Velvet Latte', price: '$6.00', description: 'Silky milk foam with balanced single-origin espresso.' },
  { id: 3, category: 'Coffee', name: 'Classic Cappuccino', price: '$5.80', description: 'Aromatic shot, airy foam and a dusting of cacao.' },
  { id: 4, category: 'Cold Drinks', name: 'Nitro Cold Brew', price: '$6.70', featured: true, description: 'Smooth cascading cold brew infused with nitrogen.' },
  { id: 5, category: 'Cold Drinks', name: 'Iced Vanilla Oat Latte', price: '$6.20', description: 'Oat milk latte over ice with natural vanilla notes.' },
  { id: 6, category: 'Cold Drinks', name: 'Sparkling Espresso Tonic', price: '$6.90', description: 'Bright tonic, citrus peel and double espresso shot.' },
  { id: 7, category: 'Pastries / Snacks', name: 'Butter Croissant', price: '$3.80', description: 'Flaky handcrafted pastry baked fresh each morning.' },
  { id: 8, category: 'Pastries / Snacks', name: 'Almond Financier', price: '$4.40', featured: true, description: 'Moist almond cake with toasted nut aroma.' },
  { id: 9, category: 'Pastries / Snacks', name: 'Cocoa Hazelnut Tart', price: '$5.20', description: 'Dark chocolate ganache and roasted hazelnut praline.' },
]

export const useCoffeeStore = create((set, get) => ({
  events: eventSeed,
  menuItems: menuSeed,
  selectedCategory: 'Coffee',
  activeSection: 'home',
  authToken: storedToken,
  user: storedUser,
  isLoading: true,
  setCategory: (category) => set({ selectedCategory: category }),
  setActiveSection: (section) => set({ activeSection: section }),
  setLoading: (value) => set({ isLoading: value }),
  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const data = await loginUser({ email, password })
      const authToken = data.data.token
      const user = data.data || { email }
      console.log('Login successful:', { data, user })
      if (authToken) {
        set({ authToken, user })
        localStorage.setItem('coffeeLabToken', authToken)
        sessionStorage.setItem('coffeeLabUser', JSON.stringify(user))
        sessionStorage.setItem('coffeeLabUserRole', user.role || '')
      }
      return data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  signup: async (name, email, password) => {
    set({ isLoading: true })
    try {
      const data = await signupUser({ name, email, password })
      const authToken = data.data.token
      const user = data.data ||{ name, email }
      if (authToken) {
        set({ authToken, user })
        localStorage.setItem('coffeeLabToken', authToken)
        sessionStorage.setItem('coffeeLabUser', JSON.stringify(user))
        sessionStorage.setItem('coffeeLabUserRole', user.role || '')
      }
      return data
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
  logout: () => {
    localStorage.removeItem('coffeeLabToken')
    sessionStorage.removeItem('coffeeLabUser')
    sessionStorage.removeItem('coffeeLabUserRole')
    set({ authToken: null, user: null })
  },
  fetchMenuItems: async () => {
    set({ isLoading: true })
    try {
      const menuItems = await fetchMenuItems()
      set({ menuItems })
    } catch (error) {
      console.error('Failed to fetch menu items:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  fetchEvents: async () => {
    set({ isLoading: true })
    try {
      const events = await fetchEvents()
      set({ events })
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  getFilteredMenu: () =>
    get().menuItems.filter((item) => item.category === get().selectedCategory),
}))
