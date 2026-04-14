import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import CategoryTabs from '../components/CategoryTabs'
import MenuItemCard from '../components/MenuItemCard'
import Navbar from '../components/Navbar'
import SectionWrapper from '../components/SectionWrapper'
import SkeletonCard from '../components/SkeletonCard'
import { useCoffeeStore } from '../store/useCoffeeStore'

const categories = ['Coffee', 'Cold Drinks', 'Pastries / Snacks']

function MenuPage() {
  const {
    selectedCategory,
    setCategory,
    getFilteredMenu,
    isLoading,
    fetchMenuItems,
  } = useCoffeeStore()

  const items = getFilteredMenu()

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  return (
    <main className="min-h-screen">
      <Navbar />
      <SectionWrapper subtitle="Crafted Selection" title="Coffee Lab Menu" id="menu">
        <CategoryTabs
          categories={categories}
          activeCategory={selectedCategory}
          onChange={setCategory}
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </SectionWrapper>
    </main>
  )
}

export default MenuPage
