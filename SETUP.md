# PK Tri Translator v2: setup (all free)

## What is in this folder
index.html (screens) · style.css (design) · app.js (all logic) · config.js (YOUR settings) · version.json (update check)
manifest.json + sw.js (installable app) · icons/ · supabase.sql (feedback table)

## 1. Publish (same as before)
Upload everything to your GitHub repository (files at the top level, `icons` folder inside), replacing old files. Pages updates in ~2 min.
Open the site, press Ctrl+Shift+R. The app works now: translate, mic (long-press for options), settings, history, share, install, update check.

## 2. Turn on email OTP login + password reset (free Supabase)
1. supabase.com -> sign up -> New project (free). Wait until ready.
2. Project Settings -> API: copy **Project URL** and **anon public key** into `config.js` (SUPABASE_URL, SUPABASE_ANON_KEY). The anon key is meant to be public.
3. Authentication -> Providers -> Email: enabled. Turn OFF "Confirm email" is not needed for code login.
4. **Important:** Authentication -> Email Templates -> "Magic Link" AND "Confirm signup": add the code to the body, for example:
   `Your PK Tri Translator code is: {{ .Token }}`
   (Without `{{ .Token }}` users only get a link, not a code.)
5. Authentication -> URL Configuration: set Site URL to your GitHub Pages address.
6. SQL Editor: paste `supabase.sql` -> Run (creates the feedback table).
7. Email limits: the built-in Supabase sender allows only a few emails per hour. For real users add free SMTP:
   Project Settings -> Authentication -> SMTP Settings (Brevo free = 300 emails/day, or Gmail app password).
8. Save config.js to GitHub. Menu -> Sign in now works. Set REQUIRE_LOGIN: true to force sign-in.

How login works: enter email -> receive code -> verify -> (optional) set a password.
Forgot password: Sign in with password -> Forgot password? -> code by email -> set new password.

## 3. Feedback and rating
Saved to Supabase (view in Table Editor -> feedback). If Supabase is off, set FEEDBACK_EMAIL in config.js and feedback opens an email.
Set PLAY_STORE_URL / APP_STORE_URL to show "Rate on store" buttons for 4-5 star ratings.

## 4. Releasing an update
Change the files, then change the version in BOTH `config.js` (VERSION) and `version.json`, upload to GitHub.
Users with an older version see "Update available" under menu -> Check for updates -> Update now.

## 5. Direct APK download
Android APK cannot be built inside this chat. Go to pwabuilder.com, paste your site address, choose Android, download the APK.
Upload it to your GitHub repo -> Releases, copy the file link into `APK_URL` in config.js. A "Download APK" button then appears in About.

## 6. Android and iPhone details already configured
Android: manifest with name, 192/512 + maskable icons, theme colour, standalone display, service worker.
iPhone: apple-touch-icon, full-screen web-app meta tags, and Add to Home Screen steps shown in the app (Safari only).
Mic: needs https (GitHub Pages is https). Voice works in Chrome and Safari.

## More languages
The 4th card is any language the user picks (about 120, searchable). It translates both ways with Telugu, English and Hindi. Voice and Listen depend on what the phone supports for that language.
