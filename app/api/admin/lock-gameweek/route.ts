import { NextResponse } from 'next/server'
import { lockAllLeagues } from '@/lib/gameweek-lock'

export async function POST() {
  try {
    await lockAllLeagues()
    return NextResponse.json({ success: true, message: 'All leagues locked' })
  } catch (error) {
    console.error('Lock failed:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
