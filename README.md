# Myrmekes Website

Static HTML/CSS site for myrmekes.co.uk. No build step — deploys as-is.

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static file server.

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

- Paste the HubSpot form embed code into `contact.html`, replacing the comment placeholder and the `.contact-placeholder` block. **When you do:** HubSpot forms set cookies, so a cookie consent banner becomes required, and the "no cookies" statements in `privacy.html` must be updated (there's an HTML comment in that file marking exactly where).
- Fill in the phone number and address `[TODO: ...]` placeholders in `contact.html`.
- Fill in the company registration `[TODO: ...]` placeholders (legal entity name, company number, registered office) in the footer of every page, plus `privacy.html` and `terms.html` — from Companies House.
- Have `privacy.html` and `terms.html` reviewed by a solicitor before trading in earnest — they are structured templates, not legal advice.
- Set up a working mailbox for `info@myrmekes.co.uk` (or swap in the real address) before pointing prospects at it — a contact form with no reply-able inbox behind it is worse than no form.
- Supply clean (non-watermarked, no baked-in checkerboard) logo files for Microsoft, HPE, and NetApp so they can join the vendor logo marquee, and confirm vendor logo usage at go-live (nominative use in a "vendors we support" strip is standard practice, but final sign-off sits with Duncan).
