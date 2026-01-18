"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Crown, CheckCircle2, Clock } from "lucide-react"
import { LeagueMember, User } from "@/app/generated/prisma/client"

type LeagueMembersListProps = {
  members: (LeagueMember & {
    user: {
      id: string
      teamName: string | null
      email: string
      totalPoints: number
      currentRank: number | null
      draftComplete: boolean
    }
  })[]
  ownerId: string
  currentUserId: string
}

export function LeagueMembersList({ 
  members, 
  ownerId, 
  currentUserId 
}: LeagueMembersListProps) {
  
  // Get user initials for avatar
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email[0].toUpperCase()
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isOwner = member.userId === ownerId
        const isCurrentUser = member.userId === currentUserId

        return (
          <div
            key={member.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              isCurrentUser ? 'bg-primary/5 border-primary/20' : 'bg-card'
            }`}
          >
            {/* Left Side - User Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(member.user.teamName, member.user.email)}
                </AvatarFallback>
              </Avatar>

              {/* User Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">
                    {member.user.teamName || 'Unnamed Team'}
                  </p>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                  {isOwner && (
                    <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Draft Position: {member.draftPosition}
                </p>
              </div>
            </div>

            {/* Right Side - Draft Status */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {member.user.draftComplete ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium hidden sm:inline">Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">Pending</span>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Empty State */}
      {members.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No members yet
        </div>
      )}
    </div>
  )
}
