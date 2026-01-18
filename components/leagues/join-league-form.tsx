"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { joinLeague } from "@/app/actions/league"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type JoinLeagueFormProps = {
  userId: string
}

export function JoinLeagueForm({ userId }: JoinLeagueFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [code, setCode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedCode = code.trim().toUpperCase()
    
    if (trimmedCode.length !== 6) {
      toast.error("League code must be 6 characters")
      return
    }

    startTransition(async () => {
      const result = await joinLeague(trimmedCode)
      
      if (result.success) {
        toast.success("Joined league successfully!")
        router.push(`/leagues/${result.leagueId}`)
      } else {
        toast.error(result.error || "Failed to join league")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">League Code</Label>
        <Input
          id="code"
          placeholder="ABC123"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={isPending}
          maxLength={6}
          className="text-center text-2xl font-mono tracking-widest"
        />
        <p className="text-xs text-muted-foreground">
          Enter the 6-character code from your league owner
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={isPending || code.length !== 6}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining League...
          </>
        ) : (
          'Join League'
        )}
      </Button>
    </form>
  )
}
