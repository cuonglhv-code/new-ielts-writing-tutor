# Deployment Guide — Jaxtina IELTS v2

Follow these steps **in order**. Each step includes exactly what to do.

---

## STEP 1 — Install Node.js (if not already installed)

1. Go to https://nodejs.org and click **"LTS"** to download the installer.
2. Run the installer and click through all the defaults.
3. To verify: open **Command Prompt** (press `Win + R`, type `cmd`, press Enter), then type:
   ```
   node --version
   ```
   You should see something like `v20.x.x`.

---

## STEP 2 — Set up Supabase (your database)

### 2a. Create a Supabase project
1. Go to https://supabase.com and sign up / log in.
2. Click **"New Project"**.
3. Choose your organisation, give the project a name (e.g. `jaxtina-ielts`), set a strong database password, choose a region (e.g. Southeast Asia / Singapore), and click **Create new project**.
4. Wait ~2 minutes for the project to be created.

### 2b. Run the database schema
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar.
2. Click **"New query"**.
3. Open the file `supabase/migrations/001_schema.sql` in a text editor (Notepad is fine).
4. Copy **all** the contents and paste them into the Supabase SQL editor.
5. Click the **"Run"** button (▶). You should see "Success. No rows returned."

### 2c. Seed the database with questions and tips
1. Create another new query in the SQL editor.
2. Open `supabase/seed.sql`, copy all contents, paste into the query, and click **Run**.

### 2d. Get your Supabase API keys
1. In the Supabase dashboard, click **"Settings"** (gear icon) → **"API"**.
2. You will need three values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public key** — a long string starting with `eyJ...`
   - **service_role secret key** — another long string (keep this private!)

Keep these open in your browser tab — you'll need them shortly.

---

## STEP 3 — Get your Anthropic API key

1. Go to https://console.anthropic.com and sign up / log in.
2. Click **"API Keys"** in the left sidebar.
3. Click **"Create Key"**, give it a name (e.g. `jaxtina-ielts`), and click **Create**.
4. Copy the key (it starts with `sk-ant-...`). **Save it somewhere safe — you can only see it once.**

---

## STEP 4 — Install project dependencies

1. Open **Command Prompt** (or Windows Terminal).
2. Navigate to your project folder:
   ```
   cd "C:\Users\cuong\OneDrive - University of Leicester\Documents\GitHub\jaxtina-ielts-v2"
   ```
3. Install dependencies:
   ```
   npm install
   ```
   This will take 1–3 minutes.

---

## STEP 5 — Create your local environment file

1. In your project folder, create a new file called **`.env.local`** (note the dot at the start).
   - Open Notepad, paste the contents below, and save it as `.env.local` in the project root folder.
   - **Important:** In the Save dialog, change "Save as type" to **"All Files"** so it doesn't save as `.env.local.txt`.

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Replace the placeholder values with your actual keys from Steps 2d and 3.

---

## STEP 6 — Test locally

1. In Command Prompt (in the project folder), run:
   ```
   npm run dev
   ```
2. Open your browser and go to **http://localhost:3000**
3. You should see the Jaxtina IELTS login page.
4. Test the full flow: register → onboarding → dashboard → practice → submit essay.
5. Press `Ctrl + C` in Command Prompt when done testing.

---

## STEP 7 — Push to GitHub

### 7a. If you don't have Git installed
1. Download from https://git-scm.com and install with all defaults.
2. Open a new Command Prompt after installing.

### 7b. Configure Git (first time only)
```
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### 7c. Create a GitHub account (if you don't have one)
Go to https://github.com and sign up.

### 7d. Create a new GitHub repository
1. Go to https://github.com/new
2. Repository name: `jaxtina-ielts-v2`
3. Set it to **Private** (recommended)
4. Do NOT tick any of the initialise options
5. Click **"Create repository"**
6. GitHub will show you a page with commands. Copy the URL of your repository (e.g. `https://github.com/yourusername/jaxtina-ielts-v2.git`).

### 7e. Push your code
In Command Prompt (in the project folder), run these commands **one at a time**:

```
git add .
git commit -m "Initial commit: Jaxtina IELTS v2"
git branch -M main
git remote add origin https://github.com/yourusername/jaxtina-ielts-v2.git
git push -u origin main
```

Replace `yourusername` with your actual GitHub username.

When prompted, enter your GitHub username and password (or personal access token if you have 2FA enabled — see https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

---

## STEP 8 — Deploy to Vercel

### 8a. Create a Vercel account
1. Go to https://vercel.com and click **"Sign Up"**.
2. Choose **"Continue with GitHub"** — this links Vercel to your GitHub account.

### 8b. Import your project
1. On the Vercel dashboard, click **"Add New Project"** (or **"New Project"**).
2. You'll see a list of your GitHub repositories. Find `jaxtina-ielts-v2` and click **"Import"**.
3. On the configuration screen:
   - **Framework Preset**: should auto-detect as **Next.js** ✓
   - **Root Directory**: leave as `.` (the default)
   - **Build Command**: leave as default (`npm run build`)
   - **Output Directory**: leave as default

### 8c. Add environment variables
**This is the most important step.** Before clicking Deploy, scroll down to the **"Environment Variables"** section and add each of the following:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role secret key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (sk-ant-...) |

For each one: click **"Add"**, type the name, paste the value, select **"All Environments"**, click **"Save"**.

### 8d. Deploy
1. Click the **"Deploy"** button.
2. Vercel will build and deploy your app. This takes about 2–3 minutes.
3. When done, you'll see **"Congratulations! Your project has been deployed."**
4. Click the preview link (e.g. `https://jaxtina-ielts-v2.vercel.app`) to see your live app!

---

## STEP 9 — Update Supabase auth settings (important!)

By default, Supabase only allows auth from `localhost`. You need to add your Vercel URL.

1. In Supabase dashboard → **"Authentication"** → **"URL Configuration"**
2. Under **"Site URL"**, enter your Vercel URL: `https://jaxtina-ielts-v2.vercel.app`
3. Under **"Redirect URLs"**, add: `https://jaxtina-ielts-v2.vercel.app/**`
4. Click **Save**.

---

## Done! 🎉

Your app is now live. Every time you push code to GitHub, Vercel will automatically re-deploy.

---

## Troubleshooting

**"Cannot find module" error when running npm run dev**
→ Run `npm install` again.

**"Invalid API key" from Supabase**
→ Double-check that you copied the full key (they're very long) into `.env.local`.

**"401 Unauthorised" when submitting an essay**
→ Make sure you're logged in and your Supabase keys are correct.

**AI returns an error after submitting**
→ Check your `ANTHROPIC_API_KEY` is correct and your Anthropic account has credits.

**Students see a white screen after login**
→ Make sure you ran both SQL files in Supabase (schema + seed).
