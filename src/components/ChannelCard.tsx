import { memo, useRef, useState, useCallback } from 'react'
import { Channel } from '../types/index'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { getInitials, getFlagEmoji } from '../lib/playlistParser'

interface ChannelCardProps {
  channel: Channel
  index?: number
}

const LOGO_GRADIENTS = [
  'from-blue-500/20 to-purple-500/20',
  'from-emerald-500/20 to-cyan-500/20',
  'from-rose-500/20 to-orange-500/20',
  'from-violet-500/20 to-pink-500/20',
  'from-amber-500/20 to-red-500/20',
  'from-indigo-500/20 to-teal-500/20',
]

function getLogoGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i)
  return LOGO_GRADIENTS[Math.abs(hash) % LOGO_GRADIENTS.length]
}

function ChannelCardInner({ channel, index = 0 }: ChannelCardProps) {
  const { isFavorite, addFavorite, removeFavorite, setCurrentChannel, setIsPlaying, setPage } = useStore()
  const cardRef = useRef<HTMLDivElement>(null)
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const fav = isFavorite(channel.id)

  const displayName = channel.name || 'Channel'
  const initials = getInitials(displayName)
  const gradient = getLogoGradient(channel.id)

  const handlePlay = useCallback(() => {
    setCurrentChannel(channel)
    setIsPlaying(true)
    setPage('live')
  }, [channel, setCurrentChannel, setIsPlaying, setPage])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  const qualityLabel = channel.resolution || (channel.logo ? 'HD' : undefined)

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setSpotlight({ x: 50, y: 50 }) }}
      whileTap={{ scale: 0.97 }}
      className="relative group cursor-pointer overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] transition-all duration-500 hover:border-white/[0.12] hover:shadow-elevated hover:-translate-y-1 active:scale-[0.97]"
      onClick={handlePlay}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handlePlay()}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(59,130,246,0.08) 0%, transparent 60%)`,
        }}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${channel.hasMetadata ? gradient : 'from-white/[0.02] to-transparent'} transition-all duration-700`}>
          {!channel.hasMetadata && channel.logo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] text-8xl select-none pointer-events-none">
              {initials}
            </div>
          )}
        </div>

        {/* Logo / Premium placeholder */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {channel.logo && !logoError ? (
            <img
              src={channel.logo}
              alt={displayName}
              className="max-w-[55%] max-h-[55%] object-contain transition-all duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl font-bold text-white/80 backdrop-blur-sm border border-white/[0.08] shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-glow-primary`}>
                {initials || '?'}
              </div>
              <div className="absolute -bottom-1 left-0 right-0 h-3 rounded-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent blur-sm" />
            </div>
          )}
        </div>

        {/* Glass overlay on hover (always visible on touch) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-3 sm:p-4 md:opacity-0 lg:opacity-0">
          <span className="flex items-center gap-2 text-xs font-medium text-white bg-lux-primary/90 backdrop-blur-sm px-2.5 sm:px-3 py-1.5 rounded-lg transition-transform duration-300 group-hover:scale-105">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9z" /></svg>
            Watch Now
          </span>
        </div>

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="badge badge-live flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
          {qualityLabel && (
            <span className="badge badge-hd">{qualityLabel}</span>
          )}
          {channel.country && (
            <span className="text-[10px]" title={channel.country}>
              {getFlagEmoji(channel.country)}
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={e => {
            e.stopPropagation()
            fav ? removeFavorite(channel.id) : addFavorite(channel.id)
          }}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70 hover:scale-110 border border-white/[0.06]"
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={fav ? 'text-lux-live' : 'text-white/80'}>
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        <div className="absolute inset-0 border-2 border-transparent group-hover:border-lux-primary/20 rounded-2xl transition-all duration-500 pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="text-sm font-medium truncate group-hover:text-white transition-colors duration-300">
          {displayName}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11px] text-lux-muted truncate">
            {channel.category && channel.category !== 'Undefined' ? channel.category : 'Channel'}
          </span>
          {channel.language && (
            <span className="text-[11px] text-lux-muted/60 uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04]">
              {channel.language}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const ChannelCard = memo(ChannelCardInner)
export default ChannelCard
