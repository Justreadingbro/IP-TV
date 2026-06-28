import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { id: 'home', label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
  { id: 'live', label: 'Live TV', icon: 'M15 10l4.5-2.5v9L15 14' },
  { id: 'categories', label: 'Categories', icon: 'M4 6h16M4 12h16M4 18h16' },
  { id: 'countries', label: 'Countries', icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' },
  { id: 'languages', label: 'Languages', icon: 'M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z' },
  { id: 'favorites', label: 'Favorites', icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { id: 'history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'settings', label: 'Settings', icon: 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' },
] as const

export default function Sidebar() {
  const { currentPage, setPage, sidebarOpen, setSidebarOpen } = useStore()

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 z-50 h-full w-64 bg-[rgba(4,4,4,0.95)] backdrop-blur-2xl border-r border-white/[0.04] pt-16 lg:translate-x-0 lg:static lg:z-auto lg:pt-16"
      >
        <div className="py-4 px-3 space-y-1">
          {menuItems.map((item, i) => {
            const isActive = currentPage === item.id
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  setPage(item.id as any)
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'text-white'
                    : 'text-lux-muted hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/8 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 flex items-center gap-3`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-lux-primary/15 text-lux-primary'
                      : 'bg-white/[0.04] text-lux-muted group-hover:bg-white/[0.08] group-hover:text-white'
                  }`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <span className="relative z-10">{item.label}</span>
                </div>
              </motion.button>
            )
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-lux-green" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-lux-green animate-ping opacity-30" />
            </div>
            <div className="text-xs">
              <p className="text-lux-muted">All systems</p>
              <p className="text-lux-green font-medium">Operational</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
