# 🚀 Setup Guide — Arslan-web-Dev GitHub Profile

> Complete, step-by-step instructions to deploy your dynamic GitHub profile.  
> Estimated setup time: **10-15 minutes**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Folder Structure](#folder-structure)
3. [Step 1 — Create the Profile Repository](#step-1--create-the-profile-repository)
4. [Step 2 — Upload All Files](#step-2--upload-all-files)
5. [Step 3 — Configure GitHub Actions Permissions](#step-3--configure-github-actions-permissions)
6. [Step 4 — Trigger Workflows Manually](#step-4--trigger-workflows-manually)
7. [Step 5 — Customize the README](#step-5--customize-the-readme)
8. [Step 6 — Optional Secrets Setup](#step-6--optional-secrets-setup)
9. [How Auto-Update Works](#how-auto-update-works)
10. [Troubleshooting](#troubleshooting)
11. [Customization Reference](#customization-reference)

---

## Prerequisites

- A GitHub account with username `Arslan-web-Dev`
- Git installed locally (optional — you can use GitHub web UI)
- Basic understanding of GitHub Actions (helpful but not required)

---

## Folder Structure

After setup, your repository should look like this:

```
Arslan-web-Dev/              ← Repository name MUST match your GitHub username
│
├── README.md                ← Main profile (auto-updated by Actions)
│
├── .github/
│   └── workflows/
│       ├── update-repos.yml ← Auto-updates Latest Projects every 6 hours
│       ├── snake.yml        ← Generates contribution snake animation daily
│       └── stats.yml        ← Validates stats services every 12 hours
│
├── scripts/
│   ├── update-repos.js      ← Node.js script that fetches repos from GitHub API
│   └── package.json         ← Script dependencies (none external needed)
│
├── assets/
│   └── .gitkeep             ← Placeholder for custom images/GIFs
│
└── SETUP.md                 ← This file
```

---

## Step 1 — Create the Profile Repository

> ⚠️ **Critical:** The repository name MUST exactly match your GitHub username.

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `Arslan-web-Dev` *(exact match to your username)*
3. Set to **Public**
4. ✅ Check "Add a README file"
5. Click **Create repository**

GitHub will automatically recognize this as your profile repository.

---

## Step 2 — Upload All Files

### Option A: Using Git (Recommended)

```bash
# Clone your new profile repo
git clone https://github.com/Arslan-web-Dev/Arslan-web-Dev.git
cd Arslan-web-Dev

# Copy all files from this package into the repo
# (replace the default README.md)
cp -r /path/to/this-package/* .

# Create the assets placeholder
mkdir -p assets
touch assets/.gitkeep

# Commit and push
git add .
git commit -m "🚀 Initial: Dynamic GitHub profile setup"
git push origin main
```

### Option B: GitHub Web UI

1. In your repository, click **Add file → Upload files**
2. Drag and drop all files maintaining the folder structure
3. Commit with message: `🚀 Initial: Dynamic GitHub profile setup`

**Files to upload:**
- `README.md` → root
- `.github/workflows/update-repos.yml`
- `.github/workflows/snake.yml`
- `.github/workflows/stats.yml`
- `scripts/update-repos.js`
- `scripts/package.json`

---

## Step 3 — Configure GitHub Actions Permissions

This is **required** for the auto-update workflows to commit changes back to your repo.

1. Go to your repository: `github.com/Arslan-web-Dev/Arslan-web-Dev`
2. Click **Settings** tab
3. In the left sidebar, click **Actions → General**
4. Scroll to **"Workflow permissions"**
5. Select: ✅ **"Read and write permissions"**
6. ✅ Check **"Allow GitHub Actions to create and approve pull requests"**
7. Click **Save**

---

## Step 4 — Trigger Workflows Manually

After uploading files, manually trigger each workflow once to initialize:

### Trigger "Auto Update Repositories"
1. Go to **Actions** tab in your repository
2. Click **"🔄 Auto Update Repositories"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait ~30 seconds, then check your README — the Latest Projects table should populate!

### Trigger "Generate Snake Animation"
1. Go to **Actions** tab
2. Click **"🐍 Generate Snake Animation"**
3. Click **"Run workflow"** → **"Run workflow"**
4. After it completes, an `output` branch will be created with the snake SVGs
5. The snake will appear in your README automatically (it reads from the output branch)

### Trigger "Generate GitHub Stats"
1. Go to **Actions** tab
2. Click **"📊 Generate GitHub Stats"**
3. Click **"Run workflow"** → **"Run workflow"**

---

## Step 5 — Customize the README

Open `README.md` and replace these placeholders with your real information:

| Placeholder | Replace With |
|:---|:---|
| `your.email@gmail.com` | Your real email address |
| `your-linkedin` | Your LinkedIn username/URL |
| `your-twitter` | Your Twitter/X handle |
| `your-portfolio.vercel.app` | Your portfolio URL |
| `your-username` (Dev.to) | Your Dev.to profile |
| `your-profile` (Upwork) | Your Upwork profile URL |
| `UTC+5` (timezone) | Your actual UTC offset |

### Customize Featured Projects Section

In the "Featured Projects" section, replace the placeholder repo cards with your actual repos:

```markdown
<!-- Change this: -->
<img src="https://github-readme-stats.vercel.app/api/pin/?username=Arslan-web-Dev&repo=Arslan-web-Dev...

<!-- To this (replace 'your-repo-name' with actual repo): -->
<img src="https://github-readme-stats.vercel.app/api/pin/?username=Arslan-web-Dev&repo=your-repo-name...
```

### Add Custom GIF/Image

Place a custom coding GIF in the `assets/` folder and update this line in README:
```markdown
<img src="https://raw.githubusercontent.com/Arslan-web-Dev/Arslan-web-Dev/main/assets/coding.gif"
```

Great sources for developer GIFs:
- [GIPHY Developer](https://giphy.com/explore/developer)  
- [tenor.com](https://tenor.com/search/coding)
- Create your own with [Lottie](https://lottiefiles.com/)

---

## Step 6 — Optional Secrets Setup

The workflows use `GITHUB_TOKEN` which is automatically provided — **no setup needed for basic use**.

### For Higher API Rate Limits (Optional)

If you have many repos or run into rate limiting:

1. Create a Personal Access Token (PAT):
   - Go to **Settings → Developer settings → Personal access tokens → Tokens (classic)**
   - Click **Generate new token (classic)**
   - Select scopes: `repo`, `read:user`
   - Copy the token

2. Add as a repository secret:
   - Go to your repo **Settings → Secrets and variables → Actions**
   - Click **New repository secret**
   - Name: `GH_PAT`
   - Value: paste your token
   - Click **Add secret**

3. Update `.github/workflows/update-repos.yml`, change:
   ```yaml
   GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   # To:
   GITHUB_TOKEN: ${{ secrets.GH_PAT }}
   ```

---

## How Auto-Update Works

```
Every 6 hours (or on push to main):
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions starts "🔄 Auto Update Repositories"   │
│                                                         │
│  1. Runs scripts/update-repos.js                        │
│  2. Script calls GitHub API for all your repos          │
│  3. Filters out: forks, archived, private repos         │
│  4. Sorts by: last updated (configurable)               │
│  5. Takes top 10 (configurable)                         │
│  6. Generates Markdown table with stats                 │
│  7. Replaces content between markers in README.md:      │
│     <!-- LATEST-REPOS-START --> ... <!-- LATEST-REPOS-END --> │
│  8. Commits & pushes README.md back to main             │
└─────────────────────────────────────────────────────────┘

Every day at midnight:
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions starts "🐍 Generate Snake Animation"    │
│                                                         │
│  1. Reads your contribution graph from GitHub           │
│  2. Generates animated SVG snake eating the dots        │
│  3. Pushes to 'output' branch                           │
│  4. README.md reads the SVG from output branch          │
└─────────────────────────────────────────────────────────┘
```

### Adding a New Repository

Just push it to GitHub — **it will appear automatically in the next cycle** (within 6 hours).  
To trigger immediately: **Actions → "🔄 Auto Update Repositories" → Run workflow**.

---

## Troubleshooting

### ❌ "Resource not accessible by integration"
→ Go to Settings → Actions → General → Workflow permissions → Enable "Read and write permissions"

### ❌ Snake animation not showing
→ Wait for the snake workflow to complete. Check the `output` branch exists with the SVG files.

### ❌ Stats cards showing "not found" 
→ This is usually a temporary issue with the external services. Wait a few minutes and refresh.

### ❌ Latest repos not updating
→ Check the Actions tab for workflow run errors. Most common cause: permissions not set correctly.

### ❌ Profile views counter not incrementing
→ The counter from `komarev.com` only works when the README is viewed on GitHub.com — not in editors.

### ⚠️ Rate limiting from GitHub API
→ Add a Personal Access Token as `GH_PAT` secret (see Step 6).

---

## Customization Reference

### Change Number of Repos Shown

In `.github/workflows/update-repos.yml`:
```yaml
MAX_REPOS: "10"    # Change this number
```

### Change Sort Order

```yaml
SORT_BY: "updated"   # Options: updated | stars | created
```

### Exclude Specific Repos

In `scripts/update-repos.js`:
```javascript
excludeRepos: ["repo-to-hide", "another-repo"],
```

### Change Update Frequency

In `.github/workflows/update-repos.yml`:
```yaml
schedule:
  - cron: "0 */6 * * *"   # Every 6 hours
  # Other options:
  # - cron: "0 */12 * * *"  # Every 12 hours
  # - cron: "0 0 * * *"     # Once daily at midnight
  # - cron: "0 0 * * 1"     # Once weekly (Monday)
```

### Change Theme Color

Search for `00d9ff` in `README.md` and replace with your preferred color.

Popular dev profile colors:
- `00d9ff` — Cyan (current)
- `f0c142` — Gold
- `ff6b6b` — Coral
- `a8edea` — Mint
- `7c3aed` — Purple

---

## 🎉 Done!

Your GitHub profile is now:
- ✅ Auto-updating every 6 hours
- ✅ Showing latest repos without manual edits
- ✅ Displaying live GitHub stats
- ✅ Animated contribution snake
- ✅ Professional dark developer aesthetic
- ✅ Optimized for recruiter visibility

**Share your profile:** `github.com/Arslan-web-Dev`
