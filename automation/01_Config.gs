/**
 * ============================================================
 *  IdeaCraft — Automation Engine
 *  01_Config.gs  →  All your settings live here.
 *  ------------------------------------------------------------
 *  This is the ONLY file you normally need to edit.
 *  Change the values below to match your business, then save.
 * ============================================================
 */

const CONFIG = {

  /* ---- Business identity ---- */
  BUSINESS_NAME:  'IdeaCraft',
  TAGLINE:        'We Build Brands That Get Noticed.',

  /* Where YOU get notified of new enquiries / brief submissions.
     Can be the same as the sending account or any inbox you check. */
  NOTIFY_EMAIL:   'ideacraftmain@gmail.com',

  /* The address customers see emails coming FROM.
     Leave blank ('') to use the Google account running the script.
     If you set a Gmail "Send As" alias, put it here. */
  SENDER_EMAIL:   'ideacraftmain@gmail.com',
  SENDER_NAME:    'IdeaCraft Studio',

  /* Contact details shown in email footers */
  PHONE:          '+27 (66) 548 3946',
  WHATSAPP:       '27665483946',                 // digits only, for wa.me links
  WEBSITE_URL:    'https://ideacraft.co.za',      // <-- update to your live URL

  /* Public URL of your logo (used in email headers).
     Easiest: keep your site live and point at the hosted logo. */
  LOGO_URL:       'https://ideacraft.co.za/images/logo_ts_dark.png',

  /* ---- Brand colours (match the website) ---- */
  COLOR_GREEN:    '#12C774',
  COLOR_GREEN_DK: '#0DA862',
  COLOR_GOLD:     '#F4B942',
  COLOR_DARK:     '#0C0A08',
  COLOR_DARK_2:   '#1C1610',
  COLOR_CREAM:    '#F5EDE0',
  COLOR_TEXT:     '#1A1108',

  /* ---- Pipeline stages (do not rename — used internally) ---- */
  STAGES: {
    NEW:        'NEW ENQUIRY',
    BRIEF_SENT: 'BRIEF SENT',
    BRIEF_IN:   'BRIEF RECEIVED',
    DESIGN:     'IN DESIGN',
    PREVIEW:    'PREVIEW SENT',
    REVISIONS:  'REVISIONS',
    APPROVED:   'APPROVED',
    PAY_SENT:   'PAYMENT SENT',
    PAID:       'PAID',
    DELIVERED:  'DELIVERED'
  },

  /* ---- Package catalogue ----
     Keys MUST match the <option value="..."> in the website form. */
  PACKAGES: {
    'starter':         { label: 'Starter Package',          price: 'R2,500' },
    'gold-startup':    { label: 'Gold Startup Package',      price: 'R6,500' },
    'platinum-launch': { label: 'Platinum Launch Package',   price: 'R11,500' },
    'social-boost':    { label: 'Social Boost',              price: 'R2,000 / month' },
    'brand-refresh':   { label: 'Brand Refresh',            price: 'R3,800' },
    'website-only':    { label: 'Website Only',             price: 'Custom quote' },
    'custom':          { label: 'Custom Package',           price: 'Custom quote' }
  },

  /* ---- Security ----
     A shared secret between your website and this script.
     Generate any random string, put the SAME value in js/main.js (SHARED_SECRET).
     Leave '' to disable the check (not recommended for production). */
  SHARED_SECRET: 'CHANGE-ME-to-a-long-random-string-2026'
};

/* Helper: resolve a package key into a friendly "Label — Price" string */
function packageLabel_(key) {
  const p = CONFIG.PACKAGES[key];
  if (!p) return key || 'Not specified';
  return p.price && p.price !== 'Custom quote'
    ? p.label + ' — ' + p.price
    : p.label + (p.price ? ' (' + p.price + ')' : '');
}
