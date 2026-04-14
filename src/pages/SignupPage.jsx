import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCoffeeStore } from '../store/useCoffeeStore'
import Button from '../components/Button'
import Navbar from '../components/Navbar'

function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const signup = useCoffeeStore((state) => state.signup)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await signup(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />
      <section className="mx-auto max-w-xl px-4 py-16 md:px-8">
        <div className="luxury-surface rounded-3xl border border-beige/60 bg-white/90 p-10 shadow-xl dark:border-coffee-700 dark:bg-coffee-950/90">
          <h1 className="mb-4 text-3xl font-semibold text-coffee-900 dark:text-cream">Sign Up</h1>
          <p className="mb-8 text-sm text-coffee-700 dark:text-beige">Create your Coffee Lab account to start managing backend content and see protected pages.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
              />
            </label>
            <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
              />
            </label>
            <label className="block text-sm font-medium text-coffee-900 dark:text-cream">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-coffee-900 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-coffee-700 dark:bg-coffee-900 dark:text-cream"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-coffee-700 dark:text-beige">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-coffee-900 underline dark:text-cream">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default SignupPage
