import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getCurrentGameweek } from '@/lib/fpl-helpers'

export async function GET() {
  try {
    console.log('Updating all leagues to current gameweek...\n')
    
    const currentGW = await getCurrentGameweek()
    
    console.log(`Current FPL gameweek: ${currentGW}`)
    
    const result = await prisma.league.updateMany({
      data: { currentGameweek: currentGW }
    })
    
    console.log(`Updated ${result.count} leagues to gameweek ${currentGW}`)
    
    return NextResponse.json({ 
      success: true, 
      gameweek: currentGW,
      leaguesUpdated: result.count
    })
  } catch (error: any) {
    console.error('Update failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
