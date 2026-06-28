import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Channel } from '../types/index'
import { useStore } from '../store/useStore'
import { fetchAllChannels } from '../lib/iptvApi'
import ChannelCard from '../components/ChannelCard'

export default function HistoryPage() {
  const { history } = useStore()
  const [allChannels, setAllChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllChannels()
      .then(chs => setAllChannels(chs))
      .finally(() => setLoading(false))
  }, [])

  const historyChannels = useMemo(() =>
    allChannels
      .filter(ch => ch.name && ch.name !== 'Unknown' && history.includes(ch.id))
      .slice(0, 30),
    [allChannels, history]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">History</h1>
        <p className="text-sm text-lux-muted mt-1">Recently watched channels</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="skeleton w-16 h-16 rounded-2xl mx-auto mb-4" />
          <div className="skeleton h-4 w-48 mx-auto mb-2 rounded" />
          <div className="skeleton h-3 w-64 mx-auto rounded" />
        </div>
      ) : historyChannels.length > 0 ? (
        <>
          <div className="flex items-center gap-2 text-sm text-lux-muted">
            <span className="bg-white/[0.04] px-3 py-1.5 rounded-lg font-mono text-xs">
              {historyChannels.length} recent channel{historyChannels.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="channel-grid">
            {historyChannels.map((ch, i) => (
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
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400/60" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">No watch history yet</h2>
          <p className="text-sm text-lux-muted max-w-xs mx-auto">
            Channels you watch will appear here automatically
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
