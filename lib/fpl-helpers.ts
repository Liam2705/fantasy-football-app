export async function getCurrentGameweek() {
  try {
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/')
    const data = await response.json()
    
    const current = data.events.find((e: any) => e.is_current)
    
    if (!current) {
      console.warn('No current gameweek found, defaulting to 1')
      return 1
    }
    
    return current.id
  } catch (error) {
    console.error('Failed to get current gameweek:', error)
    return 1
  }
}
