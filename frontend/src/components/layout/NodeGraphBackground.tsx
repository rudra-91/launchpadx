import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThemeStore } from '@/store/useThemeStore'

const ACCENT = 0x60a5fa

function buildGraph(nodeCount: number, spread: number) {
  const nodes: THREE.Vector3[] = []
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.55,
        (Math.random() - 0.5) * spread * 0.35,
      ),
    )
  }

  const linePositions: number[] = []
  const maxDistance = spread * 0.32

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].distanceTo(nodes[j]) < maxDistance) {
        linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z)
        linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z)
      }
    }
  }

  return { nodes, linePositions }
}

export function NodeGraphBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useThemeStore((s) => s.reducedMotion)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const isMobile = window.innerWidth < 768
    const nodeCount = isMobile ? 14 : 28
    const spread = isMobile ? 7 : 11

    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100)
    camera.position.z = 13

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const graph = buildGraph(nodeCount, spread)
    const basePositions = graph.nodes.map((n) => n.clone())

    const pointsGeometry = new THREE.BufferGeometry()
    const pointPositions = new Float32Array(nodeCount * 3)
    graph.nodes.forEach((node, i) => {
      pointPositions[i * 3] = node.x
      pointPositions[i * 3 + 1] = node.y
      pointPositions[i * 3 + 2] = node.z
    })
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3))

    const points = new THREE.Points(
      pointsGeometry,
      new THREE.PointsMaterial({
        color: ACCENT,
        size: 0.05,
        transparent: true,
        opacity: 0.28,
        sizeAttenuation: true,
      }),
    )

    const linesGeometry = new THREE.BufferGeometry()
    linesGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(graph.linePositions, 3),
    )
    const lines = new THREE.LineSegments(
      linesGeometry,
      new THREE.LineBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0.1,
      }),
    )

    const group = new THREE.Group()
    group.add(points)
    group.add(lines)
    scene.add(group)

    const mouse = { x: 0, y: 0 }
    let animationId = 0
    let time = 0
    let visible = true

    const handleMouseMove = (event: MouseEvent) => {
      if (window.innerWidth < 768 || reducedMotion) return
      mouse.x = (event.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (event.clientY / window.innerHeight - 0.5) * 2
    }

    const handleVisibility = () => {
      visible = document.visibilityState === 'visible'
    }

    const render = () => renderer.render(scene, camera)

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      if (!visible) return

      time += 0.003
      const positions = pointsGeometry.attributes.position.array as Float32Array

      for (let i = 0; i < nodeCount; i++) {
        const base = basePositions[i]
        positions[i * 3] = base.x + Math.sin(time + i * 0.6) * 0.08
        positions[i * 3 + 1] = base.y + Math.cos(time * 0.7 + i * 0.4) * 0.06
        positions[i * 3 + 2] = base.z + Math.sin(time * 0.5 + i * 0.3) * 0.05
      }
      pointsGeometry.attributes.position.needsUpdate = true

      group.rotation.y = Math.sin(time * 0.25) * 0.04 + mouse.x * 0.02
      group.rotation.x = Math.cos(time * 0.2) * 0.03 + mouse.y * 0.015

      render()
    }

    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('visibilitychange', handleVisibility)

    if (reducedMotion) {
      render()
    } else {
      animate()
    }

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibility)
      renderer.dispose()
      pointsGeometry.dispose()
      linesGeometry.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [reducedMotion])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 opacity-20"
      aria-hidden
    />
  )
}
