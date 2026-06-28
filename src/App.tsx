import { useStore } from './store/useStore'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import AuroraBackground from './components/AuroraBackground'
import HomePage from './pages/HomePage'
import LivePage from './pages/LivePage'
import SearchPage from './pages/SearchPage'
import CategoriesPage from './pages/CategoriesPage'
import CountriesPage from './pages/CountriesPage'
import LanguagesPage from './pages/LanguagesPage'
import FavoritesPage from './pages/FavoritesPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

const pages: Record<string, React.FC> = {
  home: HomePage,
  live: LivePage,
  search: SearchPage,
  categories: CategoriesPage,
  countries: CountriesPage,
  languages: LanguagesPage,
  favorites: FavoritesPage,
  history: HistoryPage,
  settings: SettingsPage,
}

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
}

const pageTransition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1],
}

function PageRenderer() {
  const currentPage = useStore(s => s.currentPage)
  const Component = pages[currentPage]
  if (!Component) return <HomePage />

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <Component />
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <div className="relative min-h-screen bg-lux-bg overflow-x-hidden">
      <AuroraBackground />

      {/* Noise overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pt-4 pb-20 lg:pb-8 px-4 md:px-6 lg:px-8 relative z-10 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <PageRenderer />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
