import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'live', label: 'Live' },
  { id: 'categories', label: 'Browse' },
  { id: 'search', label: 'Search' },
] as const

export default function Navbar() {
  const { currentPage, setPage, sidebarOpen, setSidebarOpen } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  // Track scroll for dynamic transparency
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Command palette shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPage('search')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setPage])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 transition-all duration-500 ${
          scrolled
            ? 'bg-[rgba(4,4,4,0.85)] backdrop-blur-lg border-b border-white/[0.04]'
            : 'bg-transparent'
        } ${scrolled || currentPage !== 'home' ? '' : 'bg-gradient-to-b from-black/40 to-transparent'}`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-6 max-w-[1920px] mx-auto">
          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-ghost p-1.5 lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2.5 5h15M2.5 10h15M2.5 15h15" />
              </svg>
            </button>

            <button onClick={() => setPage('home')} className="flex items-center gap-2 group min-h-[44px]">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-lux-primary via-lux-accent to-lux-primary flex items-center justify-center shadow-glow-primary transition-shadow duration-300 group-hover:shadow-md">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <span className="font-display font-semibold text-sm sm:text-base hidden sm:inline tracking-tight">
                IPTV Lux
              </span>
            </button>
          </div>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id as any)}
                className="relative px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 min-h-[36px]"
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                {currentPage === item.id && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 transition-colors duration-200 ${
                  currentPage === item.id ? 'text-white' : 'text-lux-muted hover:text-white'
                }`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setPage('search')}
              className="flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs text-lux-muted border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:text-white transition-all duration-200 min-h-[36px]"
              aria-label="Search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline-flex text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">⌘K</kbd>
            </button>

            <button
              onClick={() => setPage('favorites')}
              className="btn-ghost p-1.5 sm:p-2 relative min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Favorites"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>

            <button
              onClick={() => setPage('settings')}
              className="btn-ghost p-1.5 sm:p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      {/* Spacer */}
      <div className="h-14 sm:h-16" />
    </>
  )
}
