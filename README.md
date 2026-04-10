# DraftElite — Fantasy Football App

A fully featured fantasy football platform built with Next.js, Prisma, PostgreSQL, and Clerk authentication.

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

Push the Prisma schema to the connected database

```bash
npx prisma db push
```
Then generate the Prisma Client:
```bash
npx prisma generate
```

Optionally, open Prisma Studio to inspect your database:

```bash
npx prisma studio
```

### 5. Start the development server

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
# Local example:  postgresql://username:password@localhost:5432/dbname
DATABASE_URL="postgresql://username:password@localhost:5432/draftelite"

# -----------------------------------------------
# CLERK AUTHENTICATION
# -----------------------------------------------

# Found in your Clerk dashboard -> API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Sign in / sign up redirect paths
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```
***

## Setting Up PostgreSQL

### Local PostgreSQL

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create a new database:

```bash
psql -U postgres
CREATE DATABASE draftelite;
\q
```

3. Set your `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/draftelite"
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

## Database Schema

After setting up your `DATABASE_URL`, apply the schema with:

```bash
npx prisma db push
npx prisma generate
```
***

## .env.example

Copy this file to `.env` and fill in your values:

```env
DATABASE_URL=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```
