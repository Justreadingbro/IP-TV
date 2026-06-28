import { memo, useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'

function VideoPlayerInner() {
  const { currentChannel, isPlaying, setIsPlaying, volume, setVolume, muted, setMuted } = useStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [uiVisible, setUiVisible] = useState(true)
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>()
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showVolume, setShowVolume] = useState(false)
  const [cinemaMode, setCinemaMode] = useState(false)

  useEffect(() => {
    if (!videoRef.current || !currentChannel) return
    const video = videoRef.current
    video.src = currentChannel.url
    video.play().catch(() => {})
    return () => { video.pause(); video.src = '' }
  }, [currentChannel])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTime = () => {
      setProgress(video.duration ? video.currentTime / video.duration : 0)
      setCurrentTime(video.currentTime)
      setDuration(video.duration)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onLoaded = () => setDuration(video.duration)

    video.addEventListener('timeupdate', onTime)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('loadedmetadata', onLoaded)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [currentChannel, setIsPlaying])

  // Sync volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = muted ? 0 : volume
      videoRef.current.muted = muted
    }
  }, [volume, muted])

  const showUI = useCallback(() => {
    setUiVisible(true)
    clearTimeout(hideTimeout.current)
    hideTimeout.current = setTimeout(() => setUiVisible(false), 3000)
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.paused ? video.play() : video.pause()
  }, [])

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video || !duration) return
    const time = parseFloat(e.target.value) * duration
    video.currentTime = time
  }, [duration])

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!currentChannel) return
      switch (e.key) {
        case ' ':
          e.preventDefault(); togglePlay(); break
        case 'f':
        case 'F':
          handleFullscreen(); break
        case 'm':
        case 'M':
          setMuted(!muted); break
        case 'ArrowLeft':
          e.preventDefault(); skip(-10); break
        case 'ArrowRight':
          e.preventDefault(); skip(10); break
        case 'ArrowUp':
          e.preventDefault(); setVolume(Math.min(1, volume + 0.1)); break
        case 'ArrowDown':
          e.preventDefault(); setVolume(Math.max(0, volume - 0.1)); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentChannel, togglePlay, handleFullscreen, muted, setMuted, volume, setVolume, skip])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (!currentChannel) return null

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative w-full overflow-hidden bg-black group ${
        cinemaMode ? 'fixed inset-0 z-[60] rounded-none' : 'aspect-video rounded-2xl'
      }`}
      onMouseMove={showUI}
    >
      {/* Ambient glow — behind video */}
      <div
        className="absolute inset-0 opacity-30 transition-all duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(59,130,246,0.12) 0%, transparent 70%)`,
        }}
      />

      {/* Video — pixel-accurate, no filters */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain relative z-10"
        onClick={togglePlay}
        autoPlay
        playsInline
      />

      {/* Edge glow ring — decorative, behind controls */}
      <div className="absolute inset-0 z-10 pointer-events-none ring-1 ring-white/[0.03] rounded-[inherit]" />

      {/* Center play button — no backdrop-blur over video */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40"
          >
            <motion.button
              onClick={togglePlay}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-shadow hover:shadow-glow-primary"
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="white" className="ml-1.5">
                <path d="M5 3l14 9-14 9z" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <AnimatePresence>
        {uiVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 pointer-events-none"
          >
            {/* Gradient backgrounds */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="live-dot" />
                  <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Live</span>
                </div>
                <span className="text-sm font-medium text-white/90">{currentChannel.name === 'Unknown' ? 'Live Channel' : currentChannel.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCinemaMode(!cinemaMode)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title={cinemaMode ? 'Exit cinema mode' : 'Cinema mode'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                    {cinemaMode ? (
                      <>
                        <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                      </>
                    ) : (
                      <>
                        <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                      </>
                    )}
                  </svg>
                </button>
                <button
                  onClick={handleFullscreen}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="Fullscreen (F)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
              <div className="space-y-3">
                {/* Progress bar */}
                <div className="relative h-1.5 group/progress cursor-pointer">
                  <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-lux-primary to-lux-accent rounded-full transition-all duration-100"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Seek"
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                    style={{ left: `calc(${progress * 100}% - 6px)` }}
                  />
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="hover:scale-105 transition-transform active:scale-95"
                    >
                      {isPlaying ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M5 3l14 9-14 9z" />
                        </svg>
                      )}
                    </button>

                    {/* Skip back */}
                    <button onClick={() => skip(-10)} className="text-white/60 hover:text-white transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M11 19l-7-7 7-7" />
                        <path d="M18 19V5" />
                      </svg>
                    </button>

                    {/* Skip forward */}
                    <button onClick={() => skip(10)} className="text-white/60 hover:text-white transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M13 5l7 7-7 7" />
                        <path d="M6 5v14" />
                      </svg>
                    </button>

                    {/* Volume */}
                    <div
                      className="relative flex items-center"
                      onMouseEnter={() => setShowVolume(true)}
                      onMouseLeave={() => setShowVolume(false)}
                    >
                      <button
                        onClick={() => setMuted(!muted)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        {muted || volume === 0 ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            <path d="M23 9l-6 6M17 9l6 6" />
                          </svg>
                        ) : volume < 0.5 ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            <path d="M15.54 8.46a5 5 0 010 7.07" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                          </svg>
                        )}
                      </button>
                      <AnimatePresence>
                        {showVolume && (
                          <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 80, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="overflow-hidden ml-2"
                          >
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={muted ? 0 : volume}
                              onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false) }}
                              className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-lux-primary"
                              aria-label="Volume"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Time */}
                    <span className="text-xs text-white/50 font-mono tabular-nums">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/40 font-mono px-2 py-1 rounded bg-white/5 border border-white/[0.06]">
                      {currentChannel.resolution || 'HD'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const VideoPlayer = memo(VideoPlayerInner)
export default VideoPlayer
