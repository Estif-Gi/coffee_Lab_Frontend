function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles =
    variant === 'secondary'
      ? 'bg-transparent border border-cream text-cream hover:bg-cream hover:text-coffee-900'
      : 'bg-gold text-coffee-900 border border-gold hover:brightness-110 hover:border-gold/80'

  return (
    <button
      className={`rounded-full px-6 py-3 text-sm font-semibold tracking-wide shadow-lg transition-all duration-300 active:scale-[0.98] ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
