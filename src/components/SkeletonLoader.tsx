import { memo } from 'react'
import { motion } from 'framer-motion'

interface SkeletonProps {
  count?: number
  variant?: 'card' | 'row' | 'hero' | 'channel-card'
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-video skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton w-3/4 rounded" />
        <div className="h-3 skeleton w-1/2 rounded" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-3 card">
      <div className="w-16 h-12 skeleton rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 skeleton w-2/3 rounded" />
        <div className="h-3 skeleton w-1/3 rounded" />
      </div>
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="relative w-full aspect-[21/9] max-h-[70vh] rounded-3xl overflow-hidden mb-8">
      <div className="absolute inset-0 skeleton" />
      <div className="absolute bottom-0 left-0 p-8 md:p-12 space-y-4 w-full max-w-xl">
        <div className="h-3 skeleton w-24 rounded-full" />
        <div className="h-8 skeleton w-full rounded-lg" />
        <div className="h-4 skeleton w-3/4 rounded-lg" />
        <div className="flex gap-3">
          <div className="h-10 skeleton w-28 rounded-xl" />
          <div className="h-10 skeleton w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonChannelCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a]"
    >
      <div className="aspect-[4/3] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton w-2/3 rounded" />
        <div className="flex gap-2">
          <div className="h-2.5 skeleton w-16 rounded" />
          <div className="h-2.5 skeleton w-10 rounded" />
        </div>
      </div>
    </motion.div>
  )
}

const SkeletonLoader = memo(function SkeletonLoader({ count = 8, variant = 'card' }: SkeletonProps) {
  return (
    <div className={variant === 'row' ? 'space-y-2' : 'channel-grid'}>
      {Array.from({ length: count }).map((_, i) => {
        if (variant === 'channel-card') return <SkeletonChannelCard key={i} />
        return variant === 'card' ? <SkeletonCard key={i} /> : <SkeletonRow key={i} />
      })}
    </div>
  )
})

export default SkeletonLoader
