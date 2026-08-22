import { DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'

interface BudgetInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
  min?: number
  max?: number
  step?: number
}

export function BudgetInput({
  value,
  onChange,
  label = 'Available Budget',
  min = 50000,
  max = 5000000,
  step = 25000,
}: BudgetInputProps) {
  return (
    <div className="space-y-3">
      <Input
        label={label}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        icon={<DollarSign className="h-4 w-4" />}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
      <p className="text-sm text-text-secondary">
        Budget: <span className="font-medium text-accent">{formatCurrency(value)}</span>
      </p>
    </div>
  )
}
