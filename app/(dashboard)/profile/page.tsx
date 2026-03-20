import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import ProfileForm from '@/components/profile/profile-form'

export default async function ProfilePage() {
  const user = await getOrCreateUser()
  if (!user) redirect('/sign-in')

  return (
    <div className="max-w-l mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Profile & Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Update your team name and username.
      </p>
      <ProfileForm
        initialTeamName={user.teamName ?? ''}
        initialUsername={user.username ?? ''}
        displayName={
          [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
        }
        email={user.email}
      />
    </div>
  )
}
