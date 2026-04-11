# DraftElite - Fantasy Football App

A fully featured fantasy football prototype built with Next.js, Prisma, PostgreSQL, and Clerk authentication.

***
> [!NOTE]  
> Some of the console commands provided are applicable for macOS, and Linux natively using the bash terminal. For windows users, consider using [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) or just convert the commands accordingly. 

## Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Setting Up PostgreSQL](#setting-up-postgresql)
- [Setting Up Clerk](#setting-up-clerk)
- [Admin API Endpoints](#admin-api-endpoints)

***

## Tech Stack

- **Framework** — [Next.js 15](https://nextjs.org/) (App Router)
- **Database** — [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/)
- **Authentication** — [Clerk](https://clerk.com/)
- **UI** — [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)

***

## Prerequisites

Make sure you have the following installed before you begin:

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/install/windows)

***

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Liam2705/fantasy-football-app.git
cd fantasy-football-app
```

### 2. Install dependencies
In the project root, run:
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root of the project:

```bash
touch .env
```

Then fill in the values as described in the [Environment Variables](#environment-variables) section below.

### 4. Set up the database

First, setup the database as described in the [Setting Up PostgreSQL](#setting-up-postgresql)

Then push the Prisma schema to the connected database

```bash
npx prisma db push
```
And generate the Prisma Client:
```bash
npx prisma generate
```

Optionally, open Prisma Studio to inspect your database and ensure the tables match the schema:

```bash
npx prisma studio
```
### 5. Setting up clerk
Follow the steps in the [Setting Up Clerk](#setting-up-clerk) section

### 6. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

***

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# -----------------------------------------------
# DATABASE
# -----------------------------------------------

# PostgreSQL connection string
# Local example:  postgresql://postgres:password@localhost:5432/dbname
DATABASE_URL="postgresql://postgres:password@localhost:5432/draftelite"

# -----------------------------------------------
# CLERK AUTHENTICATION
# -----------------------------------------------

# Found in your Clerk dashboard -> API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

#Clerk sign-in route management
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```
***

## Setting Up PostgreSQL

### Local PostgreSQL

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create a new database in pgAdmin:
3. Set your `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/yourdbname"
```
***

## Setting Up Clerk

1. Sign up at [clerk.com](https://clerk.com/)
2. Create a new application
3. Choose your sign-in methods - For the app to work as intended, copy the settings below:
<img width="1142" height="1134" alt="image" src="https://github.com/user-attachments/assets/0a3f67a2-0f89-4277-9605-a575fe4784b5" />
<img width="1160" height="640" alt="image" src="https://github.com/user-attachments/assets/43689003-524b-41e8-ad90-0f9b0e008fbb" />
<img width="1187" height="631" alt="image" src="https://github.com/user-attachments/assets/3ab27870-375d-4874-9b50-254bd491734d" />
<img width="1151" height="702" alt="image" src="https://github.com/user-attachments/assets/96e349b1-803c-42fd-aa1a-cbcfcead7ab0" />
4. Go to **API Keys** in your Clerk dashboard
<img width="814" height="385" alt="image" src="https://github.com/user-attachments/assets/0284cf62-0d7b-4e2b-b256-1fbc015cff18" />

5. Copy the **Publishable Key** and **Secret Key**
6. Add them to your `.env` file
***
## .env.example

Copy this file to `.env` and fill in your values:

```env
DATABASE_URL=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

## Admin API Endpoints

These endpoints are used to operate and manage the application. They are currently **public for testing purposes** and will be protected in production.

All examples below assume the app is running at `http://localhost:3000`.

> [!Warning]  
> I recommend using [Postman](https://www.postman.com/downloads/) to interact with the API using information provided in each section. This includes the method, and body (if mentioned) which will be of the type `json`.

***

### Gameweek Management

#### Lock Gameweek
Locks the current gameweek across all leagues, preventing managers from making further substitutions, transfers, or captain changes until the gameweek is unlocked. This should be run when a gameweek commences.

Send a POST request to `/api/admin/lock-gameweek`.

Example request and response:

<img width="838" height="881" alt="image" src="https://github.com/user-attachments/assets/9845a2d7-5961-45fc-8bc6-0f41c10a7459" />


***

#### Unlock Gameweek
Unlocks the current gameweek, allowing managers to make substitutions, transfers, and captain changes again. Run this at the start of a new gameweek.

Send a POST request to `/api/admin/unlock-gameweek`.

***

#### Finalise Gameweek
Calculates and saves the final points for all managers in a specific league for a given gameweek. This applies captain multipliers and runs autosubs. Run this after all matches in a gameweek are complete and player stats have been synced. The gameweek will be unlocked automatically after this is run.

##### Required body fields:
###### - gameweek  (number) — the gameweek number to finalise
###### - leagueId  (string) — the ID of the league to finalise

Send a post request to `/api/admin/finalise-gameweek` with a body containing the gameweek and leagueId.

Example:

<img width="754" height="870" alt="image" src="https://github.com/user-attachments/assets/43ab348e-2dfd-4ff5-aa07-6c6a1eb38d14" />


***

### Data Sync Endpoints

#### Sync Gameweek Stats
Fetches the latest player performance data from the FPL API for a given gameweek and saves it to the `PlayerGameweek` table. Run this once all matches in a gameweek are finished before finalising.

Visit `http://localhost:3000/api/admin/sync-gameweek-stats` in the browser. Wait for the sync to complete.

***

#### Sync Gameweeks
Fetches the latest gameweek schedule and status data from the FPL API (e.g. which gameweek is current, which is next, deadlines) and updates the `Gameweek` table accordingly. Run this at the start of each new gameweek.

Send a POST request to `/api/admin/sync-gameweeks`.

***

#### Sync Players
Fetches the full player list from the FPL API and updates the `Player` table with the latest stats.

Visit `http://localhost:3000/api/admin/sync-players` in the browser. Wait for the sync to complete.

***

#### Update League Gameweeks
Updates to the current gameweek for all active leagues. Run this after syncing gameweeks the current gameweek to all leagues.

Visit `http://localhost:3000/api/admin/update-league-gameweeks` in the browser. Wait for the update to complete.

***

### Recommended Gameweek Operation Order

Run these steps in order at the end of each gameweek:

1. `POST /api/admin/lock-gameweek` — lock lineups before deadline
2. `GET /api/admin/sync-gameweek-stats` — pull player stats after all matches finish
3. `POST /api/admin/finalise-gameweek` — calculate and save points for each league
4. `POST /api/admin/sync-gameweeks` — update gameweek schedule for the new week
5. `GET /api/admin/update-league-gameweeks` — updates to the current gameweek for all leagues
6. `POST /api/admin/unlock-gameweek` — open lineups for the next gameweek

***
