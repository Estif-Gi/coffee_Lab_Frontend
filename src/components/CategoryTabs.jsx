function CategoryTabs({ categories, activeCategory, onChange }) {
  return (
    <div className="mb-8 flex flex-wrap justify-center gap-3">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
            activeCategory === category
              ? 'bg-coffee-800 text-cream shadow-md'
              : 'bg-white text-coffee-700 hover:bg-beige/80'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default CategoryTabs
