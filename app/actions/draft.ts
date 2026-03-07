"use server"

import { revalidatePath } from "next/cache"
import { getOrCreateUser } from "@/lib/user"
import { Prisma } from "../generated/prisma/client"
import prisma from "@/lib/db"

type DraftPickWithPlayer = Prisma.DraftPickGetPayload<{
    include: { player: true }
}>

export async function addPlayerToSquad(formData: FormData) {
    try {
        const user = await getOrCreateUser()
        if (!user) {
            return { success: false, error: "Unauthorized" }
        }

        const playerId = formData.get("playerId") as string
        const leagueId = formData.get("leagueId") as string

        //Check if the player already drafted in this league
        const existingPick = await prisma.draftPick.findFirst({
            where: {
                playerId,
                leagueId
            }
        })

        if (existingPick) {
            return {
                success: false,
                error: "Player already drafted in this league"
            }
        }

        // Check squad limit
        const currentPicks = await prisma.draftPick.count({
            where: { userId: user.id }
        })

        if (currentPicks >= 15) {
            return { success: false, error: "Squad is full (15 players max)" }
        }

        // Get player to check position
        const player = await prisma.player.findUnique({
            where: { id: playerId }
        })

        if (!player) {
            return { success: false, error: "Player not found" }
        }      

        // Check position limits
        const positionPicks: DraftPickWithPlayer[] = await prisma.draftPick.findMany({
            where: {
                userId: user.id,
                leagueId
            },
            include: { player: true }
        })

        const positionCounts = {
            GK: positionPicks.filter((p) => p.player.position === 'GK').length,
            DEF: positionPicks.filter((p) => p.player.position === 'DEF').length,
            MID: positionPicks.filter((p) => p.player.position === 'MID').length,
            FWD: positionPicks.filter((p) => p.player.position === 'FWD').length,
        }

        const limits = { GK: 2, DEF: 5, MID: 5, FWD: 3 }
        const position = player.position as keyof typeof positionCounts

        if (positionCounts[position] >= limits[position]) {
            return {
                success: false,
                error: `${position} position is full (${limits[position]}/${limits[position]})`
            }
        }

        // Get the next available pickOrder
        const maxPickOrder = await prisma.draftPick.findFirst({
            where: {
                userId: user.id,
                leagueId
            },
            orderBy: { pickOrder: 'desc' },
            select: { pickOrder: true }
        })

        const nextPickOrder = (maxPickOrder?.pickOrder ?? 0) + 1

        // Create draft pick
        try {
            await prisma.draftPick.create({
                data: {
                    userId: user.id,
                    playerId,
                    leagueId,
                    pickOrder: nextPickOrder,
                    lineupSlot: nextPickOrder,
                }
            })
        } catch (error: any) {
            // The Prisma error code for unique constraint violations
            if (error.code === 'P2002') {
                return { success: false, error: "Player already in your squad" }
            }
            throw error // Re-throw if it's a different error
        }

        revalidatePath(`/leagues/${leagueId}/draft`)
        return { success: true }
    } catch (error) {
        console.error('Add player error:', error)
        return { success: false, error: "Failed to add player" }
    }
}

export async function removePlayerFromSquad(formData: FormData) {
    try {
        const user = await getOrCreateUser()
        if (!user) {
            return { success: false, error: "Unauthorized" }
        }

        const pickId = formData.get("pickId") as string
        const leagueId = formData.get("leagueId") as string

        // Delete the pick
        await prisma.draftPick.delete({
            where: { id: pickId, userId: user.id, }
        })

        // Reorder remaining picks to fill gaps
        const remainingPicks = await prisma.draftPick.findMany({
            where: {
                userId: user.id,
                leagueId
            },
            orderBy: { pickOrder: 'asc' }
        })

        await prisma.$transaction(
            remainingPicks.map((pick, index) =>
                prisma.draftPick.update({
                    where: { id: pick.id },
                    data: {
                        pickOrder: index + 1,
                        lineupSlot: index + 1
                    }
                })
            )
        )

        revalidatePath(`/leagues/${leagueId}/draft`)
        return { success: true }
    } catch (error) {
        console.error('Remove player error:', error)
        return { success: false, error: "Failed to remove player" }
    }
}

export async function confirmDraft(leagueId: string) {
    try {
        //Verify User
        const user = await getOrCreateUser();
        if (!user) {
            return { success: false, error: 'Unauthorised' }
        }

        //Verify user is member of this league
        const membership = await prisma.leagueMember.findFirst({
            where: {
                leagueId,
                userId: user.id
            }
        })

        if (!membership) {
            return { success: false, error: "You are not a member of this league" }
        }

        // Verify user has picked 15 players
        const pickCount = await prisma.draftPick.count({
            where: {
                userId: user.id,
                leagueId
            }
        })

        if (pickCount !== 15) {
            return {
                success: false,
                error: `You need exactly 15 players (currently have ${pickCount})`
            }

        }

        //Verify position requirements
        const picks = await prisma.draftPick.findMany({
            where: {
                userId: user.id,
                leagueId
            },
            include: { player: true }
        })

        const positionCounts = {
            GK: picks.filter(p => p.player.position === 'GK').length,
            DEF: picks.filter(p => p.player.position === 'DEF').length,
            MID: picks.filter(p => p.player.position === 'MID').length,
            FWD: picks.filter(p => p.player.position === 'FWD').length,
        }

        if (positionCounts.GK !== 2) {
            return { success: false, error: "You need exactly 2 Goalkeepers" }
        }
        if (positionCounts.DEF !== 5) {
            return { success: false, error: "You need exactly 5 Defenders" }
        }
        if (positionCounts.MID !== 5) {
            return { success: false, error: "You need exactly 5 Midfielders" }
        }
        if (positionCounts.FWD !== 3) {
            return { success: false, error: "You need exactly 3 Forwards" }
        }

        // Mark draft as complete
        await prisma.user.update({
            where: { id: user.id },
            data: { draftComplete: true }
        })

        await autoAssignCaptain(user.id, leagueId)

        revalidatePath(`/leagues/${leagueId}`)
        revalidatePath(`/leagues/${leagueId}/draft`)

        return { success: true }

    } catch (error) {
        console.error('Confirm draft error: ', error);
        return {
            success: false,
            error: 'Failed to confirm draft, please try again.'
        }

    }
}

export async function autoAssignCaptain(userId: string, leagueId: string) {
  // Get all starters ordered by total points descending
  const starters = await prisma.draftPick.findMany({
    where: {
      userId,
      leagueId,
      lineupSlot: { lte: 11 },
    },
    include: {
      player: { select: { total_points: true } },
    },
    orderBy: {
      player: { total_points: 'desc' },
    },
  })

  if (starters.length < 2) return

  const [captain, viceCaptain] = starters

  await prisma.$transaction([
    // Clear any existing captain/vc flags first
    prisma.draftPick.updateMany({
      where: { userId, leagueId },
      data: { isCaptain: false, isViceCaptain: false },
    }),
    // Set captain
    prisma.draftPick.update({
      where: { id: captain.id },
      data: { isCaptain: true },
    }),
    // Set vice captain
    prisma.draftPick.update({
      where: { id: viceCaptain.id },
      data: { isViceCaptain: true },
    }),
  ])
}
