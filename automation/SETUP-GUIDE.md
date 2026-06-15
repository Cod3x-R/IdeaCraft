# IdeaCraft — Automation Setup Guide

This turns your website into a hands-off business engine:

> **Enquiry → Brief form → Design → Preview → Revisions → Approve → Payment → Delivery**

Everything runs on **free Google tools** (Forms, Sheets, Drive, Gmail) driven by one
Apps Script project. You set it up **once** (about 15 minutes). After that, new
clients flow in automatically and you move each one along with a click.

---

## How the flow works (the big picture)

```
  CUSTOMER fills website enquiry form
        │
        ▼
  Apps Script web app receives it
        │  ├─► logs a row in your "Clients" CRM sheet
        │  ├─► emails YOU a notification 🔔
        │  └─► auto-emails the CUSTOMER their Brand Brief link 🎨
        ▼
  CUSTOMER completes the Brand Brief (Google Form)
        │  ├─► CRM row flips to "BRIEF RECEIVED"
        │  └─► emails YOU the answers 📝
        ▼
  YOU design the package (drop files in their auto-created Drive folder)
        │
        ▼  (use the "🟢 IdeaCraft" menu in the sheet for every step below)
  Send Preview ─► Revisions (loop) ─► Mark Approved
        ▼
  Send Payment Link ─► Mark as Paid
        ▼
  Send Final Delivery (link to their complete package) 🎉
```

Every step sends a polished, on-brand email automatically.

---

## What you need
- A Google account (the business Gmail: `ideacraftmain@gmail.com` is ideal).
- 15 minutes.
- Your live website files (the `js/main.js` you already have).

---

## Step 1 — Create the control Sheet
1. Go to **https://sheets.google.com** and create a **blank spreadsheet**.
2. Rename it something like **“IdeaCraft — Client CRM”**.

## Step 2 — Open the script editor and add the code
1. In that sheet: **Extensions ▸ Apps Script**. A new tab opens.
2. Delete the empty `Code.gs` sample (or leave it; you'll replace its content).
3. For **each** file in this `automation/` folder, create a matching script file
   and paste its contents:
   - `01_Config.gs`, `02_Setup.gs`, `03_Webhook.gs`,
     `04_Pipeline.gs`, `05_Form.gs`, `06_Emails.gs`
   - To add a file: click the **+** next to *Files* ▸ **Script**, name it
     (e.g. `01_Config`), paste, save. The `.gs` is added automatically.
4. Click the gear ⚙️ **Project Settings** ▸ tick
   **“Show appsscript.json manifest file in editor”**. Then open `appsscript.json`
   in the editor and replace its contents with the one from this folder. Save.

> Tip: the number prefixes just keep the files tidy — order doesn't matter to Google.

## Step 3 — Configure your details
Open **`01_Config.gs`** and check/edit:
- `NOTIFY_EMAIL` / `SENDER_EMAIL` — your business inbox.
- `PHONE`, `WHATSAPP`, `WEBSITE_URL`, `LOGO_URL`.
- `SHARED_SECRET` — change it to a long random string (e.g. mash your keyboard).
  **Remember this value — you'll paste it into the website in Step 6.**

Save (💾 or Ctrl+S).

## Step 4 — Run the setup
1. In the editor toolbar, choose the function **`setup`** from the dropdown.
2. Click **Run**.
3. Google asks for permission the first time:
   **Review permissions ▸ pick your account ▸ Advanced ▸ “Go to … (unsafe)” ▸ Allow.**
   *(This “unsafe” warning is normal for your own private scripts.)*
4. When it finishes, open **View ▸ Logs** (or **Execution log**). You'll see links to:
   - your Brand Brief **form**
   - your client-files **Drive folder**

This created everything: the **Clients** tab, a **How to use** tab, the **Brand
Brief form**, the **Drive folder**, and the auto-trigger.

## Step 5 — Deploy the web app (so the website can reach it)
1. Top-right **Deploy ▸ New deployment**.
2. Click the gear next to *Select type* ▸ **Web app**.
3. Set:
   - **Description:** `IdeaCraft enquiries`
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**
4. **Deploy** ▸ authorise if asked ▸ **copy the Web app URL** (ends in `/exec`).

> Test it: paste that URL in a browser. You should see
> `{"ok":true,"service":"IdeaCraft","status":"live"}`.

## Step 6 — Connect your website
Open **`js/main.js`** in your website project and set, near the bottom:
```js
const SCRIPT_URL    = 'PASTE-YOUR-/exec-URL-HERE';
const SHARED_SECRET = 'THE-SAME-SECRET-FROM-01_Config.gs';
```
Save and re-upload your site (or commit/push to your host).

## Step 7 — Reload the Sheet
Go back to your **Clients** spreadsheet and **refresh the page**. A new
**“🟢 IdeaCraft”** menu appears at the top. That's your control panel.

---

## Daily use — the “🟢 IdeaCraft” menu

A new enquiry appears automatically as a row, and the customer already has their
brief link. From there, **click any cell in a client's row**, then choose:

| Menu item | What it does |
|---|---|
| ① Re-send Brief Form | Resends the Brand Brief email |
| ② Create / Open Drive Folder | Makes (or opens) that client's file folder |
| ③ Send Preview to Client | Prompts for a link, emails the preview |
| ④ Log Revision Request | Records the change + emails an acknowledgement |
| ⑤ Mark Approved by Client | Flags ready-to-pay |
| ⑥ Send Payment Link | Prompts for your payment link, emails it |
| ⑦ Mark as Paid | Marks paid + emails a thank-you |
| ⑧ Send Final Delivery | Prompts for the package link, delivers it 🎉 |

The **Stage** column always shows where each client is.

---

## Payments — Yoco
We use **Yoco** for payments (no monthly fee, ~2.95% + VAT per online payment,
fast onboarding, professional mobile checkout).

**One-time setup**
1. Sign up at **https://www.yoco.com** with your ID + business bank details.
2. Verify your account (usually live within a day or two).

**Per client (at menu step ⑥):**
1. In the Yoco dashboard: **Online ▸ Payment Links ▸ Create a link**.
2. Enter the amount (e.g. R6,500), a reference (use the Client ID, e.g. `IC-26-001`),
   and a description (e.g. "Gold Startup Package").
3. **Copy** the generated link.
4. Back in your CRM, select the client row → menu **⑥ Send Payment Link** → paste it.

The customer gets a branded "Pay securely with Yoco" email. Funds land in your bank
in ~2–3 working days. Mark the client **⑦ Paid** once it reflects.

> Prefer EFT for a particular client? You can paste your banking details into the
> step ⑥ prompt instead of a link — the system will send those. (For Instant EFT
> coverage at scale, PayFast is the usual add-on, but Yoco covers card payments well.)

## Delivering the package
At step ⑧, share the client's Drive folder (or a OneDrive/Dropbox link):
1. Open the client's Drive folder (menu ②).
2. Put the final files inside.
3. **Share ▸ Anyone with the link ▸ Viewer**, copy the link.
4. Run menu ⑧ and paste it.

---

## Test checklist (do this once before going live)
- [ ] `/exec` URL shows the `{"ok":true...}` JSON.
- [ ] Submit your real website form → row appears, you get an email, and the
      test customer gets the brief email.
- [ ] Submit the Brand Brief → row flips to **BRIEF RECEIVED**, you get the answers.
- [ ] Walk one row through ③→⑧ and confirm each email looks right
      (compare with `automation/email-previews/`).

## Troubleshooting
- **No “🟢 IdeaCraft” menu?** Reload the sheet. Still nothing → re-run `setup`.
- **Website form does nothing / leads missing?** Re-check `SCRIPT_URL` is the
  `/exec` URL and re-deploy (**Deploy ▸ Manage deployments ▸ edit ▸ Version: New**).
- **Emails not sending?** Gmail free accounts can send ~100 emails/day — plenty.
  If `SENDER_EMAIL` errors, set it to `''` to send from your raw account.
- **Changed the code later?** You must **redeploy a new version** for the web app
  to pick up changes (Manage deployments ▸ edit ▸ New version).
- **File uploads in the brief greyed out?** Some Google account types restrict
  this; the form still works without that one question.

You're done — your business now runs itself from enquiry to delivery. 💚
