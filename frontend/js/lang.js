/* ==========================================================
   VoiceKhata - lang.js
   Translates the Dashboard, Customers and Transactions pages
   (and the voice pop-up) into Hindi and Telugu.

   How it works: it finds English texts on the page and swaps
   them with the Hindi / Telugu text from the lists below.
   It also translates texts that other scripts add later
   (for example the transaction rows).

   To add a new translation, add one line inside "exact".
   ========================================================== */

(function () {

  const LANG_KEY = "vk_page_lang";              // en, hi or te (same key as landing page)
  const VOICE_KEY = "vk_voice_lang";
  const VOICE_CODES = { en: "en-IN", hi: "hi-IN", te: "te-IN" };

  const TEXTS = {

    /* ------------------------- HINDI ------------------------- */
    hi: {
      exact: {
        // menu
        "Dashboard": "डैशबोर्ड",
        "Customers": "ग्राहक",
        "Transactions": "लेन-देन",
        "Logout": "लॉगआउट",

        // dashboard
        "Welcome!": "स्वागत है!",
        "Here is your khata summary for today.": "आज का आपका खाता सारांश।",
        "Pending Dues": "बकाया रकम",
        "Money to collect": "वसूल करने की रकम",
        "Total Customers": "कुल ग्राहक",
        "In your khata": "आपके खाते में",
        "This Month": "इस महीने",
        "transactions": "लेन-देन",
        "Tap & Speak": "टैप करें और बोलें",
        "Say: \"Ramu took 2 tea, 20 rupees\"": "कहें: \"रामू ने 2 चाय ली, 20 रुपये\"",
        "Recent Transactions": "हाल के लेन-देन",
        "View all": "सभी देखें",
        "No transactions yet. Tap the mic to add one!": "अभी कोई लेन-देन नहीं। माइक दबाकर जोड़ें!",

        // voice pop-up
        "Voice Entry": "आवाज़ से एंट्री",
        "1. Choose your language": "1. अपनी भाषा चुनें",
        "Tap the mic and speak": "माइक दबाएँ और बोलें",
        "Listening... speak now": "सुन रहा हूँ... अब बोलें",
        "2. What we heard (you can edit or type here)": "2. हमने यह सुना (आप बदल या टाइप कर सकते हैं)",
        "Understand this": "समझें",
        "Voice not working? Enter details manually": "आवाज़ काम नहीं कर रही? हाथ से जानकारी भरें",
        "3. Check and confirm": "3. जाँचें और पुष्टि करें",
        "Customer name": "ग्राहक का नाम",
        "Type": "प्रकार",
        "Credit (took)": "उधार (लिया)",
        "Payment (paid)": "भुगतान (दिया)",
        "Status: Pending": "स्थिति: बाकी",
        "Status: Paid": "स्थिति: चुकाया",
        "Item": "सामान",
        "Qty": "मात्रा",
        "Amount (₹)": "रकम (₹)",
        "Cancel": "रद्द करें",
        "Confirm and Save": "पुष्टि करें और सेव करें",

        // shared words and badges
        "Pending": "बाकी",
        "Paid": "चुकाया",
        "Credit given": "उधार दिया",
        "Payment received": "भुगतान मिला",
        "Credit": "उधार",
        "Payment": "भुगतान",
        "All": "सभी",
        "Loading...": "लोड हो रहा है...",
        "Save": "सेव करें",

        // customers page
        "My Customers": "मेरे ग्राहक",
        "Add Customer": "ग्राहक जोड़ें",
        "Search customer name...": "ग्राहक का नाम खोजें...",
        "Send Reminder": "रिमाइंडर भेजें",
        "Nothing pending": "कुछ बाकी नहीं",
        "All paid": "सब चुकता",
        "Advance paid": "एडवांस दिया",
        "No phone number": "फ़ोन नंबर नहीं",
        "Edit": "बदलें",
        "Add phone": "फ़ोन जोड़ें",
        "No customers found.": "कोई ग्राहक नहीं मिला।",
        "Edit Phone Number": "फ़ोन नंबर बदलें",
        "WhatsApp / phone number": "व्हाट्सऐप / फ़ोन नंबर",
        "Needed to send WhatsApp reminders.": "WhatsApp रिमाइंडर भेजने के लिए ज़रूरी।",

        // transactions page
        "Transaction History": "लेन-देन का इतिहास",
        "Customer": "ग्राहक",
        "Amount": "रकम",
        "Date": "तारीख",
        "Status": "स्थिति",
        "Actions": "कार्य",
        "No transactions found for this filter.": "इस फ़िल्टर के लिए कोई लेन-देन नहीं।",
        "Edit Transaction": "लेन-देन बदलें",
        "Save Changes": "बदलाव सेव करें",
        "Delete this entry?": "यह एंट्री हटाएँ?",
        "No, keep it": "नहीं, रहने दें",
        "Yes, delete": "हाँ, हटाएँ"
      },
      rules: [
        [/^Welcome, (.+)!$/, "स्वागत है, $1!"],
        [/^(\d+) customers$/, "$1 ग्राहक"],
        [/^(₹[\d,.]+) to collect$/, "$1 वसूलना है"],
        [/^(₹[\d,.]+) credit$/, "$1 उधार"],
        [/^(₹[\d,.]+) received$/, "$1 प्राप्त"],
        [/^Showing (\d+) of (\d+) transactions$/, "$2 में से $1 लेन-देन दिखाए जा रहे हैं"]
      ]
    },

    /* ------------------------- TELUGU ------------------------- */
    te: {
      exact: {
        // menu
        "Dashboard": "డాష్‌బోర్డ్",
        "Customers": "కస్టమర్లు",
        "Transactions": "లావాదేవీలు",
        "Logout": "లాగ్ అవుట్",

        // dashboard
        "Welcome!": "స్వాగతం!",
        "Here is your khata summary for today.": "ఈరోజు మీ ఖాతా సారాంశం.",
        "Pending Dues": "బాకీ మొత్తం",
        "Money to collect": "వసూలు చేయాల్సిన మొత్తం",
        "Total Customers": "మొత్తం కస్టమర్లు",
        "In your khata": "మీ ఖాతాలో",
        "This Month": "ఈ నెల",
        "transactions": "లావాదేవీలు",
        "Tap & Speak": "నొక్కి మాట్లాడండి",
        "Say: \"Ramu took 2 tea, 20 rupees\"": "చెప్పండి: \"రాము 2 టీ తీసుకున్నాడు, 20 రూపాయలు\"",
        "Recent Transactions": "ఇటీవలి లావాదేవీలు",
        "View all": "అన్నీ చూడండి",
        "No transactions yet. Tap the mic to add one!": "ఇంకా లావాదేవీలు లేవు. మైక్ నొక్కి జోడించండి!",

        // voice pop-up
        "Voice Entry": "వాయిస్ ఎంట్రీ",
        "1. Choose your language": "1. మీ భాషను ఎంచుకోండి",
        "Tap the mic and speak": "మైక్ నొక్కి మాట్లాడండి",
        "Listening... speak now": "వింటున్నాను... ఇప్పుడు మాట్లాడండి",
        "2. What we heard (you can edit or type here)": "2. మేము విన్నది (మీరు మార్చవచ్చు లేదా టైప్ చేయవచ్చు)",
        "Understand this": "అర్థం చేసుకోండి",
        "Voice not working? Enter details manually": "వాయిస్ పనిచేయడం లేదా? వివరాలను చేతితో నమోదు చేయండి",
        "3. Check and confirm": "3. సరిచూసి నిర్ధారించండి",
        "Customer name": "కస్టమర్ పేరు",
        "Type": "రకం",
        "Credit (took)": "అప్పు (తీసుకున్నారు)",
        "Payment (paid)": "చెల్లింపు (ఇచ్చారు)",
        "Status: Pending": "స్థితి: బాకీ",
        "Status: Paid": "స్థితి: చెల్లించారు",
        "Item": "వస్తువు",
        "Qty": "సంఖ్య",
        "Amount (₹)": "మొత్తం (₹)",
        "Cancel": "రద్దు",
        "Confirm and Save": "నిర్ధారించి సేవ్ చేయండి",

        // shared words and badges
        "Pending": "బాకీ",
        "Paid": "చెల్లించారు",
        "Credit given": "అప్పు ఇచ్చారు",
        "Payment received": "చెల్లింపు అందింది",
        "Credit": "అప్పు",
        "Payment": "చెల్లింపు",
        "All": "అన్నీ",
        "Loading...": "లోడ్ అవుతోంది...",
        "Save": "సేవ్ చేయండి",

        // customers page
        "My Customers": "నా కస్టమర్లు",
        "Add Customer": "కస్టమర్‌ను చేర్చండి",
        "Search customer name...": "కస్టమర్ పేరు వెతకండి...",
        "Send Reminder": "రిమైండర్ పంపండి",
        "Nothing pending": "ఏమీ బాకీ లేదు",
        "All paid": "అన్నీ చెల్లించారు",
        "Advance paid": "అడ్వాన్స్ చెల్లించారు",
        "No phone number": "ఫోన్ నంబర్ లేదు",
        "Edit": "మార్చు",
        "Add phone": "ఫోన్ జోడించండి",
        "No customers found.": "కస్టమర్లు కనబడలేదు.",
        "Edit Phone Number": "ఫోన్ నంబర్ మార్చండి",
        "WhatsApp / phone number": "వాట్సాప్ / ఫోన్ నంబర్",
        "Needed to send WhatsApp reminders.": "వాట్సాప్ రిమైండర్లు పంపడానికి అవసరం.",

        // transactions page
        "Transaction History": "లావాదేవీల చరిత్ర",
        "Customer": "కస్టమర్",
        "Amount": "మొత్తం",
        "Date": "తేదీ",
        "Status": "స్థితి",
        "Actions": "చర్యలు",
        "No transactions found for this filter.": "ఈ ఫిల్టర్‌కు లావాదేవీలు లేవు.",
        "Edit Transaction": "లావాదేవీని మార్చండి",
        "Save Changes": "మార్పులను సేవ్ చేయండి",
        "Delete this entry?": "ఈ ఎంట్రీని తొలగించాలా?",
        "No, keep it": "వద్దు, ఉంచండి",
        "Yes, delete": "అవును, తొలగించండి"
      },
      rules: [
        [/^Welcome, (.+)!$/, "స్వాగతం, $1!"],
        [/^(\d+) customers$/, "$1 కస్టమర్లు"],
        [/^(₹[\d,.]+) to collect$/, "$1 వసూలు చేయాలి"],
        [/^(₹[\d,.]+) credit$/, "$1 అప్పు"],
        [/^(₹[\d,.]+) received$/, "$1 అందాయి"],
        [/^Showing (\d+) of (\d+) transactions$/, "$2 లో $1 లావాదేవీలు చూపిస్తున్నాం"]
      ]
    }
  };

  let current = "en";
  const originals = new WeakMap();      // text node -> its English text
  let observer = null;

  /* ---------- translating one piece of text ---------- */

  function translatePart(text, dict) {
    if (Object.prototype.hasOwnProperty.call(dict.exact, text)) return dict.exact[text];
    for (let i = 0; i < dict.rules.length; i++) {
      if (dict.rules[i][0].test(text)) return text.replace(dict.rules[i][0], dict.rules[i][1]);
    }
    return null;
  }

  // Handles "Payment received • 18 Nov 2026" by translating each part
  function translateString(text, lang) {
    const dict = TEXTS[lang];
    const whole = translatePart(text, dict);
    if (whole !== null) return whole;

    if (text.indexOf(" • ") !== -1) {
      let changed = false;
      const parts = text.split(" • ").map(function (p) {
        const r = translatePart(p, dict);
        if (r !== null) { changed = true; return r; }
        return p;
      });
      return changed ? parts.join(" • ") : null;
    }
    return null;
  }

  function translateNode(node) {
    const orig = originals.has(node) ? originals.get(node) : node.nodeValue;
    if (!/\S/.test(orig)) return;

    if (current === "en") {
      if (originals.has(node)) node.nodeValue = orig;
      return;
    }

    const lead = orig.match(/^\s*/)[0];
    const trail = orig.match(/\s*$/)[0];
    const core = orig.trim().replace(/\s+/g, " ");
    const out = translateString(core, current);

    if (out !== null) {
      originals.set(node, orig);
      node.nodeValue = lead + out + trail;
    } else if (originals.has(node)) {
      node.nodeValue = orig;
    }
  }

  function walk(root) {
    if (root.nodeType === 3) { translateNode(root); return; }
    if (root.nodeType !== 1) return;
    const tag = root.tagName;
    if (tag === "SCRIPT" || tag === "STYLE") return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const p = n.parentNode ? n.parentNode.tagName : "";
      if (p === "SCRIPT" || p === "STYLE") continue;
      translateNode(n);
    }
  }

  // Placeholders (like the search box)
  function translatePlaceholders() {
    document.querySelectorAll("[placeholder]").forEach(function (el) {
      if (!el.dataset.enPlaceholder) el.dataset.enPlaceholder = el.getAttribute("placeholder");
      const en = el.dataset.enPlaceholder;
      const out = current === "en" ? null : translateString(en, current);
      el.setAttribute("placeholder", out !== null ? out : en);
    });
  }

  /* ---------- watching for texts added by other scripts ---------- */

  function pauseObserver(fn) {
    observer.disconnect();
    fn();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function startObserver() {
    observer = new MutationObserver(function (records) {
      pauseObserver(function () {
        records.forEach(function (r) {
          r.addedNodes.forEach(function (node) { walk(node); });
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- changing the language ---------- */

  function setLanguage(lang) {
    current = lang;
    localStorage.setItem(LANG_KEY, lang);
    localStorage.setItem(VOICE_KEY, VOICE_CODES[lang]);

    // Keep the voice pop-up dropdown in step
    const voiceSelect = document.getElementById("voiceLang");
    if (voiceSelect) voiceSelect.value = VOICE_CODES[lang];

    document.documentElement.lang = lang;
    pauseObserver(function () {
      walk(document.body);
      translatePlaceholders();
    });
  }

  /* ---------- the language dropdown in the menu bar ---------- */

  function addSwitcher() {
    const nav = document.querySelector(".navbar-nav");
    if (!nav) return;

    const li = document.createElement("li");
    li.className = "nav-item ms-md-2 mt-2 mt-md-0";
    li.innerHTML =
      '<select id="pageLang" class="form-select form-select-sm" aria-label="Language" style="min-width:110px">' +
        '<option value="en">English</option>' +
        '<option value="hi">हिन्दी</option>' +
        '<option value="te">తెలుగు</option>' +
      "</select>";
    nav.appendChild(li);

    const select = li.querySelector("select");
    select.value = current;
    select.addEventListener("change", function () { setLanguage(select.value); });
  }

  function start() {
    const saved = localStorage.getItem(LANG_KEY);
    current = (saved === "hi" || saved === "te") ? saved : "en";

    addSwitcher();
    startObserver();
    setLanguage(current);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();