'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'

export default function DeleteTradeButton({ tradeId }: { tradeId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Supprimer ce trade définitivement ?')) return
    setLoading(true)

    const { error } = await supabase.from('trades').delete().eq('id', tradeId)

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    router.push('/journal')
    router.refresh()
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      icon={loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    >
      Supprimer
    </Button>
  )
}
