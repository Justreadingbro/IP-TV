import { Component, ReactNode } from 'react'
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

class ErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false, error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lux-muted">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v.01M12 8v4" />
            </svg>
          </div>
          <p className="text-base text-lux-muted mb-1">Something went wrong</p>
          <p className="text-sm text-lux-muted/50 max-w-xs">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-primary mt-6 text-sm"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
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
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <div className="relative min-h-screen bg-lux-bg overflow-x-hidden">
      <AuroraBackground />

      <div className="noise-overlay" aria-hidden="true" />

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pt-4 pb-24 lg:pb-8 px-3 md:px-6 lg:px-8 relative z-10 min-h-[100dvh]">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              <PageRenderer />
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
