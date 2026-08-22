import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useThemeStore } from '@/store/useThemeStore'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal() {
  const reducedMotion = useThemeStore((s) => s.reducedMotion)

  useEffect(() => {
    if (reducedMotion) return

    const revealElements = gsap.utils.toArray<HTMLElement>('[data-reveal]')
    revealElements.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    const staggerContainers = gsap.utils.toArray<HTMLElement>('[data-stagger]')
    staggerContainers.forEach((container) => {
      const children = container.children
      gsap.fromTo(
        children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [reducedMotion])
}
