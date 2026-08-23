import { Link, useNavigate } from 'react-router-dom'
import { AetherFlowHero } from '@/components/ui/aether-flow-hero'
import { Button } from '@/components/ui/Button'

const FEATURE_IMAGES = [
  {
    title: 'Bridge Monitoring',
    image: 'https://images.unsplash.com/photo-1545558014-869207a87d19?w=800&q=80',
  },
  {
    title: 'Road Network Analysis',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
  },
  {
    title: 'Critical Infrastructure',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="bg-black">
      <header className="fixed top-0 z-20 flex w-full items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" className="text-lg font-semibold tracking-tight text-white">
          INFRA<span className="text-accent">-X</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </header>

      <AetherFlowHero
        badge="Infrastructure Intelligence Platform"
        title="INFRA-X"
        description="Monitor inspected roads and nearby critical infrastructure in real time. Predict risk, simulate repairs, and prioritize maintenance from live AI inspections."
        ctaLabel="Launch Dashboard"
        onCtaClick={() => navigate('/login')}
      />

      <section className="border-t border-white/10 bg-background px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {FEATURE_IMAGES.map((feature) => (
            <article
              key={feature.title}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <img
                src={feature.image}
                alt={feature.title}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="text-sm font-medium text-text-primary">{feature.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
