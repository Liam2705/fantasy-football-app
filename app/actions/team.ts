"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/db"
import { getOrCreateUser } from "@/lib/user"
import { autoAssignCaptain } from "./draft"
import { isValidLineup } from "@/lib/lineup"

export async function setCaptain(pickId: string, leagueId: string) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { isGameweekLocked: true },
    })

    if (league?.isGameweekLocked) {
      return { success: false, error: 'Gameweek is locked — changes are not permitted' }
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

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { isGameweekLocked: true },
    })

    if (league?.isGameweekLocked) {
      return { success: false, error: 'Gameweek is locked — changes are not permitted' }
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

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { isGameweekLocked: true },
    })

    if (league?.isGameweekLocked) {
      return { success: false, error: 'Gameweek is locked — changes are not permitted' }
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
    
    if (!isValidLineup(starters)) {
      return { success: false, error: "Invalid formation — check position constraints" }
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

    const captainOrVcWasSwappedOut =
      (pick1.isCaptain || pick1.isViceCaptain) && pick1.lineupSlot <= 11 && pick2.lineupSlot > 11 ||
      (pick2.isCaptain || pick2.isViceCaptain) && pick2.lineupSlot <= 11 && pick1.lineupSlot > 11

    if (captainOrVcWasSwappedOut) {
      await autoAssignCaptain(user.id, leagueId)
    }

    revalidatePath(`/my-team`)
    return { success: true }

  } catch (error) {
    return { success: false, error: "Failed to swap players" }
  }
}



