import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useThemeStore } from '@/store/useThemeStore'

export function useScrollReveal() {
  const reducedMotion = useThemeStore((s) => s.reducedMotion)
  const location = useLocation()

  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const staggerItems = document.querySelectorAll<HTMLElement>('[data-stagger] > *')

    if (reducedMotion) {
      revealItems.forEach((el) => el.classList.add('is-visible'))
      staggerItems.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    )

    revealItems.forEach((el) => {
      el.classList.add('scroll-reveal')
      observer.observe(el)
    })

    staggerItems.forEach((el, index) => {
      el.classList.add('scroll-reveal')
      el.style.transitionDelay = `${index * 40}ms`
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [reducedMotion, location.pathname])
}
