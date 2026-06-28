import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import { parseM3U, mergeChannelsWithMeta } from './lib/parser.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

const BASE_URL = 'https://iptv-org.github.io/iptv'
let channelCache = null
let cacheTime = 0
const CACHE_TTL = 30 * 60 * 1000

async function fetchMetaIndex() {
  try {
    const res = await fetch(`${BASE_URL}/channels.json`)
    return await res.json()
  } catch {
    return []
  }
}

async function getChannels() {
  if (channelCache && Date.now() - cacheTime < CACHE_TTL) {
    return channelCache
  }
  const [m3uText, channelsJson] = await Promise.all([
    fetch(`${BASE_URL}/index.m3u`).then(r => r.text()),
    fetchMetaIndex(),
  ])
  const parsed = parseM3U(m3uText)
  const merged = mergeChannelsWithMeta(parsed, channelsJson)
  channelCache = merged.filter(ch => ch.name && ch.name !== 'Unknown')
  cacheTime = Date.now()
  return channelCache
}

app.get('/api/channels', async (req, res) => {
  try {
    const channels = await getChannels()
    res.json(channels)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channels' })
  }
})

app.get('/api/search', async (req, res) => {
  try {
    const { q, category } = req.query
    const channels = await getChannels()
    let results = [...channels]

    if (q) {
      const query = String(q).toLowerCase()
      results = results.filter(ch =>
        ch.name.toLowerCase().includes(query) ||
        ch.category?.toLowerCase().includes(query) ||
        ch.country?.toLowerCase().includes(query) ||
        ch.language?.toLowerCase().includes(query) ||
        ch.network?.toLowerCase().includes(query)
      )
    }
    if (category) {
      results = results.filter(ch => ch.category === category)
    }

    res.json(results.slice(0, 100))
  } catch (error) {
    res.status(500).json({ error: 'Search failed' })
  }
})

app.get('/api/category/:name', async (req, res) => {
  try {
    const { name } = req.params
    const response = await fetch(`${BASE_URL}/categories/${name}.m3u`)
    const text = await response.text()
    const parsed = parseM3U(text)
    const channelsJson = await fetchMetaIndex()
    const merged = mergeChannelsWithMeta(parsed, channelsJson)
    res.json(merged.filter(ch => ch.name && ch.name !== 'Unknown'))
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch category: ${req.params.name}` })
  }
})

app.get('/api/country/:code', async (req, res) => {
  try {
    const { code } = req.params
    const response = await fetch(`${BASE_URL}/countries/${code}.m3u`)
    const text = await response.text()
    const parsed = parseM3U(text)
    const channelsJson = await fetchMetaIndex()
    const merged = mergeChannelsWithMeta(parsed, channelsJson)
    res.json(merged.map(ch => ({ ...ch, country: code })).filter(ch => ch.name && ch.name !== 'Unknown'))
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch country: ${req.params.code}` })
  }
})

app.get('/api/language/:code', async (req, res) => {
  try {
    const { code } = req.params
    const response = await fetch(`${BASE_URL}/languages/${code}.m3u`)
    const text = await response.text()
    const parsed = parseM3U(text)
    const channelsJson = await fetchMetaIndex()
    const merged = mergeChannelsWithMeta(parsed, channelsJson)
    res.json(merged.map(ch => ({ ...ch, language: code })).filter(ch => ch.name && ch.name !== 'Unknown'))
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch language: ${req.params.code}` })
  }
})

app.get('/api/categories', async (req, res) => {
  try {
    const channels = await getChannels()
    const cats = new Set()
    for (const ch of channels) {
      if (ch.category && ch.category !== 'Undefined') cats.add(ch.category)
    }
    res.json(Array.from(cats).sort())
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', channels: channelCache ? channelCache.length : 0 })
})

app.listen(PORT, () => {
  console.log(`IPTV Lux API running on http://localhost:${PORT}`)
})
