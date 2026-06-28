import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import VideoPlayer from '../components/VideoPlayer'
import ChannelCard from '../components/ChannelCard'
import { motion } from 'framer-motion'
import { isChannelValid } from '../types/index'
import { getFlagEmoji } from '../lib/playlistParser'

export default function LivePage() {
  const { currentChannel, channels, setCurrentChannel, setIsPlaying, setPage } = useStore()

  const validChannels = useMemo(() => channels.filter(isChannelValid), [channels])
  const currentCategory = currentChannel?.category
  const related = useMemo(() =>
    currentCategory
      ? validChannels
          .filter(c => c.category === currentCategory && c.id !== currentChannel!.id)
          .slice(0, 8)
      : [],
    [validChannels, currentCategory, currentChannel?.id]
  )

  if (currentChannel) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 pb-8"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setCurrentChannel(null); setIsPlaying(false) }}
            className="flex items-center gap-2 text-sm text-lux-muted hover:text-white transition-colors group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to channels
          </button>
          <div className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded-lg">
            <span className="live-dot" />
            <span className="text-[11px] text-lux-live font-semibold uppercase tracking-wider">Live</span>
          </div>
        </div>

        <VideoPlayer />

        <div className="space-y-3">
          <h1 className="text-xl font-semibold font-display tracking-tight">{currentChannel.name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            {currentChannel.category && currentChannel.category !== 'Undefined' && (
              <span className="chip active text-xs">{currentChannel.category}</span>
            )}
            {currentChannel.country && (
              <span className="chip text-xs">{getFlagEmoji(currentChannel.country)} {currentChannel.country.toUpperCase()}</span>
            )}
            {currentChannel.language && (
              <span className="chip text-xs">{currentChannel.language}</span>
            )}
            {currentChannel.resolution && (
              <span className="chip text-xs">{currentChannel.resolution}</span>
            )}
            {currentChannel.network && (
              <span className="chip text-xs">{currentChannel.network}</span>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section>
            <div className="section-header">
              <div>
                <h2 className="section-title">Related Channels</h2>
                <p className="section-subtitle">More {currentChannel.category.toLowerCase()} channels</p>
              </div>
            </div>
            <div className="scroll-row">
              {related.map((ch, i) => (
                <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                  <ChannelCard channel={ch} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-lux-primary/20 to-lux-accent/10 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lux-muted" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 10l4.5-2.5v9L15 14" />
              <path d="M3 7v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Select a channel to watch</h2>
        <p className="text-sm text-lux-muted max-w-xs mx-auto">
          Choose from your favorite channels below or browse categories
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage('home')} className="btn-primary text-sm">
            Browse Home
          </button>
          <button onClick={() => setPage('favorites')} className="btn-secondary text-sm">
            View Favorites
          </button>
        </div>
      </motion.div>

      {validChannels.length > 0 && (
        <section>
          <div className="section-header">
            <div>
              <h2 className="section-title">All Channels</h2>
              <p className="section-subtitle">{validChannels.length.toLocaleString()} available channels</p>
            </div>
          </div>
          <div className="channel-grid">
            {validChannels.slice(0, 30).map((ch, i) => (
              <ChannelCard key={ch.id} channel={ch} index={i} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  )
}
