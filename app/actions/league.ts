"use server";

import { revalidatePath } from "next/cache"
import { customAlphabet } from "nanoid"
import prisma from "@/lib/db"
import { getOrCreateUser } from "@/lib/user"

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

export async function joinLeague(code: string) {
  try {
    // Authenticate the user
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate the code format
    if (!code || code.length !== 6) {
      return { success: false, error: "Invalid league code format" }
    }

    // Find the league by code
    const league = await prisma.league.findUnique({
      where: { code: code.toUpperCase() },
      include: { 
        members: true // Include members to check if user already joined
      }
    })

    // Check if league exists
    if (!league) {
      return { 
        success: false, 
        error: "League not found. Please check the code and try again." 
      }
    }

    // Check if user already joined this league
    const alreadyMember = league.members.some(
      member => member.userId === user.id
    )

    if (alreadyMember) {
      return { 
        success: false, 
        error: "You're already a member of this league" 
      }
    }

    // Calculate the next draft position
    // If there are 3 members, new member gets position 4
    const nextDraftPosition = league.members.length + 1

    // Add user as a league member
    await prisma.leagueMember.create({
      data: {
        leagueId: league.id,
        userId: user.id,
        draftPosition: nextDraftPosition
      }
    })

    // Refresh the leagues page and the specific league page
    revalidatePath("/leagues")
    revalidatePath(`/leagues/${league.id}`)
    
    // Return success with league ID for redirect
    return { 
      success: true, 
      leagueId: league.id 
    }
    
  } catch (error: any) {
    console.error('Join league error:', error)
    
    // Handle unique constraint error (user already joined)
    if (error.code === 'P2002') {
      return { 
        success: false, 
        error: "You're already a member of this league" 
      }
    }
    
    return { 
      success: false, 
      error: "Failed to join league. Please try again." 
    }
  }
}
