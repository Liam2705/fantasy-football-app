import prisma from './db'
import { currentUser } from '@clerk/nextjs/server'

export async function getOrCreateUser() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    return null
  }

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id }
  })

  // Create if doesn't exist
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        username: clerkUser.username,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      }
    })
  }

  return user
}
