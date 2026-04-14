import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCoffeeStore } from '../store/useCoffeeStore'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)
  const [installed, setInstalled] = useState(false)
  const navigate = useNavigate()
  const { authToken, user, logout } = useCoffeeStore()
  const isAdmin = user?.role === 'admin' || localStorage.getItem('coffeeLabUserRole') === 'admin'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setShowInstall(true)
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setShowInstall(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const menuItems = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-all duration-300 ${
        scrolled
          ? 'border-beige/50 bg-cream/85 shadow-md backdrop-blur dark:border-coffee-700 dark:bg-coffee-950/80'
          : 'border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto w-full max-w-6xl px-4 py-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-wide text-coffee-900 dark:text-cream">
            <img
              src="/coffee%20lab%20(1).webp"
              alt="Coffee Lab logo"
              className="h-14 w-auto rounded-md border border-gold/40 shadow-sm"
            />
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-beige/40 bg-white/80 text-coffee-900 shadow-sm transition hover:bg-beige/90 dark:border-coffee-700 dark:bg-coffee-900/90 dark:text-cream md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="text-lg">{menuOpen ? '✕' : '☰'}</span>
          </button>

          <div className={`items-center gap-2 rounded-full bg-white/70 p-1 dark:bg-coffee-900/80 md:flex ${menuOpen ? 'block' : 'hidden'} md:block`}>
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-coffee-800 text-cream'
                      : 'text-coffee-700 hover:bg-beige/80 dark:text-cream'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {authToken ? (
              <>
                <span className="block rounded-full bg-gold/20 px-4 py-2 text-sm font-semibold text-coffee-800">
                  Hi, {user?.name || user?.email || 'Member'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/')
                    setMenuOpen(false)
                  }}
                  className="block rounded-full bg-transparent px-4 py-2 text-sm font-medium text-coffee-700 transition hover:bg-beige/80 dark:text-cream"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-coffee-800 text-cream'
                        : 'text-coffee-700 hover:bg-beige/80 dark:text-cream'
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-coffee-800 text-cream'
                        : 'text-coffee-700 hover:bg-beige/80 dark:text-cream'
                    }`
                  }
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
      {showInstall && !installed && (
        <div className="fixed bottom-4 left-1/2 z-40 flex w-[min(92vw,600px)] -translate-x-1/2 items-center justify-between rounded-3xl border border-beige/50 bg-cream/95 px-4 py-3 shadow-lg shadow-slate-900/10 text-sm text-coffee-900 backdrop-blur dark:border-coffee-700 dark:bg-coffee-950/95 dark:text-cream">
          <div className="max-w-[70%]">
            <p className="font-semibold">Install Coffee Lab</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Add the app to your home screen for quick access.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                if (!deferredPrompt) return
                deferredPrompt.prompt()
                const { outcome } = await deferredPrompt.userChoice
                setShowInstall(false)
                setDeferredPrompt(null)
                if (outcome === 'accepted') {
                  setInstalled(true)
                }
              }}
              className="rounded-full bg-coffee-900 px-4 py-2 text-xs font-semibold text-cream transition hover:bg-coffee-800"
            >
              Install
            </button>
            <button
              type="button"
              onClick={() => setShowInstall(false)}
              className="rounded-full bg-transparent px-3 py-2 text-xs font-medium text-coffee-700 transition hover:bg-beige/90 dark:text-slate-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
