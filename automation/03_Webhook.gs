/**
 * ============================================================
 *  IdeaCraft — Automation Engine
 *  03_Webhook.gs  →  Receives enquiries from the website.
 *  ------------------------------------------------------------
 *  Deploy this script as a Web App (Deploy ▸ New deployment ▸
 *  Web app ▸ Execute as: Me ▸ Who has access: Anyone).
 *  Put the resulting /exec URL into js/main.js (SCRIPT_URL).
 * ============================================================
 */

/** Health check — open the /exec URL in a browser to confirm it's live. */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'IdeaCraft', status: 'live' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Receives the website enquiry form POST. */
function doPost(e) {
  try {
    const data = parseBody_(e);

    // Optional shared-secret check
    if (CONFIG.SHARED_SECRET && data.secret !== CONFIG.SHARED_SECRET) {
      // Still accept it (so a misconfigured secret never loses a lead),
      // but flag it in the notes so you know to tighten config.
      data._secretWarning = true;
    }

    const client = createEnquiry_({
      name:     (data.name || '').toString().trim(),
      business: (data.business || '').toString().trim(),
      email:    (data.email || '').toString().trim(),
      phone:    (data.phone || '').toString().trim(),
      service:  (data.service || '').toString().trim(),
      message:  (data.message || '').toString().trim(),
      secretWarning: !!data._secretWarning
    });

    return jsonOut_({ ok: true, clientId: client.clientId });
  } catch (err) {
    // Log so a failed lead can be recovered from the Executions panel.
    Logger.log('doPost error: ' + err + '\nRaw: ' + (e && e.postData ? e.postData.contents : 'n/a'));
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function parseBody_(e) {
  if (!e || !e.postData) return {};
  const raw = e.postData.contents || '';
  // Website sends JSON; also support form-encoded just in case.
  try { return JSON.parse(raw); }
  catch (x) { return (e.parameter || {}); }
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Core: log a new enquiry, notify the owner, auto-reply to the customer
 * with their Brand Brief form link. Returns the created client record.
 */
function createEnquiry_(input) {
  const sh = getCrmSheet_();
  const clientId = nextClientId_(sh);
  const briefUrl = getBriefFormUrl_();

  const row = [
    clientId,                                   // Client ID
    new Date(),                                 // Date
    CONFIG.STAGES.BRIEF_SENT,                   // Stage (auto-reply sends brief)
    input.name,                                 // Name
    input.business,                             // Business
    input.email,                                // Email
    input.phone,                                // Phone
    packageLabel_(input.service),               // Package
    input.message,                              // Enquiry Message
    briefUrl,                                    // Brief Form Link
    '',                                          // Brief Received
    '',                                          // Drive Folder
    '', '', '', '',                             // Preview / Payment / Pay status / Delivery
    'Enquiry received via website',            // Last Action
    input.secretWarning ? '⚠ Secret mismatch — check config' : ''
  ];
  sh.appendRow(row);

  const client = {
    clientId: clientId,
    name: input.name, business: input.business, email: input.email,
    phone: input.phone, package: packageLabel_(input.service),
    message: input.message, briefUrl: briefUrl
  };

  // 1) Notify the owner
  try { notifyOwnerNewEnquiry_(client); } catch (e) { Logger.log('owner notify failed: ' + e); }

  // 2) Auto-reply to the customer with their brief link
  if (isEmail_(client.email)) {
    try { sendBriefEmail_(client); } catch (e) { Logger.log('auto-reply failed: ' + e); }
  }

  return client;
}

/* ---- helpers ---- */
function nextClientId_(sh) {
  const last = sh.getLastRow();
  const seq = last; // header is row 1, so row count == sequence
  const yy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yy');
  return 'IC-' + yy + '-' + ('000' + seq).slice(-3);
}

function isEmail_(s) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s || ''); }
