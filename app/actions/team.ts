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
