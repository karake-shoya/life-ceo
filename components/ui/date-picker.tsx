'use client'

import * as React from 'react'
import { ja } from 'date-fns/locale'
import { format, parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type Props = {
  value: string        // "YYYY-MM-DD" or ""
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// "YYYY-MM-DD" → Date（タイムゾーンずれなし）
function parseDate(str: string): Date | undefined {
  if (!str) return undefined
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Date → "YYYY-MM-DD"
function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DatePicker({ value, onChange, placeholder = '日付を選択', className }: Props) {
  const [open, setOpen] = React.useState(false)
  const selected = parseDate(value)

  const displayLabel = selected
    ? format(selected, 'yyyy年M月d日', { locale: ja })
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-stone-400',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-stone-400" />
          {displayLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? formatDate(date) : '')
            setOpen(false)
          }}
          locale={ja}
        />
      </PopoverContent>
    </Popover>
  )
}
