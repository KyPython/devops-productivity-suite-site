# Setup Instructions for DevOps Productivity Suite Site

## Step 1: Initialize as New Git Repository

```bash
cd devops-productivity-suite-site
git init
git add .
git commit -m "Initial commit: DevOps Productivity Suite marketing site"
```

## Step 2: Create New GitHub Repository

1. Go to GitHub and create a new repository (e.g., `devops-productivity-suite-site`)
2. Don't initialize with README (we already have one)

## Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/devops-productivity-suite-site.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

1. Go to https://vercel.com
2. Import the new GitHub repository
3. Vercel will auto-detect settings
4. Add environment variables:
   - `RESEND_API_KEY=re_xxxxxxxxxxxxx`
   - `FROM_EMAIL=onboarding@resend.dev`
   - `FROM_NAME=DevOps Productivity Suite`
5. Deploy!

## Step 5: Update Landing Page API URL (if needed)

The landing page calls `/api/lead-capture` which will work automatically on Vercel since it's a relative URL.

## Done!

Your marketing site is now live and separate from the ubiquitous-automation demo repo.
