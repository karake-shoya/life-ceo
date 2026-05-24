import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Stripe Webhook（実装予定）
  return NextResponse.json({ received: true })
}
