"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createLeague } from "@/app/actions/league"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type CreateLeagueFormProps = {
  userId: string
}

export function CreateLeagueForm({ userId }: CreateLeagueFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [leagueName, setLeagueName] = useState("")
  const [isPrivate, setIsPrivate] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!leagueName.trim()) {
      toast.error("Please enter a league name")
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('name', leagueName)
      formData.append('isPrivate', isPrivate.toString())
      
      const result = await createLeague(formData)
      
      if (result.success) {
        toast.success("League created successfully!")
        router.push(`/leagues/${result.leagueId}`)
      } else {
        toast.error(result.error || "Failed to create league")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">League Name</Label>
        <Input
          id="name"
          placeholder="e.g., Premier League Champions"
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          disabled={isPending}
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground">
          {leagueName.length}/50 characters
        </p>
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating League...
          </>
        ) : (
          'Create League'
        )}
      </Button>
    </form>
  )
}
