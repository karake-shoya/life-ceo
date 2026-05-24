import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証エラー' }, { status: 401 })
  }

  const { priceId } = await request.json() as { priceId: string }
  if (!priceId) {
    return NextResponse.json({ error: 'priceId が必要です' }, { status: 400 })
  }

  // 既存の stripe_customer_id を取得
  const { data: profileData } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()
  const profile = profileData as { stripe_customer_id: string | null } | null

  let customerId = profile?.stripe_customer_id ?? null

  // Customer が未作成なら作成して profiles に保存
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { user_id: user.id },
    },
    success_url: `${appUrl}/settings?checkout=success`,
    cancel_url: `${appUrl}/settings`,
  })

  return NextResponse.json({ url: session.url })
}
