import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Channel } from '../types/index'
import { fetchAllChannels, searchChannels } from '../lib/iptvApi'
import { useStore } from '../store/useStore'
import ChannelCard from '../components/ChannelCard'
import SkeletonLoader from '../components/SkeletonLoader'

const TRENDING_SUGGESTIONS = ['BBC News', 'CNN', 'ESPN', 'Discovery', 'National Geographic', 'Fox News', 'Sky Sports', 'Eurosport', 'MTV', 'Cartoon Network']

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-lux-primary/20 text-lux-primary rounded-sm px-0.5">{part}</mark>
          : part
      )}
    </>
  )
}

export default function SearchPage() {
  const { searchQuery, setSearchQuery, recentSearches, addRecentSearch, clearRecentSearches } = useStore()
  const [allChannels, setAllChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(searchQuery, 250)

  useEffect(() => {
    fetchAllChannels().then(chs => {
      setAllChannels(chs)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filtered = useMemo(() => {
    if (!debouncedQuery) return []
    return searchChannels(debouncedQuery)
  }, [debouncedQuery])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.trim()) addRecentSearch(query.trim())
    setSelectedIndex(-1)
  }, [setSearchQuery, addRecentSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && filtered.length > 0) {
      const idx = selectedIndex >= 0 ? selectedIndex : 0
      const ch = filtered[idx]
      if (ch) {
        useStore.getState().setCurrentChannel(ch)
        useStore.getState().setIsPlaying(true)
        useStore.getState().setPage('live')
      }
    } else if (e.key === 'Escape') {
      setSearchQuery('')
      setSelectedIndex(-1)
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    if (selectedIndex < 0 || !resultsRef.current) return
    const items = resultsRef.current.querySelectorAll('[data-result-index]')
    if (items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      {/* Search bar — Spotlight style */}
      <div className="relative max-w-2xl mx-auto w-full">
        <div className="relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-5 top-1/2 -translate-y-1/2 text-lux-muted">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search channels — try partial names, categories, countries..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSelectedIndex(-1) }}
            onKeyDown={handleKeyDown}
            className="w-full h-14 pl-13 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-base text-lux-fg placeholder:text-lux-muted/50 focus:border-lux-primary/30 focus:bg-white/[0.06] transition-all outline-none"
            style={{ paddingLeft: '3.25rem' }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedIndex(-1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-lux-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.06]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Keyboard hint */}
        <div className="hidden sm:flex items-center gap-1.5 mt-2 justify-center">
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-lux-muted font-mono">↑↓</kbd>
          <span className="text-[10px] text-lux-muted/50">Navigate</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-lux-muted font-mono ml-2">Enter</kbd>
          <span className="text-[10px] text-lux-muted/50">Select</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-lux-muted font-mono ml-2">Esc</kbd>
          <span className="text-[10px] text-lux-muted/50">Clear</span>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader count={8} variant="channel-card" />
      ) : searchQuery ? (
        <div ref={resultsRef}>
          {filtered.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-lux-muted">
                  <span className="text-white font-semibold">{filtered.length}</span> results for "<span className="text-white">{searchQuery}</span>"
                </p>
              </div>
              {selectedIndex >= 0 && (
                <div className="text-xs text-lux-muted/50 mb-3 flex items-center gap-3">
                  <span>{selectedIndex + 1} of {filtered.length}</span>
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">↑↓</kbd>
                  <span>navigate</span>
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">Enter</kbd>
                  <span>watch</span>
                </div>
              )}
              <div className="channel-grid">
                {filtered.map((ch, i) => (
                  <div
                    key={ch.id}
                    data-result-index={i}
                    className={`relative rounded-2xl transition-all duration-200 ${
                      selectedIndex === i ? 'ring-2 ring-lux-primary ring-offset-2 ring-offset-lux-bg' : ''
                    }`}
                  >
                    <ChannelCard channel={ch} index={i} />
                    <div className="absolute top-2 left-2 z-10 bg-lux-bg/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono text-lux-muted/60">
                      <span className="font-semibold text-white/80">{highlightMatch(ch.name, searchQuery)}</span>
                      {ch.category && <span className="ml-1.5">· {ch.category}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lux-muted">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <p className="text-base text-lux-muted mb-2">No channels found for "<span className="text-white">{searchQuery}</span>"</p>
              <p className="text-sm text-lux-muted/60">Try a different search term</p>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Suggestions */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-lux-muted/50 mb-3">Suggestions</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {TRENDING_SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="chip text-[11px] sm:text-xs"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-lux-muted/50">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-[11px] text-lux-muted/50 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="chip"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Initial state */}
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lux-primary/10 to-lux-accent/10 border border-white/[0.06] flex items-center justify-center mx-auto mb-4 animate-float">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lux-muted">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <p className="text-base text-lux-muted">Search across thousands of channels</p>
            <p className="text-sm text-lux-muted/50 mt-1">Fuzzy search — try "BBC", "Sports", "unite8", "sport", or partial names</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
