import { create } from 'zustand'
import { Channel, PageRoute } from '../types/index'

interface ContinueWatching {
  channelId: string
  timestamp: number
  progress: number
  lastWatched: number
}

interface AppState {
  currentPage: PageRoute
  setPage: (page: PageRoute) => void

  channels: Channel[]
  setChannels: (channels: Channel[]) => void

  currentChannel: Channel | null
  setCurrentChannel: (channel: Channel | null) => void

  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void

  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  searchQuery: string
  setSearchQuery: (query: string) => void

  // Favorites
  favorites: string[]
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean

  // History
  history: string[]
  addToHistory: (id: string) => void

  // Continue watching
  continueWatching: ContinueWatching[]
  addContinueWatching: (channelId: string, progress: number) => void
  removeContinueWatching: (channelId: string) => void

  // Recent searches
  recentSearches: string[]
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void

  // Settings
  theme: 'oled' | 'dark'
  setTheme: (theme: 'oled' | 'dark') => void
  volume: number
  setVolume: (volume: number) => void
  muted: boolean
  setMuted: (muted: boolean) => void

  // Filter state
  selectedCategory: string | null
  setSelectedCategory: (cat: string | null) => void
  selectedCountry: string | null
  setSelectedCountry: (country: string | null) => void
  selectedLanguage: string | null
  setSelectedLanguage: (lang: string | null) => void
}

const loadJSON = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(`iptv-lux-${key}`) || JSON.stringify(fallback))
  } catch { return fallback }
}

const saveJSON = (key: string, value: unknown) => {
  localStorage.setItem(`iptv-lux-${key}`, JSON.stringify(value))
}

export const useStore = create<AppState>()((set, get) => ({
    currentPage: 'home',
    setPage: (page) => set({ currentPage: page, sidebarOpen: false }),

    channels: [],
    setChannels: (channels) => set({ channels }),

    currentChannel: null,
    setCurrentChannel: (channel) => set({ currentChannel: channel }),

    isPlaying: false,
    setIsPlaying: (playing) => set({ isPlaying: playing }),

    sidebarOpen: false,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),

    // Favorites
    favorites: loadJSON<string[]>('favorites', []),
    addFavorite: (id) => {
      const favorites = [...get().favorites, id]
      set({ favorites })
      saveJSON('favorites', favorites)
    },
    removeFavorite: (id) => {
      const favorites = get().favorites.filter(f => f !== id)
      set({ favorites })
      saveJSON('favorites', favorites)
    },
    isFavorite: (id) => get().favorites.includes(id),

    // History
    history: loadJSON<string[]>('history', []),
    addToHistory: (id) => {
      const history = [id, ...get().history.filter(h => h !== id)].slice(0, 100)
      set({ history })
      saveJSON('history', history)
    },

    // Continue watching
    continueWatching: loadJSON<ContinueWatching[]>('continue-watching', []),
    addContinueWatching: (channelId, progress) => {
      const existing = get().continueWatching.filter(c => c.channelId !== channelId)
      const entry: ContinueWatching = {
        channelId,
        timestamp: Date.now(),
        progress,
        lastWatched: Date.now(),
      }
      const continueWatching = [entry, ...existing].slice(0, 20)
      set({ continueWatching })
      saveJSON('continue-watching', continueWatching)
    },
    removeContinueWatching: (channelId) => {
      const continueWatching = get().continueWatching.filter(c => c.channelId !== channelId)
      set({ continueWatching })
      saveJSON('continue-watching', continueWatching)
    },

    // Recent searches
    recentSearches: loadJSON<string[]>('recent-searches', []),
    addRecentSearch: (query) => {
      const recentSearches = [query, ...get().recentSearches.filter(s => s !== query)].slice(0, 10)
      set({ recentSearches })
      saveJSON('recent-searches', recentSearches)
    },
    clearRecentSearches: () => {
      set({ recentSearches: [] })
      saveJSON('recent-searches', [])
    },

    // Settings
    theme: 'oled',
    setTheme: (theme) => {
      set({ theme })
      document.documentElement.setAttribute('data-theme', theme)
    },

    volume: loadJSON<number>('volume', 0.8),
    setVolume: (volume) => {
      set({ volume })
      saveJSON('volume', volume)
    },
    muted: false,
    setMuted: (muted) => set({ muted }),

    // Filters
    selectedCategory: null,
    setSelectedCategory: (cat) => set({ selectedCategory: cat }),
    selectedCountry: null,
    setSelectedCountry: (country) => set({ selectedCountry: country }),
    selectedLanguage: null,
    setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
  })
)
