import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Channel } from '../types/index'
import { useStore } from '../store/useStore'
import { fetchAllChannels } from '../lib/iptvApi'
import ChannelCard from '../components/ChannelCard'

export default function FavoritesPage() {
  const { favorites } = useStore()
  const [allChannels, setAllChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllChannels()
      .then(chs => setAllChannels(chs))
      .finally(() => setLoading(false))
  }, [])

  const favChannels = useMemo(() =>
    allChannels.filter(ch => ch.name && ch.name !== 'Unknown' && favorites.includes(ch.id)),
    [allChannels, favorites]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Favorites</h1>
        <p className="text-sm text-lux-muted mt-1">Your saved channels</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="skeleton w-16 h-16 rounded-2xl mx-auto mb-4" />
          <div className="skeleton h-4 w-48 mx-auto mb-2 rounded" />
          <div className="skeleton h-3 w-64 mx-auto rounded" />
        </div>
      ) : favChannels.length > 0 ? (
        <>
          <div className="flex items-center gap-2 text-sm text-lux-muted">
            <span className="bg-white/[0.04] px-3 py-1.5 rounded-lg font-mono text-xs">
              {favChannels.length} channel{favChannels.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="channel-grid">
            {favChannels.map((ch, i) => (
              <ChannelCard key={ch.id} channel={ch} index={i} />
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-400/60" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-sm text-lux-muted max-w-xs mx-auto">
            Click the <span className="text-rose-400/80">heart icon</span> on any channel to save it here
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
