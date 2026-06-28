import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Category, Channel } from '../types/index'
import { fetchAllChannels, getCategories, getCategoryIcon, getCategoryGradient } from '../lib/iptvApi'
import ChannelCard from '../components/ChannelCard'
import SkeletonLoader from '../components/SkeletonLoader'

export default function CategoriesPage() {
  const [allChannels, setAllChannels] = useState<Channel[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllChannels()
      .then(chs => setAllChannels(chs))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => getCategories(allChannels), [allChannels])

  const categoryChannels = useMemo(() =>
    selectedCategory
      ? allChannels.filter(ch => ch.name && ch.name !== 'Unknown' && ch.category === selectedCategory)
      : [],
    [allChannels, selectedCategory]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Categories</h1>
        <p className="text-sm text-lux-muted mt-1">Browse channels by category</p>
      </div>

      {loading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-28 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const isActive = selectedCategory === cat
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`relative overflow-hidden flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-lux-primary text-white shadow-glow-primary'
                    : 'bg-white/[0.04] text-lux-muted border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getCategoryGradient(cat)} flex items-center justify-center`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={getCategoryIcon(cat)} />
                  </svg>
                </div>
                <span>{cat}</span>
              </motion.button>
            )
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCategoryGradient(selectedCategory)} flex items-center justify-center`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lux-primary">
                  <path d={getCategoryIcon(selectedCategory)} />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">{selectedCategory}</h2>
              <span className="text-xs text-lux-muted bg-white/[0.04] px-2 py-1 rounded-lg font-mono">{categoryChannels.length} channels</span>
            </div>

            {categoryChannels.length === 0 ? (
              <SkeletonLoader count={8} variant="channel-card" />
            ) : (
              <div className="channel-grid">
                {categoryChannels.map((ch, i) => (
                  <ChannelCard key={ch.id} channel={ch} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedCategory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lux-primary/10 to-lux-accent/10 border border-white/[0.06] flex items-center justify-center mx-auto mb-4 animate-float">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lux-muted">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <p className="text-base text-lux-muted">Select a category to browse channels</p>
          <p className="text-sm text-lux-muted/50 mt-1">Choose from the categories above</p>
        </motion.div>
      )}
    </motion.div>
  )
}
