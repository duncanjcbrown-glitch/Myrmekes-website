# Myrmekes Website

Static HTML/CSS site for myrmekes.co.uk. No build step — deploys as-is.

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static file server.

## Deploy to Fasthosts from GitHub

The repository includes `.github/workflows/deploy-fasthosts.yml`. It performs a
manual, non-destructive SFTP upload to the `HTDOCS` folder on the Linux hosting
package assigned to `myrmekes.co.uk`.

Before the first deployment:

1. In GitHub, open **Settings > Environments** and create an environment named
   `fasthosts-production`.
2. Add two environment secrets:
   - `FASTHOSTS_USERNAME` — the username shown under Fasthosts **SSH access**.
   - `FASTHOSTS_PASSWORD` — the SSH password set in the Fasthosts control panel.
3. Open **Actions > Deploy website to Fasthosts > Run workflow**.

The initial workflow deliberately does not delete remote files. Markdown files,
repository metadata, workflow files, source artwork, and the `.superpowers`
folder are excluded from the website upload. After the first deployment has
been verified, automatic deployment from `main` and safe remote cleanup can be
enabled separately.

## Deploy: push to GitHub

This repo is already committed locally (check with `git status` — a clean tree means there's nothing new to add or commit, so skip straight to setting the remote and pushing). If you're starting from a fresh clone or copy instead:

```bash
cd "path/to/Myrmekes Website"
git add .
git commit -m "Initial Myrmekes website"
git branch -M main
git remote add origin https://github.com/<your-username>/myrmekes-website.git
git push -u origin main
```

## Deploy: connect Cloudflare Pages

1. Log in to the Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Select the `myrmekes-website` GitHub repo.
3. Build settings: Framework preset = **None**, Build command = *(leave blank)*, Build output directory = `/`.
4. Click Save and Deploy. Cloudflare builds and deploys the site; every future push to `main` redeploys automatically.

## Point myrmekes.co.uk at Cloudflare

1. In Cloudflare, add `myrmekes.co.uk` as a site (if not already added) and switch its nameservers from Fasthosts to the two Cloudflare nameservers shown in the dashboard (this step is done in the Fasthosts domain control panel).
2. Once DNS is active on Cloudflare, go to the Pages project → Custom domains → Add a domain → enter `myrmekes.co.uk` (and `www.myrmekes.co.uk` if wanted). Cloudflare adds the required DNS record automatically.
3. Wait for the SSL certificate to provision (usually a few minutes). The site is then live at `https://myrmekes.co.uk`.

## Still to do (owned by Duncan, not covered by this build)

- Paste the HubSpot form embed code into `contact.html`, replacing the comment placeholder and the mailto call-request form. **When you do:** HubSpot forms set cookies, so a cookie consent banner becomes required, and the "no cookies" statements in `privacy.html` must be updated (there's an HTML comment in that file marking exactly where).
- Swap the contact phone number (currently Duncan's mobile, 07881 064209) for a Myrmekes landline when one exists.
- Have `privacy.html` and `terms.html` reviewed by a solicitor before trading in earnest — they are structured templates, not legal advice.
- Set up a working mailbox for `info@myrmekes.co.uk` (or swap in the real address) before pointing prospects at it — a contact form with no reply-able inbox behind it is worse than no form.
- Confirm vendor logo usage at go-live (nominative use in a "vendors we support" strip is standard practice, but final sign-off sits with Duncan).
- Verify the global-support globe's country tiers against the original Cantel coverage slide. The full/partial/not-supported lists in `assets/global-support-globe/global-support-globe.js` were inferred from a flattened screenshot and are editable at the top of that file; the globe carries an "indicative coverage" caption in the meantime so nothing is overclaimed.
