export interface Channel {
  id: string
  name: string
  logo: string
  url: string
  category: string
  country: string
  language: string
  tvgId: string
  tvgName: string
  channelName?: string
  extinfDisplay?: string
  normalizedName?: string
  premiumLogo?: string
  resolution?: string
  epg?: EPGEntry[]
  altNames?: string[]
  network?: string
  website?: string
  hasMetadata: boolean
}

export function isChannelValid(ch: Channel): boolean {
  return ch.name !== 'Unknown' && ch.name.trim().length > 0
}

export function hasValidMetadata(ch: Channel): boolean {
  return isChannelValid(ch) && ch.hasMetadata && !!(ch.logo || ch.name)
}

export interface EPGEntry {
  start: string
  stop: string
  title: string
  description?: string
}

export interface Category {
  name: string
  count: number
  url: string
  icon?: string
}

export interface Country {
  code: string
  name: string
  flag: string
  count: number
  url: string
}

export interface Language {
  code: string
  name: string
  count: number
  url: string
}

export interface IptvChannelMeta {
  id: string
  name: string
  altNames?: string[]
  network?: string
  country?: string
  subdivision?: string
  city?: string
  languages?: string[]
  categories?: string[]
  logo?: string
  website?: string
  isNSFW?: boolean
  launched?: string
  closed?: string
}

export type ViewType = 'grid' | 'list'

export type PageRoute =
  | 'home'
  | 'live'
  | 'search'
  | 'categories'
  | 'countries'
  | 'languages'
  | 'favorites'
  | 'history'
  | 'settings'
