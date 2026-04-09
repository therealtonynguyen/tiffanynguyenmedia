# Tiffany Nguyen Media — Landing Page

Static site: brand logo, scroll animation, contact chips, email form (Formspree), and light/dark theme.

## Run locally

```bash
python3 -m http.server 5173
```

Open `http://localhost:5173`.

## GitHub + FTP deploy

1. Create a repository on GitHub (empty, no README if you are pushing an existing tree).

2. Add the remote and push:

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

3. In the repo on GitHub: **Settings → Secrets and variables → Actions → New repository secret**, add:

   - `FTP_SERVER` — FTP hostname (e.g. `ftp.yourhost.com`)
   - `FTP_USERNAME`
   - `FTP_PASSWORD`

4. Edit `.github/workflows/deploy-ftp.yml` if your web root is not `public_html/` (some hosts use `www/` or `/`).

5. Pushes to **`main`** run **Deploy via FTP** (also runnable manually under **Actions**).

## Files

- `index.html`, `styles.css`, `scroll.js`, `theme.js`, `email-form.js`
- `assets/logo-tn.png`, `favicon.svg`
