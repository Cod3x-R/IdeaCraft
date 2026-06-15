/**
 * ============================================================
 *  IdeaCraft — Automation Engine
 *  02_Setup.gs  →  Run ONCE to build everything.
 *  ------------------------------------------------------------
 *  In the Apps Script editor, choose the function `setup`
 *  from the dropdown and press Run. Approve the permissions.
 *  It creates: the CRM tab, the Brand Brief form, the Drive
 *  folder, and the auto-trigger. Safe to re-run (idempotent).
 * ============================================================
 */

const PROP = PropertiesService.getScriptProperties();

/* The columns of the CRM tracker tab, in order. */
const CRM_HEADERS = [
  'Client ID', 'Date', 'Stage', 'Name', 'Business', 'Email', 'Phone',
  'Package', 'Enquiry Message', 'Brief Form Link', 'Brief Received',
  'Drive Folder', 'Preview Link', 'Payment Link', 'Payment Status',
  'Delivery Link', 'Last Action', 'Notes'
];

/** MAIN ENTRY POINT — run this once. */
function setup() {
  const ss = getOrCreateSpreadsheet_();
  setupCrmSheet_(ss);
  const folder = getOrCreateRootFolder_();
  const form   = getOrCreateBriefForm_();
  installFormTrigger_(form);
  ensureOnOpenMenu_();

  const msg =
    '✅ IdeaCraft automation is set up!\n\n' +
    '• CRM tracker tab: "Clients"\n' +
    '• Brand Brief form: ' + form.getPublishedUrl() + '\n' +
    '• Client files folder: ' + folder.getUrl() + '\n\n' +
    'NEXT: Deploy the web app (see SETUP-GUIDE.md, Step 4) so your\n' +
    'website can send enquiries here. Then reload this Sheet to see\n' +
    'the "IdeaCraft" menu.';

  Logger.log(msg);
  try { SpreadsheetApp.getActiveSpreadsheet().toast('Setup complete — see Execution log.', 'IdeaCraft', 8); } catch (e) {}
  return msg;
}

/* ---- Spreadsheet (the CRM lives here) ---- */
function getOrCreateSpreadsheet_() {
  // If script is bound to a sheet, use that. Otherwise create a standalone one.
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    let id = PROP.getProperty('SS_ID');
    if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { id = null; } }
    if (!ss) {
      ss = SpreadsheetApp.create('IdeaCraft — Client CRM');
      PROP.setProperty('SS_ID', ss.getId());
    }
  } else {
    PROP.setProperty('SS_ID', ss.getId());
  }
  return ss;
}

function setupCrmSheet_(ss) {
  let sh = ss.getSheetByName('Clients');
  if (!sh) sh = ss.insertSheet('Clients', 0);

  // Header row
  const headerRange = sh.getRange(1, 1, 1, CRM_HEADERS.length);
  headerRange.setValues([CRM_HEADERS]);
  headerRange
    .setBackground(CONFIG.COLOR_DARK)
    .setFontColor(CONFIG.COLOR_GREEN)
    .setFontWeight('bold')
    .setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 34);

  // Reasonable column widths
  const widths = [90,150,130,150,160,210,140,170,260,220,110,220,220,220,120,220,180,260];
  widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));

  // Remove default extra sheet if present and empty
  const def = ss.getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(def);

  // A small "Dashboard" note tab for the owner
  if (!ss.getSheetByName('How to use')) {
    const help = ss.insertSheet('How to use');
    help.getRange('A1').setValue('IdeaCraft — Quick Guide').setFontSize(16).setFontWeight('bold');
    const lines = [
      '',
      '1. A new website enquiry appears automatically as a row on the "Clients" tab.',
      '   You get an email, and the customer gets an auto-reply with their Brief form link.',
      '',
      '2. When the customer submits the Brand Brief, the row updates to "BRIEF RECEIVED"',
      '   and you get notified. Click the Drive folder link to drop in your design files.',
      '',
      '3. Work a client through the pipeline using the "IdeaCraft" menu at the top:',
      '   • Select any client row (click a cell in that row) first.',
      '   • Send Brief Form        → emails the brief link (auto-sent on enquiry too)',
      '   • Create / Open Drive Folder',
      '   • Send Preview           → paste the preview/Drive link, customer reviews',
      '   • Log Revision Request   → marks REVISIONS while you adjust',
      '   • Send Payment Link      → paste your PayFast / Yoco / Stripe link',
      '   • Mark as Paid',
      '   • Send Final Delivery    → paste the final Drive/OneDrive link',
      '',
      '4. Every action sends a branded, professional email automatically.',
      '',
      'Tip: the "Stage" column always shows where each client is.'
    ];
    help.getRange(2, 1, lines.length, 1).setValues(lines.map(l => [l]));
    help.setColumnWidth(1, 720);
  }

  return sh;
}

/* ---- Drive root folder for all client files ---- */
function getOrCreateRootFolder_() {
  let id = PROP.getProperty('ROOT_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const folder = DriveApp.createFolder('IdeaCraft — Client Files');
  PROP.setProperty('ROOT_FOLDER_ID', folder.getId());
  return folder;
}

/* ---- Brand Brief Google Form (built by code) ---- */
function getOrCreateBriefForm_() {
  let id = PROP.getProperty('BRIEF_FORM_ID');
  if (id) { try { return FormApp.openById(id); } catch (e) {} }
  const form = buildBriefForm_();           // defined in 05_Form.gs
  PROP.setProperty('BRIEF_FORM_ID', form.getId());
  PROP.setProperty('BRIEF_FORM_URL', form.getPublishedUrl());
  return form;
}

/* ---- Trigger so we react when a brief is submitted ---- */
function installFormTrigger_(form) {
  const existing = ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'onBriefSubmit');
  if (existing.length) return;              // already installed
  ScriptApp.newTrigger('onBriefSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
}

function ensureOnOpenMenu_() {
  // onOpen runs automatically; nothing to install. This is a placeholder
  // so re-running setup() is obviously complete.
  return true;
}

/* Convenience getters used across the project */
function getCrmSheet_()    { return getOrCreateSpreadsheet_().getSheetByName('Clients'); }
function getRootFolder_()  { return getOrCreateRootFolder_(); }
function getBriefFormUrl_(){ return PROP.getProperty('BRIEF_FORM_URL') || (getOrCreateBriefForm_().getPublishedUrl()); }
