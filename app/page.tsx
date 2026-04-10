import Link from "next/link"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors">

      <nav className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Image src='/logo.png' width={35} height={35} alt="logo" />
            <span className="font-bold text-lg tracking-tight">DraftElite</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignedOut>
              <Link
                href="/sign-up"
                className="text-sm bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      <section className="px-6 pt-24 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Fantasy Football Reinvented
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Build your squad.
            <br />
            <span className="text-primary">Dominate your league.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Draft players, manage your lineup, make transfers, and compete against friends in a fully featured fantasy football experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <SignedOut>
              <Link
                href="/sign-up"
                className="bg-primary text-primary-foreground font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-base"
              >
                Start for free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="bg-primary text-primary-foreground font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-base"
              >
                Go to dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>


      <section className="border-y border-border px-6 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: "38", label: "Gameweeks" },
            { value: "15", label: "Players per squad" },
            { value: "∞", label: "Transfers" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-md mx-auto">
            A complete fantasy football platform from draft day to the final whistle.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Live Draft Room",
                desc: "Pick your squad in real-time with your league. Snake draft format with live player availability.",
              },
              {
                title: "Lineup Management",
                desc: "Set your starting XI each gameweek, make substitutions, and assign your captain.",
              },
              {
                title: "Transfers",
                desc: "Swap players in and out of your squad between gameweeks to stay ahead of the competition.",
              },
              {
                title: "Live Standings",
                desc: "Track your gameweek points and overall rank against every manager in your league.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
              >
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center bg-card border border-primary/20 rounded-3xl px-8 py-16">
          <h2 className="text-3xl font-bold mb-4">Ready to play?</h2>
          <p className="text-muted-foreground mb-8">
            Create a league, invite your friends, and start your draft today.
          </p>
          <SignedOut>
            <Link
              href="/sign-up"
              className="inline-block bg-primary text-primary-foreground font-bold px-10 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Create your team
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/leagues/create"
              className="inline-block bg-primary text-primary-foreground font-bold px-10 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Create a league
            </Link>
          </SignedIn>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
              <Image src='/logo.png' width={25} height={25} alt="logo" />
            <span className="text-sm font-semibold">DraftElite</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} DraftElite. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}