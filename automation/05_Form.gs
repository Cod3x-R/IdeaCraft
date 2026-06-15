/**
 * ============================================================
 *  IdeaCraft — Automation Engine
 *  05_Form.gs  →  Builds the Brand Brief Google Form by code,
 *                 and reacts when a client submits it.
 * ============================================================
 */

/** Builds the full Brand Brief form. Called once by setup(). */
function buildBriefForm_() {
  const form = FormApp.create('IdeaCraft — Brand Brief')
    .setTitle('IdeaCraft — Brand Brief')
    .setDescription(
      'Welcome aboard! 🎉 This short brief tells us everything we need to design a brand ' +
      'you’ll love. Take your time — the more detail you give, the closer the first draft will be. ' +
      'Most people finish in 5–8 minutes.')
    .setConfirmationMessage(
      'Brief received — thank you! 🙌 Our team is now on it. You’ll get your first preview soon. ' +
      '— The IdeaCraft Studio')
    .setCollectEmail(true)
    .setProgressBar(true)
    .setShowLinkToRespondAgain(false)
    .setAllowResponseEdits(true);

  /* —— Section 1: About you & your business —— */
  form.addSectionHeaderItem()
    .setTitle('1 · About You & Your Business')
    .setHelpText('So we can address you properly and match the work to your enquiry.');

  form.addTextItem().setTitle('Your full name').setRequired(true);
  form.addTextItem().setTitle('Business / brand name').setRequired(true);
  form.addTextItem().setTitle('Best contact number (WhatsApp preferred)').setRequired(true);

  form.addListItem()
    .setTitle('Which package are you going with?')
    .setChoiceValues([
      'Starter — R2,500', 'Gold Startup — R6,500', 'Platinum Launch — R11,500',
      'Social Boost — R2,000/mo', 'Brand Refresh — R3,800', 'Website Only',
      'Custom Package', 'Not sure yet — advise me'
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('In one or two sentences, what does your business do?')
    .setHelpText('Imagine explaining it to a friend.')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Who are your ideal customers?')
    .setHelpText('Age, location, interests, the kind of person who buys from you.')
    .setRequired(true);

  form.addTextItem()
    .setTitle('Do you have a slogan or tagline? (optional)')
    .setHelpText('Leave blank if not — we can suggest one.');

  /* —— Section 2: Look & feel —— */
  form.addPageBreakItem()
    .setTitle('2 · The Look & Feel')
    .setHelpText('This is the heart of the brief — how your brand should feel.');

  form.addCheckboxItem()
    .setTitle('Pick the words that should describe your brand')
    .setHelpText('Choose 3–5 that feel right.')
    .setChoiceValues([
      'Modern', 'Minimal', 'Bold', 'Playful', 'Elegant', 'Luxury',
      'Friendly', 'Professional', 'Earthy / Natural', 'Techy', 'Vintage / Retro',
      'Youthful', 'Trustworthy', 'Energetic', 'Calm'
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Preferred colours')
    .setHelpText('Describe them or paste hex codes (e.g. #12C774). Say "you choose" if unsure.')
    .setRequired(true);

  form.addTextItem()
    .setTitle('Any colours to AVOID? (optional)');

  form.addListItem()
    .setTitle('Font / lettering style you lean toward')
    .setChoiceValues([
      'Clean & modern (sans-serif)', 'Classic & refined (serif)',
      'Handwritten / script', 'Bold & chunky', 'No preference — you decide'
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Brands or designs you admire')
    .setHelpText('Paste links or names (logos, websites, Instagram pages). Great for direction.');

  /* —— Section 3: Assets & content —— */
  form.addPageBreakItem()
    .setTitle('3 · Your Assets & Content')
    .setHelpText('Anything you already have. All optional — skip what doesn’t apply.');

  // File uploads (requires the form owner's Drive — works automatically).
  try {
    form.addFileUploadItem()
      .setTitle('Existing logo or brand files (if any)')
      .setHelpText('Upload current logos, photos, or files you want us to use.');
  } catch (e) { /* file upload may be blocked on some Workspace policies */ }

  form.addParagraphTextItem()
    .setTitle('Website / landing page content (if your package includes a site)')
    .setHelpText('Headline ideas, “about” text, services, contact info — rough is fine.');

  form.addParagraphTextItem()
    .setTitle('Social media handles & links')
    .setHelpText('Facebook, Instagram, TikTok, YouTube, website — paste what you have.');

  /* —— Section 4: Logistics —— */
  form.addPageBreakItem()
    .setTitle('4 · Final Details');

  form.addTextItem()
    .setTitle('Is there a deadline or launch date we should aim for? (optional)');

  form.addParagraphTextItem()
    .setTitle('Anything else we should know?')
    .setHelpText('Dreams, must-haves, things to avoid — the floor is yours.');

  // Lock acceptance
  form.addCheckboxItem()
    .setTitle('Ready to create something great?')
    .setChoiceValues(['Yes — let’s build my brand! 🚀'])
    .setRequired(true);

  return form;
}

/**
 * Installable trigger handler — fires when a client submits the brief.
 * Matches them to their CRM row by email and advances the stage.
 */
function onBriefSubmit(e) {
  try {
    const resp = e.response;
    const email = (resp.getRespondentEmail() || '').trim();
    const answers = {};
    resp.getItemResponses().forEach(ir => {
      answers[ir.getItem().getTitle()] = ir.getResponse();
    });
    const editUrl = resp.getEditResponseUrl();

    const sh = getCrmSheet_();
    const row = findRowByEmail_(sh, email) || findRowByEmail_(sh, answers['Business / brand name']);

    if (row) {
      setCell_(row, 'Stage', CONFIG.STAGES.BRIEF_IN);
      setCell_(row, 'Brief Received', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'));
      setCell_(row, 'Last Action', 'Brand brief submitted');
      appendNote_(row, 'Brief responses: ' + editUrl);
    }

    notifyOwnerBriefIn_({
      email: email,
      name: answers['Your full name'] || '',
      business: answers['Business / brand name'] || '',
      package: answers['Which package are you going with?'] || '',
      editUrl: editUrl,
      answers: answers
    });
  } catch (err) {
    Logger.log('onBriefSubmit error: ' + err);
  }
}

function findRowByEmail_(sh, value) {
  if (!value) return null;
  const last = sh.getLastRow();
  if (last < 2) return null;
  const emails = sh.getRange(2, colIndex_('Email'), last - 1, 1).getValues();
  const v = String(value).toLowerCase().trim();
  for (let i = emails.length - 1; i >= 0; i--) {           // newest match wins
    if (String(emails[i][0]).toLowerCase().trim() === v) return i + 2;
  }
  return null;
}
