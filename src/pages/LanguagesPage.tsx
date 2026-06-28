import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Channel } from '../types/index'
import { fetchAllChannels, getLanguages } from '../lib/iptvApi'
import ChannelCard from '../components/ChannelCard'
import SkeletonLoader from '../components/SkeletonLoader'

export default function LanguagesPage() {
  const [allChannels, setAllChannels] = useState<Channel[]>([])
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [inputFilter, setInputFilter] = useState('')

  useEffect(() => {
    fetchAllChannels()
      .then(chs => setAllChannels(chs))
      .finally(() => setLoading(false))
  }, [])

  const languages = useMemo(() => getLanguages(allChannels), [allChannels])

  const filteredLangs = useMemo(() =>
    languages.filter(l =>
      !inputFilter || l.name.toLowerCase().includes(inputFilter.toLowerCase())
    ),
    [languages, inputFilter]
  )

  const langChannels = useMemo(() =>
    selectedLang
      ? allChannels.filter(ch => ch.name && ch.name !== 'Unknown' && ch.language === selectedLang)
      : [],
    [allChannels, selectedLang]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Languages</h1>
        <p className="text-sm text-lux-muted mt-1">Browse channels by language</p>
      </div>

      <div className="relative max-w-md">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-muted">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Filter languages..."
          value={inputFilter}
          onChange={e => setInputFilter(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-lux-fg placeholder:text-lux-muted/50 focus:border-lux-primary/30 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filteredLangs.map(({ code, name, count }) => {
          const isActive = selectedLang === code
          return (
            <motion.button
              key={code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedLang(code === selectedLang ? null : code)}
              className={`relative overflow-hidden px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-lux-primary text-white shadow-glow-primary'
                  : 'bg-white/[0.04] text-lux-muted border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <span>{name}</span>
              <span className="ml-1.5 text-[10px] opacity-60 font-mono">{count}</span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedLang && (
          <motion.div
            key={selectedLang}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{languages.find(l => l.code === selectedLang)?.name}</h2>
              <span className="text-xs text-lux-muted bg-white/[0.04] px-2 py-1 rounded-lg font-mono">{langChannels.length} channels</span>
            </div>

            {langChannels.length === 0 ? (
              <SkeletonLoader count={8} variant="channel-card" />
            ) : (
              <div className="channel-grid">
                {langChannels.map((ch, i) => (
                  <ChannelCard key={ch.id} channel={ch} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedLang && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lux-primary/10 to-lux-accent/10 border border-white/[0.06] flex items-center justify-center mx-auto mb-4 animate-float">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lux-muted">
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </div>
          <p className="text-base text-lux-muted">Select a language to browse channels</p>
          <p className="text-sm text-lux-muted/50 mt-1">Choose from the languages above</p>
        </motion.div>
      )}
    </motion.div>
  )
}
