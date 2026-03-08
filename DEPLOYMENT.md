# Deployment Guide - MEAD to GitHub Pages

## Quick Start for richardmcmanus.com/mead

### Step 1: Prepare Your GitHub Pages Repository

If you don't have one yet:
```bash
# Create a new repo named: <username>.github.io
# OR use an existing personal website repo
```

### Step 2: Add MEAD to Your Repo

```bash
# Navigate to your GitHub Pages repo
cd ~/path/to/your/github.io/site

# Option A: Copy the entire mead folder
cp -r ~/path/to/mead ./mead

# Option B: If MEAD is already a git repo, add as submodule
git submodule add https://github.com/<username>/mead.git mead
```

### Step 3: Verify the Structure

Your repo should now look like:
```
your-website/
├── mead/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   ├── README.md
│   └── ...other files
├── index.html (your main site)
├── ...other pages
```

### Step 4: Push to GitHub

```bash
cd ~/path/to/your/github.io/site
git add mead/
git commit -m "Add MEAD fueling planner"
git push origin main
```

### Step 5: Access Your Site

Visit: **https://richardmcmanus.com/mead/**

GitHub Pages will:
1. Find `mead/index.html`
2. Serve it with all assets (css/, js/)
3. Data stored locally in browser

---

## Alternative: Create a Dedicated MEAD Repo

If you want MEAD in its own repository:

### Step 1: Create Repository

```bash
# On GitHub, create: mead (or mead-fueling, etc)
git clone https://github.com/richardmcmanus/mead.git
cd mead
```

### Step 2: Copy Files

```bash
# Copy the mead project files here
```

### Step 3: Enable GitHub Pages

In your repo settings:
- **Settings** → **Pages**
- **Source**: `main` branch
- **Folder**: `/ (root)`
- **Custom domain**: (optional) for subdomain setup

### Step 4: Access

**Option A** - As GitHub Pages project:
```
https://richardmcmanus.github.io/mead/
```

**Option B** - Linked to your main site:
Add to your main site's navigation:
```html
<a href="/mead/">View Fueling Planner</a>
```

---

## Troubleshooting

### "Page not found" error
- Verify `mead/index.html` exists
- Check GitHub Pages is enabled in repo settings
- Wait 2-3 minutes after push (GitHub needs time to build)

### Assets not loading (CSS/JS broken)
- Ensure folder structure is preserved:
  - `mead/css/style.css` (not `mead/style.css`)
  - `mead/js/app.js` (not `mead/app.js`)
- Check browser console (F12) for exact path errors
- Verify file paths are relative (`./css/style.css` ✓, not `/css/style.css`)

### Data not persisting
- localStorage works in browser's local context
- Incognito/Private mode won't persist data
- This is expected behavior for security

### Custom domain setup
If you want `mysite.com/mead/`:
1. Use your custom domain in repo settings
2. MEAD will automatically work at the subpath

---

## Files to Keep

Essential files for deployment:
```
mead/
├── index.html              ✓ REQUIRED
├── css/style.css          ✓ REQUIRED
├── js/app.js              ✓ REQUIRED
├── README.md              ✓ RECOMMENDED
├── package.json           ✓ RECOMMENDED
└── .gitignore            ✓ RECOMMENDED
```

Optional (for backup/reference):
- `MIGRATION_NOTES.md` - Conversion documentation
- Old Python files (`*.py`, `*.yaml`) - Can delete if not needed

## Performance

- **Load time**: < 1 second
- **File size**: ~35 KB total
- **Storage**: Uses browser's localStorage (typically 5-10 MB available)
- **Offline**: Works offline after first load (static files cached)

---

## Updates & Maintenance

To update your deployed MEAD:

```bash
# Make changes locally
cd ~/path/to/mead

# Test
open index.html  # or run local server

# Push to GitHub
git add .
git commit -m "Update fueling calculations"
git push origin main

# Changes live in 1-3 minutes
```

---

## Support

The app is self-contained with **zero dependencies**:
- No npm packages needed
- No build process required
- No backend server required
- Works on GitHub Pages free tier

Simply push and deploy! 🚀
