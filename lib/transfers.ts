import { autoAssignCaptain } from "@/app/actions/draft";
import prisma from "./db";

export async function executeTransfer(
    userId: string,
    leagueId: string,
    outgoingPlayerId: string,
    incomingPlayerId: string
) {

    const league = await prisma.league.findUnique({
        where: { id: leagueId },
        select: { isGameweekLocked: true }
    })

    if (!league) {
        return { success: false, error: 'League not found' }

    }

    if (league.isGameweekLocked) {
        return { success: false, error: 'Transfers are locked during a live gameweek' }
    }

    const outgoingPick = await prisma.draftPick.findUnique({
        where: {
            userId_playerId_leagueId: {
                userId,
                playerId: outgoingPlayerId,
                leagueId,
            }
        },
        include: {
            player: {
                select: { position: true }
            }
        }
    })

    if (!outgoingPick) {
        return { success: false, error: 'Player not found in your squad' }
    }

    const incomingPick = await prisma.player.findUnique({
        where: { id: incomingPlayerId },
        select: { position: true, isDrafted: true },
    })

    if (!incomingPick) {
        return { success: false, error: 'Player not found' }
    }

    if (incomingPick.isDrafted) {
        return { success: false, error: 'This player has already been drafted by another manager' }
    }

    if (incomingPick.position !== outgoingPick.player.position) {
        return { success: false, error: `You can only swap a ${outgoingPick.player.position} for another ${outgoingPick.player.position}` }
    }


    await prisma.$transaction([
        // Delete the outgoing player pick
        prisma.draftPick.delete({
            where: { id: outgoingPick.id }
        }),

        // Add the new player in the same lineup slot
        prisma.draftPick.create({
            data: {
                userId,
                leagueId,
                playerId: incomingPlayerId,
                pickOrder: outgoingPick.pickOrder,
                lineupSlot: outgoingPick.lineupSlot,
                isCaptain: false,
                isViceCaptain: false,
            },
        }),

        // Mark outgoing player as available
        prisma.player.update({
            where: { id: outgoingPlayerId },
            data: { isDrafted: false },
        }),

        // Mark incoming player as drafted
        prisma.player.update({
            where: { id: incomingPlayerId },
            data: { isDrafted: true },
        }),
    ])

    const captainTransferred =
        outgoingPick.isCaptain || outgoingPick.isViceCaptain

    if (captainTransferred) {
        await autoAssignCaptain(userId, leagueId)
    }

    return { success: true }
}