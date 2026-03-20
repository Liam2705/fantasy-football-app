'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateProfileAction } from '@/app/actions/profile-actions'

interface ProfileFormProps {
  initialTeamName: string
  initialUsername: string
  displayName: string
  email: string
}

export default function ProfileForm({
  initialTeamName,
  initialUsername,
  displayName,
  email,
}: ProfileFormProps) {
  const [teamName, setTeamName] = useState(initialTeamName)
  const [username, setUsername] = useState(initialUsername)
  const [isPending, startTransition] = useTransition()

  const isDirty =
    teamName.trim() !== initialTeamName || username.trim() !== initialUsername

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isDirty) return

    startTransition(async () => {
      const result = await updateProfileAction({ teamName, username })
      if (result.success) {
        toast.success('Profile updated successfully.')
      } else {
        toast.error(result.error ?? 'Failed to update profile.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* info pulled from Clerk */}
      <div className="rounded-md border border-border bg-muted/40 px-4 py-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Account
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Name</p>
            <p className="text-sm font-medium">{displayName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm font-medium">{email}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Name and email are managed via your Clerk account.
        </p>
      </div>

      {/* editable fields */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="teamName"
            className="block text-sm font-medium mb-1.5"
          >
            Team Name
          </label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            maxLength={30}
            placeholder="e.g. Champions FC"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {teamName.length}/30 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium mb-1.5"
          >
            Username
          </label>
          <div className="flex items-center rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
            <span className="text-muted-foreground text-sm mr-1">@</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e =>
                setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))
              }
              maxLength={20}
              placeholder="yourname"
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lowercase only, no spaces. {username.length}/20 characters.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !isDirty}
        className="w-full sm:w-auto px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
