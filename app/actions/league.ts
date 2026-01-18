"use server";

import { revalidatePath } from "next/cache"
import { customAlphabet } from "nanoid"
import prisma from "@/lib/db"
import { getOrCreateUser } from "@/lib/user"
import { redirect } from "next/dist/server/api-utils";

const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6)

export async function createLeague(formData: FormData) {

    try {
        //Authenitcate user
        const user = await getOrCreateUser();
        if (!user) {
            return { success: false, error: "Unauthorized" }
        }

        // Get form data
        const name = formData.get("name") as string
        const isPrivate = formData.get("isPrivate") === "true"

        // Validate inputs
        if (!name || name.trim().length === 0) {
            return { success: false, error: "League name is required" }
        }

        if (name.length > 50) {
            return { success: false, error: "League name must be 50 characters or less" }
        }

        // Generate a code
        let code = generateCode()
        let existingLeague = await prisma.league.findUnique({
            where: { code }
        })

        // Keep generating new codes if there is a duplicate
        while (existingLeague) {
            code = generateCode()
            existingLeague = await prisma.league.findUnique({
                where: { code }
            })
        }

        // Create the league in the database
        const league = await prisma.league.create({
            data: {
                name: name.trim(),
                code,
                isPrivate,
                ownerId: user.id,
                currentGameweek: 1, // Start at gameweek 1
                isDrafting: false,  // Not drafting yet
                draftOrder: 1,
                // Automatically add the owner as the first member
                members: {
                    create: {
                        userId: user.id,
                        draftPosition: 1 // Owner gets first draft position
                    }
                }
            }
        })

        revalidatePath("/leagues")
        return {
            success: true,
            leagueId: league.id
        }

    } catch (error) {
        console.error('Create league error:', error)
        return {
            success: false,
            error: "Failed to create league. Please try again."
        }
    }
}