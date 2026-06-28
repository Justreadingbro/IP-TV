import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Channel } from '../types/index'
import { fetchAllChannels, getCountries } from '../lib/iptvApi'
import { getFlagEmoji } from '../lib/playlistParser'
import ChannelCard from '../components/ChannelCard'
import SkeletonLoader from '../components/SkeletonLoader'

const COUNTRY_GRADIENTS: Record<string, string> = {
  us: 'from-blue-600/20 to-red-500/10',
  gb: 'from-blue-700/20 to-red-600/10',
  ca: 'from-red-600/20 to-white/5',
  au: 'from-blue-600/20 to-red-500/10',
  de: 'from-yellow-500/20 to-red-600/10',
  fr: 'from-blue-700/20 to-red-600/10',
  it: 'from-green-600/20 to-red-600/10',
  es: 'from-red-600/20 to-yellow-500/10',
  br: 'from-green-600/20 to-yellow-500/10',
  jp: 'from-red-600/20 to-white/5',
  in: 'from-orange-500/20 to-green-600/10',
  nl: 'from-orange-500/20 to-blue-700/10',
}

function getCountryGradient(code: string): string {
  return COUNTRY_GRADIENTS[code] || 'from-lux-primary/20 to-lux-primary/5'
}

export default function CountriesPage() {
  const [allChannels, setAllChannels] = useState<Channel[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [inputFilter, setInputFilter] = useState('')

  useEffect(() => {
    fetchAllChannels()
      .then(chs => setAllChannels(chs))
      .finally(() => setLoading(false))
  }, [])

  const countries = useMemo(() => getCountries(allChannels), [allChannels])

  const filteredCountries = useMemo(() =>
    countries.filter(c =>
      !inputFilter || c.name.toLowerCase().includes(inputFilter.toLowerCase())
    ),
    [countries, inputFilter]
  )

  const countryChannels = useMemo(() =>
    selectedCountry
      ? allChannels.filter(ch => ch.name && ch.name !== 'Unknown' && ch.country === selectedCountry)
      : [],
    [allChannels, selectedCountry]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Countries</h1>
        <p className="text-sm text-lux-muted mt-1">Browse channels by country</p>
      </div>

      <div className="relative max-w-md">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-muted">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Filter countries..."
          value={inputFilter}
          onChange={e => setInputFilter(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-lux-fg placeholder:text-lux-muted/50 focus:border-lux-primary/30 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filteredCountries.map(({ code, name, count }) => {
          const isActive = selectedCountry === code
          return (
            <motion.button
              key={code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCountry(code === selectedCountry ? null : code)}
              className={`relative overflow-hidden flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-lux-primary text-white shadow-glow-primary'
                  : 'bg-white/[0.04] text-lux-muted border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <span className="text-base flex-shrink-0">{getFlagEmoji(code)}</span>
              <span>{name}</span>
              <span className="text-[10px] opacity-60 font-mono">{count}</span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedCountry && (
          <motion.div
            key={selectedCountry}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCountryGradient(selectedCountry)} flex items-center justify-center text-xl`}>
                {getFlagEmoji(selectedCountry)}
              </div>
              <h2 className="text-lg font-semibold">{countries.find(c => c.code === selectedCountry)?.name}</h2>
              <span className="text-xs text-lux-muted bg-white/[0.04] px-2 py-1 rounded-lg font-mono">{countryChannels.length} channels</span>
            </div>

            {countryChannels.length === 0 ? (
              <SkeletonLoader count={8} variant="channel-card" />
            ) : (
              <div className="channel-grid">
                {countryChannels.map((ch, i) => (
                  <ChannelCard key={ch.id} channel={ch} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedCountry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lux-primary/10 to-lux-accent/10 border border-white/[0.06] flex items-center justify-center mx-auto mb-4 animate-float">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lux-muted">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
          </div>
          <p className="text-base text-lux-muted">Select a country to browse channels</p>
          <p className="text-sm text-lux-muted/50 mt-1">Choose from the countries above</p>
        </motion.div>
      )}
    </motion.div>
  )
}
