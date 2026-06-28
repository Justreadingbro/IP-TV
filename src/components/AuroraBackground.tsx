import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number
}

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0
    let hidden = false

    const onVisibility = () => {
      hidden = document.hidden
      if (hidden && animationId) {
        cancelAnimationFrame(animationId)
      } else if (!hidden) {
        draw()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse)

    const initParticles = () => {
      particles.current = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.3 + 0.1,
        life: Math.random() * 0.5 + 0.5,
      }))
    }
    initParticles()

    const draw = () => {
      if (hidden) { animationId = requestAnimationFrame(draw); return }
      time += 0.003
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Aurora 1 - primary blue
      const g1x = canvas.width * 0.4 + Math.sin(time * 0.2) * canvas.width * 0.15
      const g1y = canvas.height * 0.25 + Math.sin(time * 0.15) * canvas.height * 0.1
      const g1 = ctx.createRadialGradient(g1x, g1y, 0, g1x, g1y, canvas.width * 0.5)
      g1.addColorStop(0, 'rgba(59, 130, 246, 0.06)')
      g1.addColorStop(0.3, 'rgba(59, 130, 246, 0.03)')
      g1.addColorStop(0.6, 'rgba(139, 92, 246, 0.02)')
      g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Aurora 2 - purple
      const g2x = canvas.width * 0.7 + Math.cos(time * 0.18) * canvas.width * 0.12
      const g2y = canvas.height * 0.55 + Math.sin(time * 0.12 + 1) * canvas.height * 0.1
      const g2 = ctx.createRadialGradient(g2x, g2y, 0, g2x, g2y, canvas.width * 0.45)
      g2.addColorStop(0, 'rgba(139, 92, 246, 0.05)')
      g2.addColorStop(0.4, 'rgba(59, 130, 246, 0.02)')
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Aurora 3 - green accent (subtle)
      const g3x = canvas.width * 0.15 + Math.sin(time * 0.22 + 2) * canvas.width * 0.1
      const g3y = canvas.height * 0.7 + Math.cos(time * 0.14) * canvas.height * 0.08
      const g3 = ctx.createRadialGradient(g3x, g3y, 0, g3x, g3y, canvas.width * 0.35)
      g3.addColorStop(0, 'rgba(34, 197, 94, 0.03)')
      g3.addColorStop(1, 'transparent')
      ctx.fillStyle = g3
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Mouse-reactive highlight
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      if (mx > 0 && my > 0) {
        const mouseGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 300)
        mouseGlow.addColorStop(0, 'rgba(59, 130, 246, 0.04)')
        mouseGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = mouseGlow
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Particles
      const w = canvas.width
      const h = canvas.height
      for (const p of particles.current) {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.002
        if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          p.x = Math.random() * w
          p.y = h + 10
          p.vx = (Math.random() - 0.5) * 0.3
          p.vy = -(Math.random() * 0.3 + 0.1)
          p.life = Math.random() * 0.5 + 0.5
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * p.life * 0.3})`
        ctx.fill()
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
