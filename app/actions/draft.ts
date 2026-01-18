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
            where: { userId: user.id },
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
            where: { userId: user.id },
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

        revalidatePath("/draft")
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

        // Delete the pick
        await prisma.draftPick.delete({
            where: { id: pickId, userId: user.id }
        })

        // Reorder remaining picks to fill gaps
        const remainingPicks = await prisma.draftPick.findMany({
            where: { userId: user.id },
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

        revalidatePath("/draft")
        return { success: true }
    } catch (error) {
        console.error('Remove player error:', error)
        return { success: false, error: "Failed to remove player" }
    }
}
