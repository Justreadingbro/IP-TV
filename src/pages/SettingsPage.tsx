import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function SettingsPage() {
  const {
    theme, setTheme, volume, setVolume, muted, setMuted,
    favorites, history, clearRecentSearches, recentSearches
  } = useStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl space-y-6 pb-8"
    >
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Settings</h1>
        <p className="text-sm text-lux-muted mt-1">Customize your experience</p>
      </div>

      <SettingCard title="Appearance">
        <div className="flex gap-2">
          {([
            { value: 'oled' as const, label: 'OLED Dark', icon: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z' },
            { value: 'dark' as const, label: 'Standard Dark', icon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z' },
          ]).map(t => (
            <motion.button
              key={t.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setTheme(t.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                theme === t.value
                  ? 'bg-lux-primary text-white shadow-glow-primary'
                  : 'bg-white/[0.04] border border-white/[0.06] text-lux-muted hover:text-white'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d={t.icon} />
              </svg>
              {t.label}
            </motion.button>
          ))}
        </div>
      </SettingCard>

      <SettingCard title="Playback">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-lux-muted">Volume</span>
            <div className="flex items-center gap-3 flex-1 max-w-xs ml-4">
              <button
                onClick={() => setMuted(!muted)}
                className="text-lux-muted hover:text-white transition-colors flex-shrink-0"
              >
                {muted || volume === 0 ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M23 9l-6 6M17 9l6 6" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false) }}
                className="flex-1 h-1.5 appearance-none bg-white/[0.08] rounded-full cursor-pointer accent-lux-primary"
              />
              <span className="text-xs text-lux-muted font-mono w-10 text-right tabular-nums">
                {Math.round((muted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Data & Storage">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lux-muted" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Favorites saved</p>
                <p className="text-xs text-lux-muted">Channels you've bookmarked</p>
              </div>
            </div>
            <span className="font-mono text-sm tabular-nums bg-white/[0.04] px-2.5 py-1 rounded-lg">{favorites.length}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lux-muted" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Watch history</p>
                <p className="text-xs text-lux-muted">Recently viewed channels</p>
              </div>
            </div>
            <span className="font-mono text-sm tabular-nums bg-white/[0.04] px-2.5 py-1 rounded-lg">{history.length}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lux-muted" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Recent searches</p>
                <p className="text-xs text-lux-muted">Your search history</p>
              </div>
            </div>
            <button
              onClick={clearRecentSearches}
              disabled={recentSearches.length === 0}
              className="text-xs font-medium text-lux-muted bg-white/[0.04] px-2.5 py-1 rounded-lg hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>
      </SettingCard>

      <SettingCard title="About">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-lux-muted">Version</span>
            <span className="font-mono text-sm bg-white/[0.04] px-2.5 py-1 rounded-lg">0.1.0</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-lux-muted">Data source</span>
            <span className="font-mono text-xs bg-white/[0.04] px-2.5 py-1 rounded-lg text-lux-muted">IPTV-org</span>
          </div>
        </div>
      </SettingCard>

      <div className="text-center py-6">
        <p className="text-xs text-lux-muted/40">IPTV Lux · Premium streaming experience · {new Date().getFullYear()}</p>
      </div>
    </motion.div>
  )
}

function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-lux-primary" />
        {title}
      </h3>
      {children}
    </motion.div>
  )
}
