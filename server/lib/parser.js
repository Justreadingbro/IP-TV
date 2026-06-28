const COUNTRY_SUFFIXES = /\.(us|uk|gb|in|ca|au|de|fr|it|es|br|jp|cn|kr|ru|ar|mx|nl|se|no|dk|fi|pt|pl|tr|gr|cz|hu|ro|il|ie|at|ch|be|nz|za|sg|my|hk|tw|th|vn|ph|id|bd|pk|ng|eg|sa|ae|cl|co|pe|ua|by|kz|ir|iq|ps|jo|lb|ma|dz|tn|ke|gh)$/i
const TECH_SUFFIXES = /@(SD|HD|FHD|4K|UHD|HDR|HEVC|AVC|x265|x264|HQ|LQ|MQ|WEBRIP|WEB-DL|BluRay|BRRip)$/i
const CAMEL_CASE = /([a-z])([A-Z])/g
const DIGIT_WORD = /([a-zA-Z])(\d)/g
const WORD_DIGIT = /(\d)([a-zA-Z])/g

function normalizeChannelName(raw) {
  if (!raw || raw === 'Unknown') return 'Unknown'

  let name = raw.trim()
  name = name.replace(TECH_SUFFIXES, '')
  name = name.replace(COUNTRY_SUFFIXES, '')
  name = name.replace(CAMEL_CASE, '$1 $2')
  name = name.replace(DIGIT_WORD, '$1 $2')
  name = name.replace(WORD_DIGIT, '$1 $2')
  name = name.replace(/[_|]+/g, ' ')
  name = name.replace(/\s*-\s*/g, ' ')
  name = name.replace(/\s+/g, ' ')
  name = name.replace(/[.\s]+$/, '')
  name = name.trim()

  name = name.split(' ').map(word => {
    const lower = word.toLowerCase()
    const abbreviations = {
      unite: 'united', univ: 'university', natl: 'national',
      intl: 'international', ch: 'channel', tv: 'TV',
      hd: 'HD', sd: 'SD', fhd: 'FHD', uhd: 'UHD',
      int: 'international', ent: 'entertainment', docu: 'documentary',
      info: 'information', mgzn: 'magazine', plus: '+', pls: '+',
      xtra: 'extra', xtr: 'extra',
    }
    if (abbreviations[lower]) return abbreviations[lower]
    return word
  }).join(' ')

  name = name.split(' ').map(word => {
    if (word.length <= 2 && word !== word.toUpperCase()) return word
    if (word === word.toUpperCase() && word.length > 1 && word.length < 5) return word
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join(' ')

  name = name.replace(/\bTv\b/g, 'TV')
  name = name.replace(/\bHd\b/g, 'HD')
  name = name.replace(/\bSd\b/g, 'SD')
  name = name.replace(/\b4K\b/g, '4K')
  name = name.replace(/\bUk\b/g, 'UK')
  name = name.replace(/\bUsa\b/g, 'USA')
  name = name.replace(/\bUs\b/g, 'US')
  name = name.trim()

  return name || 'Unknown'
}

function extractFilename(url) {
  try {
    const u = new URL(url)
    const name = u.pathname.split('/').pop() || ''
    return decodeURIComponent(name.replace(/\.(m3u8|mp4|ts|flv|m4s)$/, '').replace(/[_-]/g, ' '))
  } catch {
    return ''
  }
}

function urlToReadableName(url) {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '').split('.')[0]
    const path = u.pathname.replace(/\/[^/]+$/, '').split('/').filter(Boolean)
    const parts = [host, ...path.map(p => p.replace(/[_-]/g, ' '))]
    return parts.filter(Boolean).join(' - ').replace(/\b\w/g, c => c.toUpperCase())
  } catch {
    return ''
  }
}

export function parseM3U(content) {
  const lines = content.split('\n')
  const channels = []
  let currentExtInf = null

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('#EXTINF:')) {
      const extinfMatch = trimmed.match(/#EXTINF:-?[\d.]+.*,(.+)/)
      const extinfDisplay = extinfMatch?.[1]?.trim() || ''

      const tvgId = trimmed.match(/tvg-id="([^"]*)"/)?.[1] || ''
      const tvgName = trimmed.match(/tvg-name="([^"]*)"/)?.[1] || ''
      const channelName = trimmed.match(/channel-name="([^"]*)"/)?.[1] || ''
      const tvgLogo = trimmed.match(/tvg-logo="([^"]*)"/)?.[1] || ''
      const groupTitle = trimmed.match(/group-title="([^"]*)"/)?.[1] || 'Undefined'

      currentExtInf = {
        id: tvgId || `ch-${channels.length}`,
        tvgId,
        tvgName,
        channelName,
        logo: tvgLogo,
        category: groupTitle,
        extinfDisplay,
      }
    } else if (trimmed.startsWith('http') && currentExtInf) {
      const rawName = (
        currentExtInf.tvgName ||
        currentExtInf.channelName ||
        (currentExtInf.tvgId && currentExtInf.tvgId !== 'unknown' ? currentExtInf.tvgId : '') ||
        currentExtInf.extinfDisplay ||
        extractFilename(trimmed) ||
        urlToReadableName(trimmed)
      ).trim()

      const name = normalizeChannelName(rawName)

      let resolution
      const resMatch = trimmed.match(/[&?]resolution=(\d+)x(\d+)/i)
      if (resMatch) {
        const h = parseInt(resMatch[2])
        if (h >= 2160) resolution = '4K'
        else if (h >= 1080) resolution = 'FHD'
        else if (h >= 720) resolution = 'HD'
        else if (h >= 576) resolution = 'SD'
        else if (h >= 480) resolution = 'SD'
      }
      const qualityMatch = trimmed.match(/@(SD|HD|FHD|4K|UHD)/i)
      if (!resolution && qualityMatch) resolution = qualityMatch[1].toUpperCase()

      channels.push({
        id: currentExtInf.tvgId || currentExtInf.id || `ch-${channels.length}`,
        name,
        logo: currentExtInf.logo || '',
        url: trimmed,
        category: currentExtInf.category || 'Undefined',
        country: '',
        language: '',
        tvgId: currentExtInf.tvgId || '',
        tvgName: currentExtInf.tvgName || '',
        normalizedName: name,
        resolution,
        hasMetadata: name !== 'Unknown' && !!currentExtInf.logo,
      })
      currentExtInf = null
    }
  }

  return channels
}

export function mergeChannelsWithMeta(m3uChannels, channelsJson) {
  const metaMap = new Map()
  if (Array.isArray(channelsJson)) {
    for (const entry of channelsJson) {
      if (entry.id) {
        metaMap.set(entry.id, entry)
        if (entry.altNames) {
          for (const alt of entry.altNames) {
            metaMap.set(alt.toLowerCase().replace(/\s+/g, ''), entry)
          }
        }
      }
    }
  }

  for (const ch of m3uChannels) {
    const meta = metaMap.get(ch.tvgId) || metaMap.get(ch.id)
    if (meta) {
      ch.name = meta.name || ch.name
      ch.normalizedName = normalizeChannelName(ch.name)
      ch.logo = ch.logo || meta.logo || ''
      ch.country = ch.country || meta.country || ''
      ch.language = (meta.languages && meta.languages.length > 0) ? meta.languages[0] : ch.language
      ch.altNames = meta.altNames || []
      ch.network = meta.network || ''
      ch.website = meta.website || ''
      ch.hasMetadata = true
      if (meta.categories && meta.categories.length > 0) {
        ch.category = meta.categories[0]
      }
    }
  }

  return m3uChannels
}
