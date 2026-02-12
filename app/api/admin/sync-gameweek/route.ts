import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getCurrentGameweek } from '@/lib/fpl-helpers'

export async function POST(request: Request) {
  try {
    // Get which gameweek to sync from request body
    const body = await request.json()
    const gameweek = body.gameweek || await getCurrentGameweek()

    console.log(`\nSyncing Gameweek ${gameweek} stats...\n`)

    // Fetch live gameweek data from FPL API
    const response = await fetch(
      `https://fantasy.premierleague.com/api/event/${gameweek}/live/`
    )

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.status}`)
    }

    const data = await response.json()
    
    console.log(`Received data for ${data.elements.length} players\n`)

    let created = 0
    let updated = 0
    let errors = 0
    let skipped = 0

    // Loop through each player's gameweek stats
    for (const element of data.elements) {
      try {
        const stats = element.stats

        // Find the player in the database by FPL ID
        const player = await prisma.player.findUnique({
          where: { fplId: element.id }
        })

        if (!player) {
          skipped++
          continue // Skip players not in the database
        }

        // Calculate total points for this gameweek
        const points = stats.total_points || 0
        const minutes = stats.minutes || 0

        // Upsert (create or update) the gameweek record
        const result = await prisma.playerGameweek.upsert({
          where: {
            playerId_gameweek: {
              playerId: player.id,
              gameweek
            }
          },
          create: {
            playerId: player.id,
            gameweek,
            points,
            minutes,
            goals: stats.goals_scored || 0,
            assists: stats.assists || 0,
            cleanSheets: stats.clean_sheets === 1,
          },
          update: {
            points,
            minutes,
            goals: stats.goals_scored || 0,
            assists: stats.assists || 0,
            cleanSheets: stats.clean_sheets === 1,
          }
        })

        // Progress logging
        if ((created + updated) % 100 === 0) {
          console.log(`✓ Processed ${created + updated}...`)
        }

      } catch (error: any) {
        errors++
        console.error(`Failed player ID ${element.id}: ${error.message}`)
      }
    }

    console.log('\nGameweek Sync Complete!')
    console.log(`  Created: ${created}`)
    console.log(`  Updated: ${updated}`)
    console.log(`  Skipped: ${skipped}`)
    console.log(`  Errors: ${errors}`)

    return NextResponse.json({
      success: true,
      gameweek,
      created,
      updated,
      skipped,
      errors
    })

  } catch (error: any) {
    console.error('Sync failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Used for browser testing
export async function GET() {
  return POST(new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({})
  }))
}
