import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThemeStore } from '@/store/useThemeStore'

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useThemeStore((s) => s.reducedMotion)

  useEffect(() => {
    if (!containerRef.current || reducedMotion) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const geometry = new THREE.IcosahedronGeometry(1.8, 1)
    const material = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 120
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 12
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.03,
      transparent: true,
      opacity: 0.4,
    })
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      mesh.rotation.x += 0.001
      mesh.rotation.y += 0.002
      particles.rotation.y += 0.0005
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [reducedMotion])

  if (reducedMotion) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-60"
      aria-hidden
    />
  )
}
