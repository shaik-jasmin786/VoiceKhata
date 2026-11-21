/* ==========================================================
   VoiceKhata - voice.js (backend version)
   Part A: word lists (English, Hindi, Telugu)
   Part B: the parser (sentence -> customer, item, qty, amount, type)
   Part C: microphone (Web Speech API)
   Part D: confirmation card, editing and saving (to MySQL via backend)

   Uses: fetchCustomers(), addTransaction(), formatRupees(), escapeHtml()
   from data.js, and loadDashboard() from dashboard.js.
   ========================================================== */

/* ==========================================================
   PART A: WORD LISTS
   A word ending with * matches any word that STARTS with it.
   ========================================================== */

const VOICE_LANG_KEY = "vk_voice_lang";

// Spoken number words -> numbers
const NUMBER_WORDS = {
  // English
  "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
  "seven": 7, "eight": 8, "nine": 9, "ten": 10, "twenty": 20, "thirty": 30,
  "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
  "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
  "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
  // Hindi (English letters)
  "ek": 1, "do": 2, "teen": 3, "char": 4, "chaar": 4, "paanch": 5, "panch": 5,
  "chhe": 6, "chhah": 6, "saat": 7, "aath": 8, "nau": 9, "das": 10,
  "bees": 20, "tees": 30, "chalis": 40, "pachas": 50, "saath": 60,
  "sattar": 70, "assi": 80, "nabbe": 90,
  "gyarah": 11, "barah": 12, "terah": 13, "chaudah": 14, "pandrah": 15,
  "solah": 16, "satrah": 17, "atharah": 18, "unnis": 19,
  "pachees": 25, "pacchis": 25, "paintees": 35, "pachpan": 55,
  "painsath": 65, "pachattar": 75,
  // Hindi (Devanagari)
  "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5, "छह": 6,
  "सात": 7, "आठ": 8, "नौ": 9, "दस": 10, "बीस": 20, "तीस": 30,
  "चालीस": 40, "पचास": 50, "साठ": 60, "सत्तर": 70, "अस्सी": 80, "नब्बे": 90,
  "ग्यारह": 11, "बारह": 12, "तेरह": 13, "चौदह": 14, "पंद्रह": 15, "पन्द्रह": 15,
  "सोलह": 16, "सत्रह": 17, "अठारह": 18, "उन्नीस": 19,
  "पच्चीस": 25, "पैंतीस": 35, "पचपन": 55, "पैंसठ": 65, "पचहत्तर": 75,
  // Telugu
  "ఒకటి": 1, "ఒక": 1, "రెండు": 2, "మూడు": 3, "నాలుగు": 4, "ఐదు": 5,
  "ఆరు": 6, "ఏడు": 7, "ఎనిమిది": 8, "తొమ్మిది": 9, "పది": 10,
  "ఇరవై": 20, "ముప్పై": 30, "నలభై": 40, "యాభై": 50, "అరవై": 60,
  "డెబ్బై": 70, "ఎనభై": 80, "తొంభై": 90
};

const HUNDRED_WORDS = ["hundred", "sau", "सौ", "వంద", "వందలు"];

// Words that mean the customer TOOK something on credit (udhaar)
const CREDIT_WORDS = [
  "took", "take", "taken", "bought", "buy", "credit", "udhaar", "udhar",
  "liya", "liye", "lia", "gaya", "gayi",
  "लिया", "लिये", "लिए", "ली", "गया", "उधार", "उधारी", "बाकी",
  "తీసుకున్న*", "తీసుకొన్న*", "అప్పు", "అప్పుగా", "బాకీ"
];

// Words that mean the customer PAID money
const PAYMENT_WORDS = [
  "paid", "pay", "pays", "gave", "give", "returned", "cleared", "received",
  "deposit", "deposited", "jama", "diya", "diye", "chukaya", "chukaye",
  "दिया", "दिये", "दिए", "दी", "चुकाया", "चुकाए", "जमा",
  "ఇచ్చ*", "కట్ట*", "చెల్లించ*", "జమ"
];

// Words that mean "rupees"
const CURRENCY_WORDS = [
  "rupees", "rupee", "rs", "inr", "rupaye", "rupaiye", "rupay", "rupayi",
  "रुपये", "रुपए", "रुपया", "रूपये", "रुपय",
  "రూపాయ*", "రూ"
];

// Item list: standard name -> all the ways it can be spoken
const ITEMS = {
  "Tea":     ["tea", "chai", "chay", "चाय", "चाए", "టీ", "టీలు", "చాయ్"],
  "Coffee":  ["coffee", "kapi", "कॉफी", "कॉफ़ी", "कोफी", "కాఫీ", "కాఫీలు"],
  "Samosa":  ["samosa", "समोसा", "समोसे", "సమోసా", "సమోసాలు"],
  "Biscuit": ["biscuit", "बिस्कुट", "बिस्किट", "బిస్కెట్", "బిస్కెట్లు", "బిస్కట్"],
  "Bun":     ["bun", "बन", "బన్", "బన్ను"],
  "Milk":    ["milk", "doodh", "दूध", "పాలు"],
  "Bread":   ["bread", "ब्रेड", "బ్రెడ్"],
  "Vada": ["vada", "wada", "vadai", "wadaa", "वड़ा", "वडा", "వడ", "వడలు"],
  "Idli":    ["idli", "इडली", "ఇడ్లీ", "ఇడ్లి"],
  "Water":   ["water", "pani", "पानी", "నీళ్లు", "నీరు"],
  "Jalebi":  ["jalebi", "जलेबी", "జిలేబీ", "జిలేబి"],
  "Pakora":  ["pakora", "pakoda", "पकोड़ा", "पकोड़े", "పకోడీ", "పకోడి"],
  "Dosa":    ["dosa", "dosai", "दोसा", "डोसा", "దోశ", "దోసె"],
  "Poori":   ["poori", "puri", "पूरी", "పూరీ", "పూరి"],
  "Lassi":   ["lassi", "लस्सी", "లస్సీ"],
  "Juice":   ["juice", "जूस", "జ్యూస్"],
  "Banana":  ["banana", "kela", "केला", "అరటిపండు", "అరటిపళ్లు"],
  "Egg":     ["egg", "anda", "अंडा", "अंडे", "గుడ్డు", "గుడ్లు"]
};

// Small words that are NOT customer names
const STOP_WORDS = [
  "ne", "ko", "ka", "ki", "ke", "se", "le", "de", "hai", "tha", "thi",
  "the", "a", "an", "has", "had", "have", "is", "was", "for", "of", "to",
  "from", "and", "please", "add", "entry", "payment", "today", "yesterday",
  "aaj", "kal", "he", "she", "they", "mr", "mrs", "sir", "madam", "ji", "bhai",
  "anna", "akka", "garu", "gaaru", "uncle", "aunty",
  "ने", "को", "का", "की", "के", "से", "ले", "दे", "है", "था", "थी", "आज", "कल",
  "भाई", "जी", "గారు", "అన్న", "అక్క", "ఈరోజు", "నుండి"
];

// Hindi / Telugu spellings of common names -> English spelling
const NAME_MAP = {
  "रामू": "Ramu", "राम": "Ram", "सीता": "Sita", "राजू": "Raju", "रमेश": "Ramesh",
  "రాము": "Ramu", "సీత": "Sita", "రాజు": "Raju", "సురేష్": "Suresh", "సురేశ్": "Suresh"
};

/* ==========================================================
   PART B: THE PARSER
   ========================================================== */

// Does this word match anything in the list? (handles the * rule)
function matchesWord(word, list) {
  return list.some(function (k) {
    if (k.charAt(k.length - 1) === "*") {
      return word.indexOf(k.slice(0, -1)) === 0;
    }
    return word === k;
  });
}

// Hindi and Telugu digits -> normal 0-9
function convertDigits(text) {
  return text
    .replace(/[\u0966-\u096F]/g, function (ch) { return ch.charCodeAt(0) - 0x0966; })
    .replace(/[\u0C66-\u0C6F]/g, function (ch) { return ch.charCodeAt(0) - 0x0C66; });
}

// Turns a sentence into a list of word objects.
function buildTokens(rawText) {
  let t = convertDigits(String(rawText).toLowerCase());
  t = t.replace(/₹/g, " rupees ");
  t = t.replace(/(\d),(?=\d{3})/g, "$1");
  t = t.replace(/[^\p{L}\p{M}\p{N}]+/gu, " ");
  t = t.replace(/(\d)(?=\p{L})/gu, "$1 ").replace(/(\p{L})(?=\d)/gu, "$1 ");

  const words = t.trim().split(/\s+/).filter(Boolean);
  const out = [];

  words.forEach(function (w) {
    const prev = out[out.length - 1];

    if (/^\d+$/.test(w)) {
      out.push({ text: w, num: Number(w) });

    } else if (Object.prototype.hasOwnProperty.call(NUMBER_WORDS, w)) {
      const value = NUMBER_WORDS[w];
      // "twenty five" -> 25
      if (prev && prev.fromWord && prev.num >= 20 && prev.num % 10 === 0 && value >= 1 && value <= 9) {
        prev.num += value;
      } else {
        out.push({ text: w, num: value, fromWord: true });
      }

    } else if (HUNDRED_WORDS.indexOf(w) !== -1) {
      // "two hundred" / "paanch sau" -> 200 / 500
      if (prev && prev.num !== undefined && prev.num > 0 && prev.num < 10) {
        prev.num *= 100;
      } else {
        out.push({ text: w, num: 100, fromWord: true });
      }

    } else {
      out.push({ text: w });
    }
  });
  return out;
}

// Finds the first known item in the sentence

function findItem(objs) {

    // 1. Check known items first
    for (let i = 0; i < objs.length; i++) {
        if (objs[i].num !== undefined) continue;

        const word = objs[i].text.toLowerCase();

        for (const name in ITEMS) {
            const hit = ITEMS[name].some(function (v) {
                const value = v.toLowerCase();
                const isEnglish = /^[a-z]+$/.test(value);

                return word === value ||
                    (isEnglish && (word === value + "s" || word === value + "es"));
            });

            if (hit) {
                return { name: name, index: i };
            }
        }
    }

    // 2. Find unknown items
    const ignoredWords = [
        "took", "take", "taken", "give", "gave", "get",
        "bought", "buy", "sold", "sell", "paid", "pay",
        "credit", "payment", "rupees", "rupee", "rs",
        "amount", "for", "to", "of", "the", "and",
        "please", "today", "yesterday", "add", "entry"
    ];

    const candidates = [];

    for (let i = 0; i < objs.length; i++) {
        if (objs[i].num !== undefined) continue;

        const word = objs[i].text.toLowerCase();

        if (ignoredWords.includes(word)) continue;
        if (STOP_WORDS.includes(word)) continue;
        if (matchesWord(word, CREDIT_WORDS)) continue;
        if (matchesWord(word, PAYMENT_WORDS)) continue;
        if (matchesWord(word, CURRENCY_WORDS)) continue;

        candidates.push({ text: objs[i].text, index: i });
    }

    // 3. Customer is normally first, item is last
    if (candidates.length >= 2) {
        const item = candidates[candidates.length - 1];

        return {
            name: item.text.charAt(0).toUpperCase() + item.text.slice(1),
            index: item.index
        };
    }

    return null;
}


// MAIN PARSER: sentence in, details out
function parseVoiceText(rawText, customers) {
  const objs = buildTokens(rawText);
  const result = {
    customer: "", item: "", quantity: 0, amount: null,
    type: "CREDIT", typeGuessed: false
  };

  // ---- 1. Transaction type (the LAST matching word wins) ----
  let type = null;
  objs.forEach(function (o) {
    if (o.num !== undefined) return;
    if (matchesWord(o.text, CREDIT_WORDS)) type = "CREDIT";
    else if (matchesWord(o.text, PAYMENT_WORDS)) type = "PAYMENT";
  });

  // ---- 2. Item ----
  const found = findItem(objs);
  const itemIdx = found ? found.index : -1;
  if (found) result.item = found.name;

  // ---- 3. Amount: the number next to a "rupees" word ----
  const numberIdx = [];
  objs.forEach(function (o, i) { if (o.num !== undefined) numberIdx.push(i); });

  let amountIdx = -1;
  const curIdx = objs.findIndex(function (o) {
    return o.num === undefined && matchesWord(o.text, CURRENCY_WORDS);
  });
  if (curIdx >= 0) {
    if (curIdx > 0 && objs[curIdx - 1].num !== undefined) amountIdx = curIdx - 1;
    else if (curIdx + 1 < objs.length && objs[curIdx + 1].num !== undefined) amountIdx = curIdx + 1;
  }

  // No "rupees" word? Make a sensible guess.
  if (amountIdx === -1 && numberIdx.length > 0) {
    if (found && numberIdx.length === 1) {
      if (objs[numberIdx[0]].num > 10) amountIdx = numberIdx[0];
    } else {
      amountIdx = numberIdx[numberIdx.length - 1];
    }
  }
  if (amountIdx >= 0) result.amount = objs[amountIdx].num;

  // ---- 4. Quantity: the number next to the item ----
  if (found) {
    const remaining = numberIdx.filter(function (i) { return i !== amountIdx; });
    let qtyIdx = -1;
    if (remaining.indexOf(itemIdx - 1) !== -1) qtyIdx = itemIdx - 1;
    else if (remaining.indexOf(itemIdx + 1) !== -1) qtyIdx = itemIdx + 1;
    else if (remaining.length > 0) qtyIdx = remaining[0];
    result.quantity = qtyIdx >= 0 ? objs[qtyIdx].num : 1;
  }

  // ---- 5. Type fallback ----
  if (type === null) {
    type = "CREDIT";
    result.typeGuessed = !found;
  }
  result.type = type;

  // ---- 6. Customer name: first leftover word(s) ----
  const isLeftover = function (o, i) {
    if (o.num !== undefined) return false;
    if (i === itemIdx || i === curIdx) return false;
    if (matchesWord(o.text, CREDIT_WORDS) || matchesWord(o.text, PAYMENT_WORDS)) return false;
    if (matchesWord(o.text, CURRENCY_WORDS)) return false;
    if (STOP_WORDS.indexOf(o.text) !== -1) return false;
    return true;
  };

  const start = objs.findIndex(isLeftover);
  if (start >= 0) {
    const nameWords = [objs[start].text];
    if (start + 1 < objs.length && isLeftover(objs[start + 1], start + 1)) {
      nameWords.push(objs[start + 1].text);
    }
    let name = nameWords.join(" ");
    if (NAME_MAP[name]) {
      name = NAME_MAP[name];
    } else {
      name = name.replace(/(^|\s)(\S)/g, function (m, space, ch) { return space + ch.toUpperCase(); });
    }
    // If this customer already exists, use the saved spelling
    const existing = customers.find(function (c) {
      return c.name.toLowerCase() === name.toLowerCase();
    });
    result.customer = existing ? existing.name : name;
  }

  return result;
}

/* ==========================================================
   PART C: MICROPHONE (Web Speech API)
   ========================================================== */

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

function byId(id) { return document.getElementById(id); }

function showVoiceMessage(text, type) {       // type: error, success, warning
  const box = byId("voiceMessage");
  box.textContent = text;
  box.className = "vk-alert show " + type;
}

function hideVoiceMessage() {
  const box = byId("voiceMessage");
  box.className = "vk-alert";
  box.textContent = "";
}

function setListeningUI(on) {
  isListening = on;
  byId("voiceMicBtn").classList.toggle("listening", on);
  byId("voiceStatus").textContent = on ? "Listening... speak now" : "Tap the mic and speak";
}

function stopListening() {
  if (recognition) {
    const old = recognition;
    recognition = null;
    try { old.abort(); } catch (e) { /* ignore */ }
  }
  setListeningUI(false);
}

function startListening() {
  hideVoiceMessage();

  if (!SpeechRecognitionAPI) {
    showVoiceMessage("This browser does not support voice recognition. Please use Google Chrome, or type your sentence below.", "error");
    byId("spokenText").focus();
    return;
  }

  stopListening();

  const rec = new SpeechRecognitionAPI();
  recognition = rec;
  rec.lang = byId("voiceLang").value;   // en-IN, hi-IN or te-IN
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;

  let heardSomething = false;
  let errorShown = false;

  rec.onstart = function () {
    if (rec !== recognition) return;
    setListeningUI(true);
  };

  rec.onresult = function (event) {
    if (rec !== recognition) return;
    let text = "";
    let isFinal = false;
    for (let i = 0; i < event.results.length; i++) {
      text += event.results[i][0].transcript;
      if (event.results[i].isFinal) isFinal = true;
    }
    byId("spokenText").value = text;
    if (isFinal) {
      heardSomething = true;
      handleParse(text);
    }
  };

  rec.onerror = function (event) {
    if (rec !== recognition) return;
    errorShown = true;
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      showVoiceMessage("Microphone permission denied. Click the lock icon near the web address, allow the microphone, then try again. You can also type below.", "error");
    } else if (event.error === "no-speech") {
      showVoiceMessage("Voice not recognized. Please tap the mic and speak clearly.", "error");
    } else if (event.error === "audio-capture") {
      showVoiceMessage("No microphone found. Please connect a microphone, or type below.", "error");
    } else if (event.error === "network") {
      showVoiceMessage("Voice recognition needs an internet connection. Please check your internet, or type below.", "error");
    } else if (event.error === "aborted") {
      errorShown = false;
    } else {
      showVoiceMessage("Voice problem (" + event.error + "). Please try again or type below.", "error");
    }
  };

  rec.onend = function () {
    if (rec !== recognition) return;
    setListeningUI(false);
    if (!heardSomething && !errorShown) {
      showVoiceMessage("Voice not recognized. Please tap the mic and try again.", "error");
    }
  };

  try {
    rec.start();
  } catch (e) {
    showVoiceMessage("Could not start the microphone. Please try again.", "error");
  }
}

/* ==========================================================
   PART D: CONFIRMATION CARD, EDITING AND SAVING
   ========================================================== */

// The vendor's customers, loaded from the backend when the pop-up opens
let knownCustomers = [];

// Sentence -> parse -> fill the card
function handleParse(text) {
  if (!text || !text.trim()) {
    showVoiceMessage("Nothing to understand yet. Speak, or type a sentence first.", "error");
    return;
  }
  const tx = parseVoiceText(text, knownCustomers);
  showConfirmCard(tx, true);
}

// Fills the card. If fromVoice is false, the card is empty (manual entry).
function showConfirmCard(tx, fromVoice) {
byId("fCustomer").value = tx.customer || "";
byId("fCustomer").dataset.customerId = tx.customerId || "";

byId("duplicateCustomerBox").classList.add("d-none");
byId("duplicateCustomerSelect").innerHTML =
    '<option value="">Choose customer</option>';
  byId("fItem").value = tx.item || "";
  byId("fQty").value = tx.quantity > 0 ? tx.quantity : "";
  byId("fAmount").value = tx.amount !== null ? tx.amount : "";
  byId(tx.type === "PAYMENT" ? "typePayment" : "typeCredit").checked = true;

  clearInvalid();
  updateTypeFields();
  updateCustomerHint();
  byId("confirmCard").classList.remove("d-none");

  if (!fromVoice) {
    hideVoiceMessage();
    byId("fCustomer").focus();
    return;
  }

  const problems = [];
  if (!tx.customer) {
    problems.push("Customer name not found.");
    byId("fCustomer").classList.add("is-invalid");
  }
  if (tx.amount === null) {
    problems.push("Amount missing.");
    byId("fAmount").classList.add("is-invalid");
  }
  if (tx.typeGuessed) {
    problems.push("Could not tell if this is Credit or Payment. Please check.");
  }

  if (problems.length > 0) {
    showVoiceMessage(problems.join(" ") + " Please fix below.", "warning");
  } else {
    showVoiceMessage("Please check the details below, then tap Confirm and Save.", "success");
  }
  byId("confirmCard").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function getSelectedType() {
  return document.querySelector('input[name="fType"]:checked').value;
}

// Payment has no item or quantity, so hide those boxes
function updateTypeFields() {
  const isPayment = getSelectedType() === "PAYMENT";
  byId("itemRow").classList.toggle("d-none", isPayment);
  byId("statusPreview").textContent = isPayment ? "Status: Paid" : "Status: Pending";
  byId("statusPreview").className = "ms-2 " + (isPayment ? "badge-paid" : "badge-pending");
}

// Under the name box: existing customer or new customer
function updateCustomerHint() {
    const name = byId("fCustomer").value.trim();
    const hint = byId("customerHint");
    const box = byId("duplicateCustomerBox");
    const select = byId("duplicateCustomerSelect");

    byId("fCustomer").dataset.customerId = "";

    box.classList.add("d-none");
    select.innerHTML = '<option value="">Choose customer</option>';

    if (!name) {
        hint.textContent = "";
        return;
    }

    const matches = knownCustomers.filter(function (c) {
        return c.name.toLowerCase() === name.toLowerCase();
    });

    if (matches.length === 0) {
        hint.textContent = "New customer • will be added to your khata";
    }
    else if (matches.length === 1) {
        hint.textContent = "Existing customer • " + (matches[0].phone || "No phone number");
        byId("fCustomer").dataset.customerId = matches[0].id;
    }
    else {
        hint.textContent = "⚠ Multiple customers found. Select the correct customer.";
        hint.style.color = "#dc3545";
hint.style.fontWeight = "700";
hint.style.backgroundColor = "#fff0f0";
hint.style.padding = "8px 12px";
hint.style.borderRadius = "8px";
hint.style.border = "1px solid #f5b5b5";
        box.classList.remove("d-none");

        matches.forEach(function (c) {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = c.name + " • " +
                (c.phone || "No phone") + " • ID: " + c.id;
            select.appendChild(option);
        });
    }
}
function clearInvalid() {
  ["fCustomer", "fAmount", "fQty"].forEach(function (id) {
    byId(id).classList.remove("is-invalid");
  });
}

// Reads whatever is in the card (after the vendor's edits)
function readConfirmCard() {
    const type = getSelectedType();
    const customerName = byId("fCustomer").value.trim();
    const customerId = byId("fCustomer").dataset.customerId;

    const matchingCustomers = knownCustomers.filter(function (c) {
        return c.name.toLowerCase() === customerName.toLowerCase();
    });

    let selectedCustomerId = null;

    if (customerId) {
        selectedCustomerId = Number(customerId);
    }
    else if (matchingCustomers.length === 1) {
        selectedCustomerId = matchingCustomers[0].id;
    }

    return {
        customer: customerName,
        customerId: selectedCustomerId,
        type: type,
        item: type === "PAYMENT" ? "" : byId("fItem").value.trim(),
        quantity: type === "PAYMENT" ? 0 : Number(byId("fQty").value) || 0,
        amount: Number(byId("fAmount").value)
    };
}

// Saves the transaction in MySQL through the backend
async function saveVoiceTransaction() {
 const tx = readConfirmCard();
 
  clearInvalid();
  const problems = [];

if (!tx.customer) {
    problems.push("Customer name is missing.");
    byId("fCustomer").classList.add("is-invalid");
} else {
    const matchingCustomers = knownCustomers.filter(function (c) {
        return c.name.toLowerCase() === tx.customer.toLowerCase();
    });

    if (matchingCustomers.length > 1 && !tx.customerId) {
        problems.push("Multiple customers have this name. Please select the correct customer before saving.");
        byId("fCustomer").classList.add("is-invalid");
    }
}
  if (!tx.amount || tx.amount <= 0) {
    problems.push("Amount is missing. Enter an amount above 0.");
    byId("fAmount").classList.add("is-invalid");
  }
  if (tx.type === "CREDIT" && tx.item && tx.quantity < 1) {
    problems.push("Quantity must be at least 1.");
    byId("fQty").classList.add("is-invalid");
  }

  if (problems.length > 0) {
    showVoiceMessage(problems.join(" "), "error");
    return;
  }

  try {
    await addTransaction(tx);                      // from data.js -> backend -> MySQL
  } catch (e) {
    showVoiceMessage(e.message, "error");
    return;
  }

  bootstrap.Modal.getInstance(byId("voiceModal")).hide();

  const what = tx.type === "PAYMENT" ? "Payment of " : "Credit of ";
  showSaveToast("Saved! " + what + formatRupees(tx.amount) + " for " + tx.customer + ".");

  // Refresh the dashboard numbers and recent list
  if (typeof loadDashboard === "function") loadDashboard();
}

function showSaveToast(text) {
  const toastEl = byId("saveToast");
  if (!toastEl) return;
  byId("saveToastText").textContent = text;
  bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3500 }).show();
}

// Clears the pop-up before each use and loads customers from the backend
function resetVoiceModal() {
  byId("spokenText").value = "";
  byId("confirmCard").classList.add("d-none");
  hideVoiceMessage();
  clearInvalid();
  knownCustomers = [];
  byId("customerList").innerHTML = "";

  byId("fCustomer").dataset.customerId = "";
byId("duplicateCustomerBox").classList.add("d-none");
byId("duplicateCustomerSelect").innerHTML = '<option value="">Choose customer</option>';

  fetchCustomers().then(function (list) {
    knownCustomers = list;
    byId("customerList").innerHTML = list.map(function (c) {
      return '<option value="' + escapeHtml(c.name) + '"></option>';
    }).join("");
  }).catch(function () { /* ignore: typing still works */ });
}

/* ==========================================================
   PAGE SETUP
   ========================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const modalEl = byId("voiceModal");
  if (!modalEl) return;                            // this page has no voice pop-up

  const voiceModal = new bootstrap.Modal(modalEl);
  const langSelect = byId("voiceLang");

  // Remember the language the vendor used last time
  langSelect.value = localStorage.getItem(VOICE_LANG_KEY) || "en-IN";

  // Big dashboard mic: open pop-up and start listening right away
  byId("micButton").addEventListener("click", function () {
    resetVoiceModal();
    voiceModal.show();
    startListening();
  });

  // Small mic inside the pop-up: start / stop
  byId("voiceMicBtn").addEventListener("click", function () {
    if (isListening) stopListening();
    else startListening();
  });

  // Language changed: remember it and listen again in the new language
  langSelect.addEventListener("change", function () {
    localStorage.setItem(VOICE_LANG_KEY, langSelect.value);
    if (isListening) startListening();
  });

  // "Understand this" button (works for typed sentences too)
  byId("parseBtn").addEventListener("click", function () {
    stopListening();
    handleParse(byId("spokenText").value);
  });

  // Manual entry: show an empty confirmation card
  byId("manualBtn").addEventListener("click", function () {
    stopListening();
    showConfirmCard({ customer: "", item: "", quantity: 0, amount: null, type: "CREDIT" }, false);
  });

  // Live updates inside the confirmation card
  document.querySelectorAll('input[name="fType"]').forEach(function (r) {
    r.addEventListener("change", updateTypeFields);
  });
  byId("fCustomer").addEventListener("input", function () {
    byId("fCustomer").classList.remove("is-invalid");
    updateCustomerHint();
  });
  byId("fCustomer").addEventListener("input", function () {
    byId("fCustomer").classList.remove("is-invalid");
    updateCustomerHint();
});

// PASTE NEW CODE HERE 👇
byId("duplicateCustomerSelect").addEventListener("change", function () {
    const selectedId = this.value;

    byId("fCustomer").dataset.customerId = selectedId || "";

    const customer = knownCustomers.find(function (c) {
        return String(c.id) === String(selectedId);
    });

    if (customer) {
        byId("customerHint").textContent =
            "Selected customer • " +
            (customer.phone || "No phone number") +
            " • ID " + customer.id;

        byId("fCustomer").classList.remove("is-invalid");
    }
});
  byId("fAmount").addEventListener("input", function () { byId("fAmount").classList.remove("is-invalid"); });
  byId("fQty").addEventListener("input", function () { byId("fQty").classList.remove("is-invalid"); });

  byId("saveBtn").addEventListener("click", saveVoiceTransaction);

  // Closing the pop-up always switches the microphone off
  modalEl.addEventListener("hidden.bs.modal", stopListening);
});