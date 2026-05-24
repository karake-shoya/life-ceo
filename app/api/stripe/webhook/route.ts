import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { PlanType } from '@/types/database'
import { stripe } from '@/lib/stripe/client'

// RLSを迂回してサーバー側からプロフィールを更新するためにサービスロールキーを使用
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type ProfileUpdate = {
  plan?: PlanType
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string | null
        const subscriptionId = session.subscription as string | null
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('[webhook] checkout.session.completed: metadata.userId が未設定')
          break
        }

        const update: ProfileUpdate = {
          plan: 'pro',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
        }
        await supabaseAdmin.from('profiles').update(update).eq('id', userId)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const update: ProfileUpdate = { plan: 'free', stripe_subscription_id: null }
        await supabaseAdmin
          .from('profiles')
          .update(update)
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.error('[webhook] invoice.payment_failed:', invoice.id, invoice.customer)
        break
      }
    }
  } catch (err) {
    console.error('[webhook] 処理エラー:', event.type, err)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
