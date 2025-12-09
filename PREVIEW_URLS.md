# Preview URLs - Quick Reference

## Preview Secret

**Default token (for testing):** `preview-secret-change-me`

⚠️ **Important:** Set a secure token in Vercel environment variables:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add: `PREVIEW_SECRET` = `your-secure-token-here`
- Redeploy after adding the variable

---

## URLs to Copy & Paste

### 1. Email Sequence Preview
Replace `YOUR_DOMAIN` with your Vercel domain (e.g., `your-site.vercel.app`)

**HTML Preview (Recommended):**
```
https://YOUR_DOMAIN/api/preview-emails?token=preview-secret-change-me&format=html
```

**With custom first name:**
```
https://YOUR_DOMAIN/api/preview-emails?token=preview-secret-change-me&format=html&firstname=Sarah
```

**JSON API:**
```
https://YOUR_DOMAIN/api/preview-emails?token=preview-secret-change-me
```

---

### 2. Presentation Deck
```
https://YOUR_DOMAIN/presentation?token=preview-secret-change-me
```

---

## Example URLs (Replace with your domain)

If your domain is `devops-productivity-suite.vercel.app`:

- **Email Preview:** `https://devops-productivity-suite.vercel.app/api/preview-emails?token=preview-secret-change-me&format=html`
- **Presentation:** `https://devops-productivity-suite.vercel.app/presentation?token=preview-secret-change-me`

---

## After Setting PREVIEW_SECRET in Vercel

Once you set `PREVIEW_SECRET` in Vercel, replace `preview-secret-change-me` in the URLs above with your actual secret token.
