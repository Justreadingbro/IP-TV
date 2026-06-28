import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'

const items = [
  { id: 'home', label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
  { id: 'categories', label: 'Browse', icon: 'M4 6h16M4 12h16M4 18h16' },
  { id: 'live', label: 'Live', icon: 'M15 10l4.5-2.5v9L15 14' },
  { id: 'favorites', label: 'Saved', icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { id: 'search', label: 'Search', icon: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z' },
] as const

export default function BottomNav() {
  const { currentPage, setPage } = useStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(4,4,4,0.92)] backdrop-blur-lg border-t border-white/[0.04] lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {items.map(item => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id as any)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors duration-200"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-lux-primary"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isActive ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isActive ? 'text-lux-primary' : 'text-lux-muted'}
              >
                <path d={item.icon} />
              </svg>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${
                isActive ? 'text-lux-primary' : 'text-lux-muted'
              }`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
