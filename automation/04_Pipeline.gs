/**
 * ============================================================
 *  IdeaCraft — Automation Engine
 *  04_Pipeline.gs  →  The owner's control panel.
 *  ------------------------------------------------------------
 *  Adds the "IdeaCraft" menu to the Sheet. Select a client row,
 *  then pick an action to move them through the pipeline. Each
 *  action sends the matching branded email automatically.
 * ============================================================
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🟢 IdeaCraft')
    .addItem('① Re-send Brief Form',        'menuSendBrief')
    .addItem('② Create / Open Drive Folder', 'menuDriveFolder')
    .addSeparator()
    .addItem('③ Send Preview to Client',     'menuSendPreview')
    .addItem('④ Log Revision Request',       'menuLogRevision')
    .addItem('⑤ Mark Approved by Client',    'menuMarkApproved')
    .addSeparator()
    .addItem('⑥ Send Payment Link',          'menuSendPayment')
    .addItem('⑦ Mark as Paid',               'menuMarkPaid')
    .addItem('⑧ Send Final Delivery',        'menuSendDelivery')
    .addSeparator()
    .addItem('🔧 Run / repair Setup',        'setup')
    .addItem('ℹ️  Get my Web App URL',        'menuShowWebAppUrl')
    .addToUi();
}

/* ---------- Menu actions ---------- */

function menuSendBrief() {
  const c = mustClient_();
  if (!c) return;
  sendBriefEmail_(c);
  setStageForRow_(c.row, CONFIG.STAGES.BRIEF_SENT, 'Brief form re-sent');
  toast_('Brief form sent to ' + c.email);
}

function menuDriveFolder() {
  const c = mustClient_();
  if (!c) return;
  let url = getCell_(c.row, 'Drive Folder');
  if (!url) {
    const folder = getRootFolder_().createFolder(
      c.clientId + ' — ' + (c.business || c.name || 'Client'));
    url = folder.getUrl();
    setCell_(c.row, 'Drive Folder', url);
    setCell_(c.row, 'Last Action', 'Drive folder created');
  }
  ui_().showModalDialog(
    HtmlService.createHtmlOutput(
      '<p style="font:14px Arial">Folder ready:</p>' +
      '<p><a href="' + url + '" target="_blank">' + url + '</a></p>')
      .setWidth(420).setHeight(140),
    'Client Drive Folder');
}

function menuSendPreview() {
  const c = mustClient_();
  if (!c) return;
  const link = prompt_('Paste the PREVIEW link (Google Drive / image / PDF) to send to the client:');
  if (link === null) return;
  setCell_(c.row, 'Preview Link', link);
  sendPreviewEmail_(c, link);
  setStageForRow_(c.row, CONFIG.STAGES.PREVIEW, 'Preview sent');
  toast_('Preview sent to ' + c.email);
}

function menuLogRevision() {
  const c = mustClient_();
  if (!c) return;
  const note = prompt_('What revision did the client request? (logged + acknowledged by email)');
  if (note === null) return;
  appendNote_(c.row, 'Revision: ' + note);
  sendRevisionAckEmail_(c, note);
  setStageForRow_(c.row, CONFIG.STAGES.REVISIONS, 'Revision requested');
  toast_('Revision logged & acknowledged.');
}

function menuMarkApproved() {
  const c = mustClient_();
  if (!c) return;
  setStageForRow_(c.row, CONFIG.STAGES.APPROVED, 'Client approved preview');
  toast_('Marked APPROVED. You can now send the payment link.');
}

function menuSendPayment() {
  const c = mustClient_();
  if (!c) return;
  const link = prompt_('Paste your Yoco payment link for ' + (c.package || 'this package') +
                       '\n(Yoco dashboard ▸ Online ▸ Payment Links ▸ create ▸ copy):');
  if (link === null) return;
  setCell_(c.row, 'Payment Link', link);
  setCell_(c.row, 'Payment Status', 'Awaiting payment');
  sendPaymentEmail_(c, link);
  setStageForRow_(c.row, CONFIG.STAGES.PAY_SENT, 'Payment link sent');
  toast_('Payment link sent to ' + c.email);
}

function menuMarkPaid() {
  const c = mustClient_();
  if (!c) return;
  setCell_(c.row, 'Payment Status', 'PAID ✓');
  setStageForRow_(c.row, CONFIG.STAGES.PAID, 'Payment received');
  sendPaymentReceivedEmail_(c);
  toast_('Marked PAID & receipt sent. Now send the final delivery.');
}

function menuSendDelivery() {
  const c = mustClient_();
  if (!c) return;
  const link = prompt_('Paste the FINAL DELIVERY link (Google Drive / OneDrive folder with the complete package):');
  if (link === null) return;
  setCell_(c.row, 'Delivery Link', link);
  sendDeliveryEmail_(c, link);
  setStageForRow_(c.row, CONFIG.STAGES.DELIVERED, 'Final package delivered');
  toast_('🎉 Delivered! The client has their package.');
}

function menuShowWebAppUrl() {
  let url;
  try { url = ScriptApp.getService().getUrl(); } catch (e) { url = ''; }
  ui_().showModalDialog(
    HtmlService.createHtmlOutput(
      '<p style="font:14px Arial">Your Web App URL (paste into <b>js/main.js</b> → SCRIPT_URL):</p>' +
      (url ? '<p style="word-break:break-all"><code>' + url + '</code></p>'
           : '<p>Not deployed yet. Use <b>Deploy ▸ New deployment ▸ Web app</b> first.</p>'))
      .setWidth(520).setHeight(170),
    'Web App URL');
}

/* ---------- Row / cell helpers ---------- */

function mustClient_() {
  const c = getSelectedClient_();
  if (!c) { ui_().alert('Select a client row first (click any cell in that row).'); return null; }
  if (!isEmail_(c.email)) { ui_().alert('That row has no valid email address.'); return null; }
  return c;
}

function getSelectedClient_() {
  const sh = getCrmSheet_();
  const row = sh.getActiveCell().getRow();
  if (row < 2) return null;
  return {
    row: row,
    clientId: getCell_(row, 'Client ID'),
    name:     getCell_(row, 'Name'),
    business: getCell_(row, 'Business'),
    email:    getCell_(row, 'Email'),
    phone:    getCell_(row, 'Phone'),
    package:  getCell_(row, 'Package'),
    message:  getCell_(row, 'Enquiry Message'),
    briefUrl: getCell_(row, 'Brief Form Link') || getBriefFormUrl_()
  };
}

function colIndex_(header) {
  return CRM_HEADERS.indexOf(header) + 1; // 1-based
}
function getCell_(row, header) {
  return getCrmSheet_().getRange(row, colIndex_(header)).getValue();
}
function setCell_(row, header, value) {
  getCrmSheet_().getRange(row, colIndex_(header)).setValue(value);
}
function appendNote_(row, text) {
  const cur = getCell_(row, 'Notes');
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd MMM HH:mm');
  setCell_(row, 'Notes', (cur ? cur + '\n' : '') + stamp + ' — ' + text);
}
function setStageForRow_(row, stage, action) {
  setCell_(row, 'Stage', stage);
  if (action) setCell_(row, 'Last Action', action);
}

/* ---------- UI helpers ---------- */
function ui_()   { return SpreadsheetApp.getUi(); }
function toast_(m){ SpreadsheetApp.getActiveSpreadsheet().toast(m, 'IdeaCraft', 6); }
function prompt_(label) {
  const res = ui_().prompt('IdeaCraft', label, ui_().ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui_().Button.OK) return null;
  return res.getResponseText().trim();
}
