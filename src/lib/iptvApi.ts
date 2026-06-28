import Fuse from 'fuse.js'
import { Channel, IptvChannelMeta, isChannelValid } from '../types/index'
import { parseM3U, mergeChannelsWithMeta, parseCountryFromCode, getFlagEmoji } from './playlistParser'

const BASE_URL = 'https://iptv-org.github.io/iptv'
const CACHE_KEY = 'iptv-lux-cache'
const CACHE_TTL = 30 * 60 * 1000

let channelsCache: Channel[] | null = null
let fuseIndex: Fuse<Channel> | null = null

function getKey(name: string): string {
  return `iptv-${name}-channels`
}

async function fetchCachedOrLive(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.text()
}

async function fetchJsonCached<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.json()
}

async function fetchChannelsMeta(): Promise<Map<string, IptvChannelMeta>> {
  try {
    const metaList: IptvChannelMeta[] = await fetchJsonCached(`${BASE_URL}/channels.json`)
    const map = new Map<string, IptvChannelMeta>()
    for (const meta of metaList) {
      if (meta.id) {
        map.set(meta.id, meta)
        if (meta.altNames) {
          for (const alt of meta.altNames) {
            map.set(alt.toLowerCase().replace(/\s+/g, ''), meta)
          }
        }
      }
    }
    return map
  } catch {
    return new Map()
  }
}

export async function buildChannelDatabase(): Promise<Channel[]> {
  const [m3uText, metaIndex] = await Promise.all([
    fetchCachedOrLive(`${BASE_URL}/index.m3u`),
    fetchChannelsMeta(),
  ])

  const parsed = parseM3U(m3uText)
  const merged = mergeChannelsWithMeta(parsed, metaIndex)
  const valid = merged.filter(isChannelValid)

  channelsCache = valid
  buildSearchIndex(valid)
  return valid
}

function buildSearchIndex(channels: Channel[]): void {
  fuseIndex = new Fuse(channels, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'altNames', weight: 1.5 },
      { name: 'category', weight: 1 },
      { name: 'country', weight: 0.8 },
      { name: 'language', weight: 0.8 },
      { name: 'tvgId', weight: 0.5 },
      { name: 'network', weight: 0.5 },
    ],
    threshold: 0.4,
    distance: 200,
    minMatchCharLength: 1,
    shouldSort: true,
    includeScore: true,
  })
}

function buildCategoryIndex(channels: Channel[]): Map<string, Channel[]> {
  const map = new Map<string, Channel[]>()
  for (const ch of channels) {
    const cat = ch.category || 'Other'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(ch)
  }
  return map
}

export async function fetchAllChannels(): Promise<Channel[]> {
  if (channelsCache) return channelsCache
  return buildChannelDatabase()
}

export function searchChannels(query: string): Channel[] {
  if (!fuseIndex || !query.trim()) return []
  const results = fuseIndex.search(query, { limit: 50 })
  return results.map(r => r.item)
}

export function getCategories(channels: Channel[]): string[] {
  const cats = new Set<string>()
  for (const ch of channels) {
    if (ch.category && ch.category !== 'Undefined' && ch.category !== 'Other') {
      cats.add(ch.category)
    }
  }
  return Array.from(cats).sort()
}

export function getCountries(channels: Channel[]): { code: string; name: string; count: number }[] {
  const map = new Map<string, number>()
  for (const ch of channels) {
    if (ch.country) {
      map.set(ch.country, (map.get(ch.country) || 0) + 1)
    }
  }
  return Array.from(map.entries())
    .map(([code, count]) => ({
      code,
      name: parseCountryFromCode(code),
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

export function getLanguages(channels: Channel[]): { code: string; name: string; count: number }[] {
  const map = new Map<string, number>()
  for (const ch of channels) {
    if (ch.language) {
      map.set(ch.language, (map.get(ch.language) || 0) + 1)
    }
  }
  const LANG_NAMES: Record<string, string> = {
    eng: 'English', spa: 'Spanish', fra: 'French', deu: 'German',
    ita: 'Italian', por: 'Portuguese', rus: 'Russian', ara: 'Arabic',
    hin: 'Hindi', ben: 'Bengali', jpn: 'Japanese', kor: 'Korean',
    zho: 'Chinese', tur: 'Turkish', vie: 'Vietnamese', tha: 'Thai',
    ind: 'Indonesian', tam: 'Tamil', tel: 'Telugu', mar: 'Marathi',
    urd: 'Urdu', fas: 'Persian', pol: 'Polish', nld: 'Dutch',
    ell: 'Greek', swe: 'Swedish', dan: 'Danish', nor: 'Norwegian',
    fin: 'Finnish', ces: 'Czech', hun: 'Hungarian', ron: 'Romanian',
    ukr: 'Ukrainian', heb: 'Hebrew', cat: 'Catalan',
  }
  return Array.from(map.entries())
    .map(([code, count]) => ({
      code,
      name: LANG_NAMES[code] || code.toUpperCase(),
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

export function getChannelsByCategory(channels: Channel[], category: string): Channel[] {
  return channels.filter(ch => ch.category === category)
}

export const CATEGORY_ICONS: Record<string, string> = {
  sports: 'M15 10l4.5-2.5v9L15 14',
  movies: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z',
  news: 'M4 6h16M4 12h16M4 18h16',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 01-6 0 3 3 0 016 0zm12-2a3 3 0 01-6 0 3 3 0 016 0z',
  kids: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  documentary: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z',
  education: 'M12 14l9-5-9-5-9 5 9 5zm0 7l-7-4m14 0l-7 4',
  entertainment: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
  religious: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
}

export function getCategoryIcon(category: string): string {
  const key = Object.keys(CATEGORY_ICONS).find(k => category.toLowerCase().includes(k))
  return key ? CATEGORY_ICONS[key] : 'M4 6h16M4 12h16M4 18h16'
}

export function getCategoryGradient(category: string): string {
  const gradients: Record<string, string> = {
    sports: 'from-emerald-500/20 to-emerald-500/5',
    news: 'from-blue-500/20 to-blue-500/5',
    music: 'from-rose-500/20 to-rose-500/5',
    movies: 'from-violet-500/20 to-violet-500/5',
    kids: 'from-amber-500/20 to-amber-500/5',
    documentary: 'from-cyan-500/20 to-cyan-500/5',
    education: 'from-sky-500/20 to-sky-500/5',
    entertainment: 'from-pink-500/20 to-pink-500/5',
    religious: 'from-orange-500/20 to-orange-500/5',
  }
  const key = Object.keys(gradients).find(k => category.toLowerCase().includes(k))
  return key ? gradients[key] : 'from-lux-primary/20 to-lux-primary/5'
}
