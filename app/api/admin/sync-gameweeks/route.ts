import { NextResponse } from 'next/server'
import { syncGameweeks } from '@/lib/fpl-sync'

export async function POST() {
  try {
    const result = await syncGameweeks()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Gameweek sync failed:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
