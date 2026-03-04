import { finaliseGameweek } from "@/lib/gameweek-finalisation"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {

  const body = await request.json()
  const { leagueId, gameweek } = body


  // Temporary
  if (!leagueId || !gameweek) {
    return NextResponse.json(
      { error: 'leagueId and gameweek are required' },
      { status: 400 }
    )
  }

  try {
    const result = await finaliseGameweek(leagueId, gameweek)
    return NextResponse.json({
      success: true,
      message: `Gameweek ${gameweek} finalised for all member(s)`
    })
  } catch (error) {
    console.error('Finalisation error:', error)
    return NextResponse.json(
      { error: 'Finalisation failed. The league has been unlocked.' },
      { status: 500 }
    )
  }
}
