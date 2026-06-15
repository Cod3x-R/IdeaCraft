/**
 * ============================================================
 *  IdeaCraft — Automation Engine
 *  06_Emails.gs  →  All branded emails (HTML, mobile-friendly).
 *  ------------------------------------------------------------
 *  Design matches the website: dark header, green→gold accent,
 *  cream body, Syne-style headings. Table-based for Gmail/Outlook.
 * ============================================================
 */

/* ---------- Low-level send ---------- */
function sendEmail_(to, subject, html) {
  const opts = {
    htmlBody: html,
    name: CONFIG.SENDER_NAME || CONFIG.BUSINESS_NAME,
    replyTo: CONFIG.NOTIFY_EMAIL
  };
  if (CONFIG.SENDER_EMAIL) opts.from = CONFIG.SENDER_EMAIL;  // requires a verified Gmail alias
  try {
    GmailApp.sendEmail(to, subject, htmlToText_(html), opts);
  } catch (e) {
    // Fallback if 'from' alias isn't allowed
    delete opts.from;
    MailApp.sendEmail(Object.assign({ to: to, subject: subject }, opts));
  }
}

/* ---------- The branded shell ---------- */
/**
 * opts = { preheader, eyebrow, heading, intro, bodyHtml, ctaText, ctaUrl,
 *          secondaryHtml, signOff }
 */
function emailShell_(opts) {
  const C = CONFIG;
  const cta = opts.ctaText && opts.ctaUrl ? `
    <tr><td style="padding:8px 0 4px">
      <a href="${opts.ctaUrl}" target="_blank"
         style="display:inline-block;background:${C.COLOR_GREEN};background:linear-gradient(135deg,${C.COLOR_GREEN},${C.COLOR_GREEN_DK});
                color:#04140C;font-weight:700;font-size:16px;text-decoration:none;
                padding:15px 30px;border-radius:999px;font-family:Arial,Helvetica,sans-serif">
        ${opts.ctaText}
      </a>
    </td></tr>` : '';

  const preheader = opts.preheader || '';
  const eyebrow = opts.eyebrow ? `
    <div style="text-transform:uppercase;letter-spacing:.18em;font-size:11px;font-weight:700;
                color:${C.COLOR_GREEN};margin-bottom:10px;font-family:Arial,Helvetica,sans-serif">
      ${opts.eyebrow}</div>` : '';

  const logo = C.LOGO_URL ? `
    <img src="${C.LOGO_URL}" alt="${C.BUSINESS_NAME}" height="38"
         style="height:38px;display:inline-block;border:0" />` :
    `<span style="font-size:22px;font-weight:800;color:${C.COLOR_CREAM};
                  font-family:Arial,Helvetica,sans-serif">${C.BUSINESS_NAME}</span>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#EFE6D8;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#EFE6D8">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFE6D8;padding:28px 12px">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0"
         style="width:600px;max-width:100%;background:#FFFDF9;border-radius:18px;overflow:hidden;
                box-shadow:0 18px 50px rgba(26,17,8,.14)">

    <!-- Header -->
    <tr><td style="background:${C.COLOR_DARK};padding:22px 32px" align="left">
      <table role="presentation" width="100%"><tr>
        <td align="left">${logo}</td>
        <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;
            letter-spacing:.12em;text-transform:uppercase;color:${C.COLOR_GOLD}">Brand Studio</td>
      </tr></table>
    </td></tr>
    <!-- accent bar -->
    <tr><td style="height:4px;background:linear-gradient(90deg,${C.COLOR_GREEN},${C.COLOR_GOLD})"></td></tr>

    <!-- Body -->
    <tr><td style="padding:34px 32px 12px;font-family:Arial,Helvetica,sans-serif;color:${C.COLOR_TEXT}">
      ${eyebrow}
      <h1 style="margin:0 0 14px;font-size:26px;line-height:1.18;color:${C.COLOR_TEXT};
                 font-family:'Trebuchet MS',Arial,sans-serif;font-weight:800">${opts.heading || ''}</h1>
      ${opts.intro ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4A3B2A">${opts.intro}</p>` : ''}
      ${opts.bodyHtml || ''}
    </td></tr>

    <!-- CTA -->
    <tr><td style="padding:6px 32px 30px" align="left">
      <table role="presentation">${cta}</table>
      ${opts.secondaryHtml || ''}
    </td></tr>

    <!-- Sign off -->
    ${opts.signOff !== false ? `
    <tr><td style="padding:0 32px 30px;font-family:Arial,Helvetica,sans-serif;color:#4A3B2A;font-size:15px">
      <p style="margin:0">Warmly,<br><strong style="color:${C.COLOR_TEXT}">The ${C.BUSINESS_NAME} Studio</strong></p>
    </td></tr>` : ''}

    <!-- Footer -->
    <tr><td style="background:${C.COLOR_DARK};padding:22px 32px;font-family:Arial,Helvetica,sans-serif">
      <p style="margin:0 0 6px;color:${C.COLOR_CREAM};font-size:13px;font-weight:700">${C.BUSINESS_NAME}</p>
      <p style="margin:0;color:#8C7B66;font-size:12px;line-height:1.7">
        ${C.TAGLINE}<br>
        📧 <a href="mailto:${C.NOTIFY_EMAIL}" style="color:${C.COLOR_GREEN};text-decoration:none">${C.NOTIFY_EMAIL}</a>
        &nbsp;•&nbsp; 📱 <a href="https://wa.me/${C.WHATSAPP}" style="color:${C.COLOR_GREEN};text-decoration:none">${C.PHONE}</a><br>
        🌐 <a href="${C.WEBSITE_URL}" style="color:${C.COLOR_GREEN};text-decoration:none">${C.WEBSITE_URL}</a>
        &nbsp;•&nbsp; Made with 💚 in South Africa
      </p>
    </td></tr>

  </table>
  <p style="font-family:Arial,Helvetica,sans-serif;color:#A8967E;font-size:11px;margin:18px 0 0">
    © ${new Date().getFullYear()} ${C.BUSINESS_NAME}. All rights reserved.</p>
</td></tr>
</table></body></html>`;
}

/* small helper: a soft info card used inside email bodies */
function card_(rowsHtml) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="background:#FBF4E9;border:1px solid #ECDFCB;border-radius:12px;margin:4px 0 8px">
    <tr><td style="padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4A3B2A">
    ${rowsHtml}</td></tr></table>`;
}
function kv_(k, v) {
  if (!v) return '';
  return `<div style="margin:0 0 6px"><span style="color:#9A8A78">${k}:</span>
          <strong style="color:${CONFIG.COLOR_TEXT}">${escapeHtml_(v)}</strong></div>`;
}

/* ============================================================
 *  CUSTOMER-FACING EMAILS
 * ============================================================ */

/** 1. Auto-reply after enquiry — sends the Brand Brief link. */
function sendBriefEmail_(c) {
  const first = firstName_(c.name);
  const html = emailShell_({
    preheader: 'Thanks for reaching out — here’s your next step.',
    eyebrow: 'Welcome to IdeaCraft',
    heading: `Hi ${first}, let’s build your brand! 🎉`,
    intro: `Thank you for your enquiry about the <strong>${escapeHtml_(c.package)}</strong>. ` +
           `We’re excited to work with ${escapeHtml_(c.business || 'you')}.`,
    bodyHtml:
      `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A3B2A">
        To get started, please fill in our quick <strong>Brand Brief</strong>. It tells us your
        colours, style, and vision so the very first draft lands close to what you imagine.
        It takes about 5–8 minutes.</p>` +
      card_(
        `<strong style="color:${CONFIG.COLOR_TEXT}">What happens next</strong>
         <div style="margin-top:8px">
           1️⃣ &nbsp;You complete the Brand Brief (button below)<br>
           2️⃣ &nbsp;We design your package and send you a preview<br>
           3️⃣ &nbsp;You confirm, or request tweaks until it’s perfect<br>
           4️⃣ &nbsp;Pay securely &amp; receive your complete files
         </div>`),
    ctaText: 'Fill in my Brand Brief →',
    ctaUrl: c.briefUrl,
    secondaryHtml:
      `<p style="margin:14px 0 0;font-size:13px;color:#9A8A78;font-family:Arial,Helvetica,sans-serif">
        Button not working? Copy this link:<br>
        <a href="${c.briefUrl}" style="color:${CONFIG.COLOR_GREEN_DK};word-break:break-all">${c.briefUrl}</a></p>`
  });
  sendEmail_(c.email, `Welcome to IdeaCraft — your Brand Brief is ready 🎨`, html);
}

/** 3. Preview ready */
function sendPreviewEmail_(c, link) {
  const first = firstName_(c.name);
  const html = emailShell_({
    preheader: 'Your first design preview is ready to view.',
    eyebrow: 'Preview Ready',
    heading: `${first}, your design preview is here 👀`,
    intro: `We’ve been hard at work on the <strong>${escapeHtml_(c.package)}</strong> for ` +
           `${escapeHtml_(c.business || 'your brand')}. Take a look and tell us what you think.`,
    bodyHtml:
      card_(
        `<strong style="color:${CONFIG.COLOR_TEXT}">How to review</strong>
         <div style="margin-top:8px">
           • Open the preview using the button below.<br>
           • Love it? Just reply <strong>“Approved”</strong> and we’ll send your payment link.<br>
           • Want changes? Reply with exactly what to adjust — we’ll refine it.
         </div>`),
    ctaText: 'View my preview →',
    ctaUrl: link,
    secondaryHtml:
      `<p style="margin:14px 0 0;font-size:13px;color:#9A8A78;font-family:Arial,Helvetica,sans-serif">
        Preview link: <a href="${link}" style="color:${CONFIG.COLOR_GREEN_DK};word-break:break-all">${link}</a></p>`
  });
  sendEmail_(c.email, `Your IdeaCraft preview is ready 🎨 — ${c.business || c.name}`, html);
}

/** 4. Revision acknowledgement */
function sendRevisionAckEmail_(c, note) {
  const first = firstName_(c.name);
  const html = emailShell_({
    preheader: 'We’ve got your changes — working on them now.',
    eyebrow: 'Revisions Underway',
    heading: `Got it, ${first} — we’re on it ✍️`,
    intro: `Thanks for the feedback. Our designers are applying your requested changes now, ` +
           `and we’ll send you an updated preview shortly.`,
    bodyHtml: note ? card_(`<strong style="color:${CONFIG.COLOR_TEXT}">What we’re changing</strong>
              <div style="margin-top:8px">${escapeHtml_(note)}</div>`) : '',
    signOff: true
  });
  sendEmail_(c.email, `We’re refining your design ✍️ — IdeaCraft`, html);
}

/** 6. Payment link */
function sendPaymentEmail_(c, link) {
  const first = firstName_(c.name);
  const html = emailShell_({
    preheader: 'One step away from your finished brand package.',
    eyebrow: 'Final Step',
    heading: `${first}, your package is approved! 🎉`,
    intro: `So glad you love it! To release your complete files for the ` +
           `<strong>${escapeHtml_(c.package)}</strong>, please complete your secure payment below.`,
    bodyHtml:
      card_(kv_('Package', c.package) +
            `<div style="margin-top:8px;color:#4A3B2A">As soon as payment reflects, we’ll send a
             link to your full package — every file, every format, ready to use.</div>`),
    ctaText: 'Pay securely with Yoco →',
    ctaUrl: link,
    secondaryHtml:
      `<p style="margin:14px 0 0;font-size:13px;color:#9A8A78;font-family:Arial,Helvetica,sans-serif">
        🔒 Secure payment powered by Yoco. Link:
        <a href="${link}" style="color:${CONFIG.COLOR_GREEN_DK};word-break:break-all">${link}</a></p>`
  });
  sendEmail_(c.email, `Your IdeaCraft package is ready — secure payment 💳`, html);
}

/** 7. Payment received receipt */
function sendPaymentReceivedEmail_(c) {
  const first = firstName_(c.name);
  const html = emailShell_({
    preheader: 'Payment received — thank you!',
    eyebrow: 'Payment Received',
    heading: `Thank you, ${first}! 🙏`,
    intro: `We’ve received your payment for the <strong>${escapeHtml_(c.package)}</strong>. ` +
           `We’re packaging up your complete files now and will send your delivery link very shortly.`,
    bodyHtml: card_(kv_('Package', c.package) + kv_('Status', 'Paid ✓')),
    signOff: true
  });
  sendEmail_(c.email, `Payment received — thank you! 🙏 IdeaCraft`, html);
}

/** 8. Final delivery */
function sendDeliveryEmail_(c, link) {
  const first = firstName_(c.name);
  const html = emailShell_({
    preheader: 'Your complete brand package is ready to download.',
    eyebrow: 'Delivered 🎁',
    heading: `${first}, your brand package is ready! 🚀`,
    intro: `It’s been a pleasure building this for ${escapeHtml_(c.business || 'you')}. ` +
           `Your complete <strong>${escapeHtml_(c.package)}</strong> is waiting in the folder below — ` +
           `every file, in every format you need.`,
    bodyHtml:
      card_(
        `<strong style="color:${CONFIG.COLOR_TEXT}">Inside your folder</strong>
         <div style="margin-top:8px">
           • All final designs (PNG, JPG, PDF + source files)<br>
           • Print-ready &amp; web-ready versions<br>
           • Any guides included in your package
         </div>`) +
      `<p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#4A3B2A">
        Loved working with us? A quick review or a referral means the world to a growing studio. 💚</p>`,
    ctaText: 'Open my package →',
    ctaUrl: link,
    secondaryHtml:
      `<p style="margin:14px 0 0;font-size:13px;color:#9A8A78;font-family:Arial,Helvetica,sans-serif">
        Your files: <a href="${link}" style="color:${CONFIG.COLOR_GREEN_DK};word-break:break-all">${link}</a></p>`
  });
  sendEmail_(c.email, `🎉 Your IdeaCraft package is ready to download!`, html);
}

/* ============================================================
 *  OWNER-FACING NOTIFICATIONS
 * ============================================================ */

function notifyOwnerNewEnquiry_(c) {
  const html = emailShell_({
    preheader: `New enquiry from ${c.name} — ${c.package}`,
    eyebrow: 'New Lead',
    heading: `New enquiry: ${escapeHtml_(c.business || c.name)} 🔔`,
    intro: `A new enquiry just came in via the website. The customer has been auto-sent the Brand Brief.`,
    bodyHtml: card_(
      kv_('Client ID', c.clientId) + kv_('Name', c.name) + kv_('Business', c.business) +
      kv_('Email', c.email) + kv_('Phone', c.phone) + kv_('Package', c.package) +
      (c.message ? `<div style="margin-top:8px;color:#9A8A78">Message:</div>
        <div style="color:#4A3B2A">${escapeHtml_(c.message)}</div>` : '')),
    ctaText: 'Open the CRM →',
    ctaUrl: getOrCreateSpreadsheet_().getUrl(),
    signOff: false
  });
  sendEmail_(CONFIG.NOTIFY_EMAIL, `🔔 New enquiry — ${c.business || c.name} (${c.package})`, html);
}

function notifyOwnerBriefIn_(info) {
  let rows = '';
  Object.keys(info.answers || {}).forEach(k => {
    let v = info.answers[k];
    if (Array.isArray(v)) v = v.join(', ');
    if (v) rows += kv_(k, v);
  });
  const html = emailShell_({
    preheader: `${info.business || info.name} submitted their Brand Brief`,
    eyebrow: 'Brief Received',
    heading: `Brief in: ${escapeHtml_(info.business || info.name)} 📝`,
    intro: `The client completed the Brand Brief. You’re clear to start designing.`,
    bodyHtml: card_(rows || kv_('Email', info.email)),
    ctaText: 'View full response →',
    ctaUrl: info.editUrl || getOrCreateSpreadsheet_().getUrl(),
    signOff: false
  });
  sendEmail_(CONFIG.NOTIFY_EMAIL, `📝 Brief received — ${info.business || info.name}`, html);
}

/* ============================================================
 *  Utilities
 * ============================================================ */
function firstName_(name) {
  if (!name) return 'there';
  return String(name).trim().split(/\s+/)[0];
}
function escapeHtml_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}
function htmlToText_(html) {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|tr|div|h1|h2|h3)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n').trim();
}
