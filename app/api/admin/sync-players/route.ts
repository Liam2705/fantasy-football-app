import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    console.log('🚀 Syncing all FPL players...\n')

    //Call the FPL API
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/')
    
    if (!response.ok) {
      throw new Error(`FPL API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Build team lookup map
    const teamsMap = new Map<number, { name: string; short_name: string }>(
      data.teams.map((t: any) => [t.id, { name: t.name, short_name: t.short_name }])
    )
    
    const players = data.elements // Gets all the players (around 800 currently)
    console.log(`Processing ${players.length} players...\n`)

    //Track progress during sync
    let created = 0
    let updated = 0
    let errors = 0

    // Loop through each player
    for (const player of players) {
      try {
        // Map player position from FPL API (1-4, 1=GK) to my position enum ('GK', etc)
        // Assign array of positions and access the player position from the API (-1 to match array index)
        const position = (['GK', 'DEF', 'MID', 'FWD'] as const) [player.element_type - 1] 
        const team = teamsMap.get(player.team)

        if (!team) {
          throw new Error(`Team not found for player ${player.web_name}`)
        }

        // Create a new player or update an existing one
        const result = await prisma.player.upsert({
          where: { fplId: player.id },
          create: {
            fplId: player.id,
            firstName: player.first_name,
            lastName: player.second_name,
            web_name: player.web_name,
            team: team.name,
            team_short_name: team.short_name,
            position,
            element_type: player.element_type,
            total_points: player.total_points,
            minutes: player.minutes,
            goals_scored: player.goals_scored,
            assists: player.assists,
            yellow_cards: player.yellow_cards,
            red_cards: player.red_cards,
            clean_sheets: player.clean_sheets,
            status: player.status,
            isDrafted: false
          },
          update: {
            firstName: player.first_name,
            lastName: player.second_name,
            web_name: player.web_name,
            team: team.name,
            team_short_name: team.short_name,
            position,
            element_type: player.element_type,
            total_points: player.total_points,
            minutes: player.minutes,
            goals_scored: player.goals_scored,
            assists: player.assists,
            yellow_cards: player.yellow_cards,
            red_cards: player.red_cards,
            clean_sheets: player.clean_sheets,
            status: player.status
          }
        })

        // Check if it was created or updated (for logging purposes)
        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          created++
        } else {
          updated++
        }

        // Progress updates every 50 players
        if ((created + updated) % 50 === 0) {
          console.log(`Processed ${created + updated}/${players.length}...`)
        }
      } catch (error: any) {
        errors++
        console.error(`Failed: ${player.web_name} - ${error.message}`)
      }
    }

    // Summary of results
    console.log('\nSync Complete!')
    console.log(`  Created: ${created}`)
    console.log(`  Updated: ${updated}`)
    console.log(`  Errors: ${errors}`)
    console.log(`  Total: ${created + updated + errors}`)

    return NextResponse.json({ 
      success: true, 
      created, 
      updated, 
      errors,
      total: players.length
    })
  } catch (error: any) {
    console.error('Sync failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
