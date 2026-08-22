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

export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: '#22C55E',
    medium: '#EAB308',
    high: '#F97316',
    critical: '#EF4444',
  }
  return colors[level]
}

export function getRiskBgClass(level: RiskLevel): string {
  const classes: Record<RiskLevel, string> = {
    low: 'bg-success/15 text-success border-success/30',
    medium: 'bg-warning/15 text-warning border-warning/30',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    critical: 'bg-critical/15 text-critical border-critical/30',
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
