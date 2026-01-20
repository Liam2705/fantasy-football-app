"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/db"
import { getOrCreateUser } from "@/lib/user"

export async function setCaptain(pickId: string, leagueId: string) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify this pick belongs to the user and is in the league
    const pick = await prisma.draftPick.findUnique({
      where: { id: pickId }
    })

    if (!pick || pick.userId !== user.id || pick.leagueId !== leagueId) {
      return { success: false, error: "Invalid selection" }
    }

    // Verify pick is in starting 11 (lineup slot 1-11)
    if (pick.lineupSlot > 11) {
      return { success: false, error: "Only starters can be captain" }
    }

    // Update in a transaction: remove old captain, set new captain
    await prisma.$transaction([
      prisma.draftPick.updateMany({
        where: {
          userId: user.id,
          leagueId,
          isCaptain: true
        },
        data: { isCaptain: false }
      }),
      // Set new captain
      prisma.draftPick.update({
        where: { id: pickId },
        data: { isCaptain: true }
      })
    ])

    revalidatePath(`/my-team`)
    return { success: true }

  } catch (error) {
    console.error('Set captain error:', error)
    return { success: false, error: "Failed to set captain" }
  }
}

export async function setViceCaptain(pickId: string, leagueId: string) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify this pick belongs to the user and is in the league
    const pick = await prisma.draftPick.findUnique({
      where: { id: pickId }
    })

    if (!pick || pick.userId !== user.id || pick.leagueId !== leagueId) {
      return { success: false, error: "Invalid selection" }
    }

    // Verify pick is in starting 11
    if (pick.lineupSlot > 11) {
      return { success: false, error: "Only starters can be vice-captain" }
    }

    // Can't be captain and vice-captain
    if (pick.isCaptain) {
      return { success: false, error: "Captain cannot also be vice-captain" }
    }

    // Update in a transaction
    await prisma.$transaction([
      // Remove vice-captain flag from all picks for this user in this league
      prisma.draftPick.updateMany({
        where: {
          userId: user.id,
          leagueId,
          isViceCaptain: true
        },
        data: { isViceCaptain: false }
      }),
      // Set new vice-captain
      prisma.draftPick.update({
        where: { id: pickId },
        data: { isViceCaptain: true }
      })
    ])

    revalidatePath(`/my-team`)
    return { success: true }

  } catch (error) {
    console.error('Set vice-captain error:', error)
    return { success: false, error: "Failed to set vice-captain" }
  }
}

export async function swapPlayers(pickId1: string, pickId2: string, leagueId: string) {
  try {
    
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Get both picks
    const [pick1, pick2] = await Promise.all([
      prisma.draftPick.findUnique({ 
        where: { id: pickId1 },
        include: { player: true }
      }),
      prisma.draftPick.findUnique({ 
        where: { id: pickId2 },
        include: { player: true }
      })
    ])

    if (!pick1 || !pick2) {
      return { success: false, error: "Players not found" }
    }

    if (pick1.userId !== user.id || pick2.userId !== user.id) {
      return { success: false, error: "Unauthorized" }
    }

    if (pick1.leagueId !== leagueId || pick2.leagueId !== leagueId) {
      return { success: false, error: "Invalid league" }
    }

    // Check if swap would break formation (one must be starter, one must be bench)
    const isValidSwap = 
      (pick1.lineupSlot <= 11 && pick2.lineupSlot > 11) ||
      (pick1.lineupSlot > 11 && pick2.lineupSlot <= 11)

    if (!isValidSwap) {
      return { 
        success: false, 
        error: "Can only swap between starters and substitutes" 
      }
    }

    // Get all picks for this user/league to validate formation
    const allPicks = await prisma.draftPick.findMany({
      where: { userId: user.id, leagueId },
      include: { player: true }
    })

    // Simulate the swap to check if formation is valid
    const simulatedPicks = allPicks.map(p => {
      if (p.id === pick1.id) return { ...p, lineupSlot: pick2.lineupSlot }
      if (p.id === pick2.id) return { ...p, lineupSlot: pick1.lineupSlot }
      return p
    })

    // Count positions in starting 11 after swap
    const starters = simulatedPicks.filter(p => p.lineupSlot <= 11)
    const positionCounts = {
      GK: starters.filter(p => p.player.position === 'GK').length,
      DEF: starters.filter(p => p.player.position === 'DEF').length,
      MID: starters.filter(p => p.player.position === 'MID').length,
      FWD: starters.filter(p => p.player.position === 'FWD').length,
    }


    // Must have exactly 1 GK
    if (positionCounts.GK !== 1) {
      return { 
        success: false, 
        error: "Must have exactly 1 goalkeeper in starting lineup" 
      }
    }

    // Check if formation is valid
    const VALID_FORMATIONS = [
      { def: 3, mid: 4, fwd: 3 },
      { def: 3, mid: 5, fwd: 2 },
      { def: 4, mid: 3, fwd: 3 },
      { def: 4, mid: 4, fwd: 2 },
      { def: 4, mid: 5, fwd: 1 },
      { def: 5, mid: 3, fwd: 2 },
      { def: 5, mid: 4, fwd: 1 },
    ]

    const isValidFormation = VALID_FORMATIONS.some(f => 
      f.def === positionCounts.DEF &&
      f.mid === positionCounts.MID &&
      f.fwd === positionCounts.FWD
    )

    if (!isValidFormation) {
      return { 
        success: false, 
        error: `Invalid formation: ${positionCounts.DEF}-${positionCounts.MID}-${positionCounts.FWD} is not allowed` 
      }
    }

    // Perform the swap
    await prisma.$transaction([
      prisma.draftPick.update({
        where: { id: pickId1 },
        data: { lineupSlot: pick2.lineupSlot }
      }),
      prisma.draftPick.update({
        where: { id: pickId2 },
        data: { lineupSlot: pick1.lineupSlot }
      })
    ])

    revalidatePath(`/my-team`)
    return { success: true }

  } catch (error) {
    return { success: false, error: "Failed to swap players" }
  }
}



