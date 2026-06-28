import { Channel, IptvChannelMeta } from '../types/index'

const COUNTRY_SUFFIXES = /\.(us|uk|gb|in|ca|au|de|fr|it|es|br|jp|cn|kr|ru|ar|mx|nl|se|no|dk|fi|pt|pl|tr|gr|cz|hu|ro|il|ie|at|ch|be|nz|za|sg|my|hk|tw|th|vn|ph|id|bd|pk|ng|eg|sa|ae|cl|co|pe|ua|by|kz|ir|iq|ps|jo|lb|ma|dz|tn|ke|gh)$/i
const TECH_SUFFIXES = /@(SD|HD|FHD|4K|UHD|HDR|HEVC|AVC|x265|x264|HQ|LQ|MQ|WEBRIP|WEB-DL|BluRay|BRRip)$/i
const CAMEL_CASE = /([a-z])([A-Z])/g
const DIGIT_WORD = /([a-zA-Z])(\d)/g
const WORD_DIGIT = /(\d)([a-zA-Z])/g

const COMMON_ABBREVIATIONS: Record<string, string> = {
  unite: 'united',
  univ: 'university',
  natl: 'national',
  intl: 'international',
  ch: 'channel',
  tv: 'TV',
  hd: 'HD',
  sd: 'SD',
  fhd: 'FHD',
  uhd: 'UHD',
  int: 'international',
  ent: 'entertainment',
  docu: 'documentary',
  info: 'information',
  mgzn: 'magazine',
  plus: '+',
  pls: '+',
  xtra: 'extra',
  xtr: 'extra',
}

export function normalizeChannelName(raw: string): string {
  if (!raw || raw === 'Unknown') return 'Unknown'

  let name = raw.trim()

  // Remove tech quality suffixes
  name = name.replace(TECH_SUFFIXES, '')

  // Remove trailing country code suffixes
  name = name.replace(COUNTRY_SUFFIXES, (match) => {
    return ''
  })

  // Split camelCase and number-word boundaries
  name = name.replace(CAMEL_CASE, '$1 $2')
  name = name.replace(DIGIT_WORD, '$1 $2')
  name = name.replace(WORD_DIGIT, '$1 $2')

  // Replace underscores, pipes, dashes with spaces
  name = name.replace(/[_|]+/g, ' ')
  name = name.replace(/\s*-\s*/g, ' ')

  // Collapse multiple spaces
  name = name.replace(/\s+/g, ' ')

  // Remove trailing punctuation
  name = name.replace(/[.\s]+$/, '')

  // Remove leading/trailing whitespace
  name = name.trim()

  // Expand common abbreviations
  name = name.split(' ').map(word => {
    const lower = word.toLowerCase()
    if (COMMON_ABBREVIATIONS[lower]) return COMMON_ABBREVIATIONS[lower]
    return word
  }).join(' ')

  // Title case each word
  name = name.split(' ').map(word => {
    if (word.length <= 2 && word !== word.toUpperCase()) return word
    if (word === word.toUpperCase() && word.length > 1 && word.length < 5) return word
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join(' ')

  // Fix specific patterns
  name = name.replace(/\bTv\b/g, 'TV')
  name = name.replace(/\bHd\b/g, 'HD')
  name = name.replace(/\bSd\b/g, 'SD')
  name = name.replace(/\b4K\b/g, '4K')
  name = name.replace(/\bUk\b/g, 'UK')
  name = name.replace(/\bUsa\b/g, 'USA')
  name = name.replace(/\bUs\b/g, 'US')

  name = name.trim()

  if (!name) return 'Unknown'
  return name
}

function extractFilename(url: string): string {
  try {
    const path = new URL(url).pathname
    const name = path.split('/').pop() || ''
    return decodeURIComponent(name.replace(/\.(m3u8|mp4|ts|flv|m4s)$/, '').replace(/[_-]/g, ' '))
  } catch {
    return ''
  }
}

function urlToReadableName(url: string): string {
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

export function resolveChannelName(
  tvgName: string,
  channelName: string,
  tvgId: string,
  extinfDisplay: string,
  url: string,
): string {
  const candidate = (
    tvgName ||
    channelName ||
    (tvgId && tvgId !== 'unknown' ? tvgId : '') ||
    extinfDisplay ||
    extractFilename(url) ||
    urlToReadableName(url)
  ).trim()

  return normalizeChannelName(candidate)
}

export function getInitials(name: string): string {
  if (!name || name === 'Unknown') return '?'
  return name
    .split(/[\s&]+/)
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('')
}

export function parseResolution(url: string): string | undefined {
  const resMatch = url.match(/[&?]resolution=(\d+)x(\d+)/i)
  if (resMatch) {
    const h = parseInt(resMatch[2])
    if (h >= 2160) return '4K'
    if (h >= 1080) return 'FHD'
    if (h >= 720) return 'HD'
    if (h >= 576) return 'SD'
    if (h >= 480) return 'SD'
  }
  return undefined
}

export function parseQualityFromUrl(url: string): string | undefined {
  const qualityMatch = url.match(/@(SD|HD|FHD|4K|UHD)/i)
  if (qualityMatch) return qualityMatch[1].toUpperCase()
  return parseResolution(url)
}

export function parseM3U(content: string): Channel[] {
  const lines = content.split('\n')
  const channels: Channel[] = []
  let currentExtInf: Partial<Channel> | null = null

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

      const normalized = normalizeChannelName(rawName)
      const resolution = parseQualityFromUrl(trimmed)

      channels.push({
        id: currentExtInf.tvgId || currentExtInf.id || `ch-${channels.length}`,
        name: normalized,
        logo: currentExtInf.logo || '',
        url: trimmed,
        category: currentExtInf.category || 'Undefined',
        country: '',
        language: '',
        tvgId: currentExtInf.tvgId || '',
        tvgName: currentExtInf.tvgName || '',
        normalizedName: normalized,
        premiumLogo: normalized !== 'Unknown' ? getInitials(normalized) : '',
        resolution,
        hasMetadata: normalized !== 'Unknown' && !!currentExtInf.logo,
      })
      currentExtInf = null
    }
  }

  return channels
}

export function mergeChannelsWithMeta(
  m3uChannels: Channel[],
  metaIndex: Map<string, IptvChannelMeta>,
): Channel[] {
  const merged = new Map<string, Channel>()

  for (const ch of m3uChannels) {
    const meta = metaIndex.get(ch.tvgId) || metaIndex.get(ch.id)
    if (meta) {
      ch.name = meta.name || ch.name
      ch.normalizedName = normalizeChannelName(ch.name)
      ch.logo = ch.logo || meta.logo || ''
      ch.country = ch.country || meta.country || ''
      ch.language = (meta.languages && meta.languages.length > 0) ? meta.languages[0] : ch.language
      ch.altNames = meta.altNames
      ch.network = meta.network
      ch.website = meta.website
      ch.hasMetadata = true

      if (meta.categories && meta.categories.length > 0) {
        ch.category = meta.categories[0]
      }
    }
    merged.set(ch.id || ch.tvgId, ch)
  }

  return Array.from(merged.values())
}

export function parseCountryFromCode(code: string): string {
  const names: Record<string, string> = {
    af: 'Afghanistan', al: 'Albania', dz: 'Algeria', ad: 'Andorra',
    ao: 'Angola', ar: 'Argentina', am: 'Armenia', au: 'Australia',
    at: 'Austria', az: 'Azerbaijan', bh: 'Bahrain', bd: 'Bangladesh',
    by: 'Belarus', be: 'Belgium', bj: 'Benin', bo: 'Bolivia',
    ba: 'Bosnia and Herzegovina', br: 'Brazil', bn: 'Brunei',
    bg: 'Bulgaria', bf: 'Burkina Faso', kh: 'Cambodia', cm: 'Cameroon',
    ca: 'Canada', cl: 'Chile', cn: 'China', co: 'Colombia',
    cr: 'Costa Rica', hr: 'Croatia', cu: 'Cuba', cy: 'Cyprus',
    cz: 'Czech Republic', dk: 'Denmark', do: 'Dominican Republic',
    ec: 'Ecuador', eg: 'Egypt', sv: 'El Salvador', ee: 'Estonia',
    et: 'Ethiopia', fi: 'Finland', fr: 'France', ge: 'Georgia',
    de: 'Germany', gh: 'Ghana', gr: 'Greece', gt: 'Guatemala',
    hn: 'Honduras', hk: 'Hong Kong', hu: 'Hungary', is: 'Iceland',
    in: 'India', id: 'Indonesia', ir: 'Iran', iq: 'Iraq',
    ie: 'Ireland', il: 'Israel', it: 'Italy', jm: 'Jamaica',
    jp: 'Japan', jo: 'Jordan', kz: 'Kazakhstan', ke: 'Kenya',
    kw: 'Kuwait', kg: 'Kyrgyzstan', la: 'Laos', lv: 'Latvia',
    lb: 'Lebanon', ly: 'Libya', li: 'Liechtenstein', lt: 'Lithuania',
    lu: 'Luxembourg', mo: 'Macau', mg: 'Madagascar', my: 'Malaysia',
    mv: 'Maldives', ml: 'Mali', mt: 'Malta', mx: 'Mexico',
    md: 'Moldova', mc: 'Monaco', mn: 'Mongolia', me: 'Montenegro',
    ma: 'Morocco', mz: 'Mozambique', mm: 'Myanmar', np: 'Nepal',
    nl: 'Netherlands', nz: 'New Zealand', ni: 'Nicaragua',
    ne: 'Niger', ng: 'Nigeria', kp: 'North Korea', no: 'Norway',
    om: 'Oman', pk: 'Pakistan', ps: 'Palestine', pa: 'Panama',
    py: 'Paraguay', pe: 'Peru', ph: 'Philippines', pl: 'Poland',
    pt: 'Portugal', qa: 'Qatar', ro: 'Romania', ru: 'Russia',
    sa: 'Saudi Arabia', sn: 'Senegal', rs: 'Serbia', sg: 'Singapore',
    sk: 'Slovakia', si: 'Slovenia', za: 'South Africa',
    kr: 'South Korea', es: 'Spain', lk: 'Sri Lanka', sd: 'Sudan',
    se: 'Sweden', ch: 'Switzerland', sy: 'Syria', tw: 'Taiwan',
    tj: 'Tajikistan', tz: 'Tanzania', th: 'Thailand', tn: 'Tunisia',
    tr: 'Turkey', tm: 'Turkmenistan', ug: 'Uganda', ua: 'Ukraine',
    ae: 'United Arab Emirates', gb: 'United Kingdom', us: 'United States',
    uy: 'Uruguay', uz: 'Uzbekistan', ve: 'Venezuela', vn: 'Vietnam',
    ye: 'Yemen', zw: 'Zimbabwe',
  }
  return names[code.toLowerCase()] || code.toUpperCase()
}

export function getFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase()
  if (code.length !== 2) return '🌍'
  const offset = 0x1F1E6 - 65
  return String.fromCodePoint(code.charCodeAt(0) + offset, code.charCodeAt(1) + offset)
}
