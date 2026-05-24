import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getProfile } from '@/lib/supabase/cached'
import { Goal, Kpi, KpiRecord } from '@/types/database'
import { GoalDetailView } from '@/components/goal/GoalDetailView'

type GoalWithKpis = Goal & { kpis: Kpi[] }

type Props = {
  params: Promise<{ id: string }>
}

export default async function GoalDetailPage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const plan = profile?.plan ?? 'free'
  const isTrial = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at) > new Date()
    : false
  const isPro = plan === 'pro' || isTrial

  const supabase = await createClient()

  const { data: goalData, error: goalError } = await supabase
    .from('goals')
    .select('*, kpis(*, kpi_records(*))')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (goalError || !goalData) notFound()

  const goal = goalData as GoalWithKpis
  const kpis = goal.kpis ?? []
  const kpiIds = kpis.map((k) => k.id)

  const latestRecordsByKpiId: Record<string, KpiRecord> = {}
  const recentRecordsByKpiId: Record<string, KpiRecord[]> = {}

  if (kpiIds.length > 0) {
    const { data: records } = await supabase
      .from('kpi_records')
      .select('*')
      .in('kpi_id', kpiIds)
      .order('recorded_at', { ascending: false })
      .order('created_at', { ascending: false })

    for (const record of (records ?? []) as KpiRecord[]) {
      if (!latestRecordsByKpiId[record.kpi_id]) {
        latestRecordsByKpiId[record.kpi_id] = record
      }
      if (!recentRecordsByKpiId[record.kpi_id]) {
        recentRecordsByKpiId[record.kpi_id] = []
      }
      if (recentRecordsByKpiId[record.kpi_id].length < 5) {
        recentRecordsByKpiId[record.kpi_id].push(record)
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <GoalDetailView
        goal={goal}
        kpis={kpis}
        latestRecordsByKpiId={latestRecordsByKpiId}
        recentRecordsByKpiId={recentRecordsByKpiId}
        isPro={isPro}
      />
    </div>
  )
}
