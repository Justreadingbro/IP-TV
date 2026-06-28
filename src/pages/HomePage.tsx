import { useEffect, useState, useRef, useMemo, memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Channel, isChannelValid } from '../types/index'
import { fetchAllChannels } from '../lib/iptvApi'
import { useStore } from '../store/useStore'
import ChannelCard from '../components/ChannelCard'
import SkeletonLoader, { SkeletonHero } from '../components/SkeletonLoader'
import { getFlagEmoji } from '../lib/playlistParser'

const BROWSE_CATEGORIES = [
  'Sports', 'News', 'Music', 'Movies', 'Entertainment',
  'Documentary', 'Kids', 'Education', 'Religious',
]

export default function HomePage() {
  const [allChannels, setAllChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const { setCurrentChannel, setIsPlaying, setPage, favorites, continueWatching, history } = useStore()
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAllChannels().then(chs => {
      setAllChannels(chs)
    }).finally(() => setLoading(false))
  }, [])

  // Derive all sections from a single channel database
  const { channels, trending, sports, news, music, movies, entertainment, documentary, kids, education, recentlyAdded, hdChannels, favChannels } = useMemo(() => {
    const valid = allChannels.filter(isChannelValid)

    const trending = valid
      .filter(c => c.hasMetadata && !['Undefined', 'Legislative'].includes(c.category))
      .slice(0, 20)

    const sports = valid.filter(c =>
      c.category?.toLowerCase().includes('sports') && c.hasMetadata
    ).slice(0, 15)

    const news = valid.filter(c =>
      c.category?.toLowerCase().includes('news')
    ).slice(0, 15)

    const music = valid.filter(c =>
      c.category?.toLowerCase().includes('music')
    ).slice(0, 15)

    const movies = valid.filter(c =>
      c.category?.toLowerCase().includes('movies')
    ).slice(0, 15)

    const entertainment = valid.filter(c =>
      c.category?.toLowerCase().includes('entertainment')
    ).slice(0, 15)

    const documentary = valid.filter(c =>
      c.category?.toLowerCase().includes('documentary')
    ).slice(0, 15)

    const kids = valid.filter(c =>
      c.category?.toLowerCase().includes('kids')
    ).slice(0, 15)

    const education = valid.filter(c =>
      c.category?.toLowerCase().includes('education')
    ).slice(0, 15)

    const recentlyAdded = valid.filter(c => c.hasMetadata).slice(0, 15)

    const hdChannels = valid.filter(c =>
      c.resolution && (c.resolution.includes('HD') || c.resolution.includes('FHD') || c.resolution.includes('4K'))
    ).slice(0, 15)

    const favChannels = valid.filter(c => favorites.includes(c.id)).slice(0, 15)

    return { channels: valid, trending, sports, news, music, movies, entertainment, documentary, kids, education, recentlyAdded, hdChannels, favChannels }
  }, [allChannels, favorites])

  // Pick hero from channels with COMPLETE metadata (name + logo + country + category)
  const hero = useMemo(() => {
    const best = trending.find(c =>
      c.hasMetadata && !!c.logo && !!c.country && !!c.category &&
      c.category !== 'Undefined' && c.category !== 'Legislative'
    )
    return best || trending[0] || channels[0] || null
  }, [trending, channels])

  const handlePlay = useCallback((ch: Channel) => {
    setCurrentChannel(ch)
    setIsPlaying(true)
    setPage('live')
  }, [setCurrentChannel, setIsPlaying, setPage])

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      })
    }
    const el = heroRef.current
    if (!el) return
    el.addEventListener('mousemove', handleMouseMove)
    return () => el.removeEventListener('mousemove', handleMouseMove)
  }, [loading])

  return (
    <div className="space-y-10 pb-12">
      {/* Cinematic Hero */}
      {loading ? <SkeletonHero /> : (
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[75vh] rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-lux-primary/20 via-lux-accent/10 to-transparent animate-aurora-slow" />
            <div
              className="absolute inset-0 opacity-60 transition-transform duration-1000"
              style={{
                background: `radial-gradient(circle at ${50 + (mousePos.x - 0.5) * 20}% ${50 + (mousePos.y - 0.5) * 20}%, rgba(59,130,246,0.08) 0%, transparent 50%)`,
              }}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-lux-bg via-lux-bg/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-lux-bg/50 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-end p-8 md:p-12 lg:p-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="live-dot" />
                <span className="text-xs font-semibold text-lux-live uppercase tracking-[0.15em]">Featured Channel</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold font-display tracking-tight leading-[0.95] mb-3 sm:mb-4">
                {hero?.name || 'IPTV Lux'}
              </h1>
              {hero && (
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {hero.category && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/[0.06]">
                      {hero.category}
                    </span>
                  )}
                  {hero.country && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/[0.06]">
                      {getFlagEmoji(hero.country)} {hero.country.toUpperCase()}
                    </span>
                  )}
                  {hero.language && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/[0.06]">
                      {hero.language}
                    </span>
                  )}
                </div>
              )}
              <p className="text-sm md:text-base text-white/60 max-w-lg mb-6 leading-relaxed">
                {hero?.category
                  ? `Live ${hero.category.toLowerCase()} channel. Stream now in premium quality.`
                  : 'Premium live television. Browse thousands of channels from around the world.'}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => hero && handlePlay(hero)}
                  className="flex items-center gap-2.5 px-6 py-3 bg-lux-primary text-white rounded-xl font-medium text-sm transition-all hover:shadow-glow-primary hover:brightness-110"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9z" /></svg>
                  Watch Now
                </motion.button>
                <button
                  onClick={() => setPage('categories')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white/70 bg-white/5 border border-white/[0.08] hover:bg-white/10 hover:text-white transition-all"
                >
                  Browse All Channels
                </button>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-lux-bg to-transparent" />
        </motion.div>
      )}

      {/* Continue Watching */}
      {favChannels.length > 0 && (
        <ContentSection title="Continue Watching" subtitle="Pick up where you left off">
          <ScrollRow>
            {favChannels.map((ch, i) => (
              <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                <ChannelCard channel={ch} index={i} />
              </div>
            ))}
          </ScrollRow>
        </ContentSection>
      )}

      {/* Trending Now */}
      <ContentSection title="Trending Now" subtitle="Most watched channels right now">
        {loading ? <SkeletonLoader count={5} variant="channel-card" /> : (
          <ScrollRow>
            {trending.slice(0, 12).map((ch, i) => (
              <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                <ChannelCard channel={ch} index={i} />
              </div>
            ))}
          </ScrollRow>
        )}
      </ContentSection>

      {/* HD Channels */}
      {hdChannels.length > 0 && (
        <ContentSection title="HD & 4K Channels" subtitle="Best quality streams">
          <ScrollRow>
            {hdChannels.map((ch, i) => (
              <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                <ChannelCard channel={ch} index={i} />
              </div>
            ))}
          </ScrollRow>
        </ContentSection>
      )}

      {/* Sports */}
      {sports.length > 0 && (
        <ContentSection title="Sports" subtitle="Live sports coverage">
          <ScrollRow>
            {sports.map((ch, i) => (
              <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                <ChannelCard channel={ch} index={i} />
              </div>
            ))}
          </ScrollRow>
        </ContentSection>
      )}

      {/* News */}
      {news.length > 0 && (
        <ContentSection title="News" subtitle="Stay informed">
          <ScrollRow>
            {news.map((ch, i) => (
              <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                <ChannelCard channel={ch} index={i} />
              </div>
            ))}
          </ScrollRow>
        </ContentSection>
      )}

      {/* Music */}
      {music.length > 0 && (
        <ContentSection title="Music" subtitle="Live music & radio">
          <ScrollRow>
            {music.map((ch, i) => (
              <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                <ChannelCard channel={ch} index={i} />
              </div>
            ))}
          </ScrollRow>
        </ContentSection>
      )}

      {/* Movies */}
      {movies.length > 0 && (
        <ContentSection title="Movies" subtitle="Movie channels & cinema">
          <ScrollRow>
            {movies.map((ch, i) => (
              <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                <ChannelCard channel={ch} index={i} />
              </div>
            ))}
          </ScrollRow>
        </ContentSection>
      )}

      {/* Entertainment */}
      {entertainment.length > 0 && (
        <ContentSection title="Entertainment" subtitle="Variety & lifestyle">
          <ScrollRow>
            {entertainment.map((ch, i) => (
              <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                <ChannelCard channel={ch} index={i} />
              </div>
            ))}
          </ScrollRow>
        </ContentSection>
      )}

      {/* Documentary */}
      {documentary.length > 0 && (
        <ContentSection title="Documentary" subtitle="Explore, learn, discover">
          <ScrollRow>
            {documentary.map((ch, i) => (
              <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                <ChannelCard channel={ch} index={i} />
              </div>
            ))}
          </ScrollRow>
        </ContentSection>
      )}

      {/* Kids */}
      {kids.length > 0 && (
        <ContentSection title="Kids" subtitle="Family-friendly channels">
          <ScrollRow>
            {kids.map((ch, i) => (
              <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                <ChannelCard channel={ch} index={i} />
              </div>
            ))}
          </ScrollRow>
        </ContentSection>
      )}

      {/* Education */}
      {education.length > 0 && (
        <ContentSection title="Education" subtitle="Learn something new">
          <ScrollRow>
            {education.map((ch, i) => (
              <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
                <ChannelCard channel={ch} index={i} />
              </div>
            ))}
          </ScrollRow>
        </ContentSection>
      )}

      {/* Recently Added */}
      <ContentSection title="Recently Added" subtitle="New channels">
        <ScrollRow>
          {recentlyAdded.slice(0, 12).map((ch, i) => (
            <div key={ch.id} className="min-w-[180px] md:min-w-[200px] w-[180px] md:w-[200px] flex-shrink-0">
              <ChannelCard channel={ch} index={i} />
            </div>
          ))}
        </ScrollRow>
      </ContentSection>

      {/* All channels CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center py-12"
      >
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-lux-muted text-sm">
            Explore all <span className="text-white font-semibold">{channels.length.toLocaleString()}+</span> channels
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage('categories')} className="btn-primary">
              Browse Categories
            </button>
            <button onClick={() => setPage('countries')} className="btn-secondary">
              Browse Countries
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const ContentSection = memo(function ContentSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        <button className="text-xs text-lux-primary hover:text-white transition-colors font-medium">
          View All
        </button>
      </div>
      {children}
    </motion.section>
  )
})

const ScrollRow = memo(function ScrollRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="scroll-row">
      {children}
    </div>
  )
})
