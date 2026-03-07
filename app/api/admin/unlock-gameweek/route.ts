import { NextResponse } from 'next/server'
import { unlockAllLeagues } from '@/lib/gameweek-lock'

export async function POST() {
  try {
    await unlockAllLeagues()
    return NextResponse.json({ success: true, message: 'All leagues unlocked' })
  } catch (error) {
    console.error('Unlock failed:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
