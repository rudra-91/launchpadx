import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { RiskLevel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 35) return 'medium'
  return 'low'
}

export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  }
  return labels[level]
}

/** Semantic risk colors — muted, small visual area only */
export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: '#5F7A63',
    medium: '#A8904E',
    high: '#A87A48',
    critical: '#A85A4C',
  }
  return colors[level]
}

export function getRiskBgClass(level: RiskLevel): string {
  const classes: Record<RiskLevel, string> = {
    low: 'bg-[color:var(--risk-low)]/12 text-[color:var(--risk-low)] border border-[color:var(--risk-low)]/25',
    medium:
      'bg-[color:var(--risk-medium)]/12 text-[color:var(--risk-medium)] border border-[color:var(--risk-medium)]/25',
    high: 'bg-[color:var(--risk-high)]/12 text-[color:var(--risk-high)] border border-[color:var(--risk-high)]/25',
    critical:
      'bg-[color:var(--risk-critical)]/12 text-[color:var(--risk-critical)] border border-[color:var(--risk-critical)]/25',
  }
  return classes[level]
}

export function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Chart palette — graphite / taupe / warm grey (no rainbow) */
export const CHART_PALETTE = {
  primary: '#795238',
  secondary: '#AEA7A3',
  tertiary: '#525254',
  quaternary: '#363636',
  grid: 'rgba(255,255,255,0.05)',
  axis: '#85817D',
} as const
