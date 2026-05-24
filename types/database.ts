export type PlanType = 'free' | 'pro'

export type Profile = {
  id: string
  display_name: string | null
  plan: PlanType
  trial_ends_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

export type Goal = {
  id: string
  user_id: string
  title: string
  philosophy: string | null
  vision: string | null
  target_value: number | null
  target_unit: string | null
  deadline: string | null
  is_active: boolean
  created_at: string
}

export type Kpi = {
  id: string
  goal_id: string
  title: string
  target_value: number
  unit: string | null
  frequency: 'weekly' | 'monthly'
  created_at: string
}

export type KpiRecord = {
  id: string
  kpi_id: string
  value: number
  recorded_at: string
  memo: string | null
  created_at: string
}

export type MonthlyReview = {
  id: string
  goal_id: string
  year: number
  month: number
  achievement_rate: number | null
  comment: string | null
  next_action: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Omit<Profile, 'id'>> & { id: string }
        Update: Partial<Omit<Profile, 'id'>>
      }
      goals: {
        Row: Goal
        Insert: Omit<Goal, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<Goal, 'id' | 'created_at'>>
      }
      kpis: {
        Row: Kpi
        Insert: Omit<Kpi, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<Kpi, 'id' | 'created_at'>>
      }
      kpi_records: {
        Row: KpiRecord
        Insert: Omit<KpiRecord, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<KpiRecord, 'id' | 'created_at'>>
      }
      monthly_reviews: {
        Row: MonthlyReview
        Insert: Omit<MonthlyReview, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<MonthlyReview, 'id' | 'created_at'>>
      }
    }
    Enums: {
      plan_type: PlanType
    }
  }
}
