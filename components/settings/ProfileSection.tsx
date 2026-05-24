'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateDisplayName } from '@/app/actions/profile'

type Props = {
  displayName: string | null
  email: string
}

export function ProfileSection({ displayName, email }: Props) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(displayName ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleSave() {
    setError('')
    setSaved(false)
    startTransition(async () => {
      const result = await updateDisplayName(name)
      if (result.error) {
        setError(result.error)
        return
      }
      setSaved(true)
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-stone-500">メールアドレス</Label>
        <Input id="email" value={email} disabled className="bg-stone-50 text-stone-500" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="display-name">表示名</Label>
        <Input
          id="display-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setSaved(false)
          }}
          placeholder="例：Shoya"
          maxLength={50}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-full bg-green-800 text-white hover:bg-green-900"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            '保存する'
          )}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            保存しました
          </span>
        )}
      </div>
    </div>
  )
}
