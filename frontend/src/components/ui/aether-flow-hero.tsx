import React from 'react'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'

interface MouseState {
  x: number | null
  y: number | null
  radius: number
}

interface AetherFlowHeroProps {
  badge?: string
  title?: string
  description?: string
  ctaLabel?: string
  onCtaClick?: () => void
  /** Canvas particle field only — for login/signup backgrounds */
  backgroundOnly?: boolean
  className?: string
}

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2 + 0.5,
      duration: 0.8,
      ease: 'easeInOut',
    },
  }),
}

export function AetherFlowHero({
  badge = 'Dynamic Rendering Engine',
  title = 'Aether Flow',
  description = 'An intelligent, adaptive framework for creating fluid digital experiences that feel alive and respond to user interaction in real-time.',
  ctaLabel = 'Explore the Engine',
  onCtaClick,
  backgroundOnly = false,
  className,
}: AetherFlowHeroProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const canvasEl = canvas
    const context = ctx

    let animationFrameId = 0
    let particles: Particle[] = []
    const mouse: MouseState = { x: null, y: null, radius: 200 }

    class Particle {
      x: number
      y: number
      directionX: number
      directionY: number
      size: number
      color: string

      constructor(
        x: number,
        y: number,
        directionX: number,
        directionY: number,
        size: number,
        color: string,
      ) {
        this.x = x
        this.y = y
        this.directionX = directionX
        this.directionY = directionY
        this.size = size
        this.color = color
      }

      draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
      }

      update() {
        if (this.x > canvasEl.width || this.x < 0) {
          this.directionX = -this.directionX
        }
        if (this.y > canvasEl.height || this.y < 0) {
          this.directionY = -this.directionY
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < mouse.radius + this.size) {
            const forceDirectionX = dx / distance
            const forceDirectionY = dy / distance
            const force = (mouse.radius - distance) / mouse.radius
            this.x -= forceDirectionX * force * 5
            this.y -= forceDirectionY * force * 5
          }
        }

        this.x += this.directionX
        this.y += this.directionY
        this.draw()
      }
    }

    function init() {
      particles = []
      const numberOfParticles = (canvasEl.height * canvasEl.width) / 9000
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1
        const x = Math.random() * (canvasEl.width - size * 4) + size * 2
        const y = Math.random() * (canvasEl.height - size * 4) + size * 2
        const directionX = Math.random() * 0.4 - 0.2
        const directionY = Math.random() * 0.4 - 0.2
        const color = 'rgba(191, 128, 255, 0.8)'
        particles.push(new Particle(x, y, directionX, directionY, size, color))
      }
    }

    const resizeCanvas = () => {
      canvasEl.width = window.innerWidth
      canvasEl.height = window.innerHeight
      init()
    }

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const distance =
            (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x) +
            (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y)

          if (distance < (canvasEl.width / 7) * (canvasEl.height / 7)) {
            let opacityValue = 1 - distance / 20000

            const dxMouseA = particles[a].x - (mouse.x ?? 0)
            const dyMouseA = particles[a].y - (mouse.y ?? 0)
            const distanceMouseA = Math.sqrt(dxMouseA * dxMouseA + dyMouseA * dyMouseA)

            if (mouse.x !== null && distanceMouseA < mouse.radius) {
              context.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`
            } else {
              context.strokeStyle = `rgba(200, 150, 255, ${opacityValue})`
            }

            context.lineWidth = 1
            context.beginPath()
            context.moveTo(particles[a].x, particles[a].y)
            context.lineTo(particles[b].x, particles[b].y)
            context.stroke()
          }
        }
      }
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      context.fillStyle = 'black'
      context.fillRect(0, 0, canvasEl.width, canvasEl.height)

      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
      }
      connect()
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }

    const handleMouseOut = () => {
      mouse.x = null
      mouse.y = null
    }

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseout', handleMouseOut)
    resizeCanvas()
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseout', handleMouseOut)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div
      className={
        backgroundOnly
          ? `relative h-full min-h-screen w-full overflow-hidden ${className ?? ''}`
          : `relative flex h-screen w-full flex-col items-center justify-center overflow-hidden ${className ?? ''}`
      }
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 h-full w-full" />

      {!backgroundOnly && (
        <div className="relative z-10 p-6 text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-200">{badge}</span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-5xl font-bold tracking-tighter text-transparent md:text-8xl"
          >
            {title}
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto mb-10 max-w-2xl text-lg text-gray-400"
          >
            {description}
          </motion.p>

          <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
            <button
              type="button"
              onClick={onCtaClick}
              className="mx-auto flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-black shadow-lg transition-colors duration-300 hover:bg-gray-200"
            >
              {ctaLabel}
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AetherFlowHero
