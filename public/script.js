const textElement = document.getElementById("text");
const cursor = document.querySelector(".cursor");
const mainButtons = document.getElementById("main-buttons");
const categorySection = document.getElementById("category-section");
const giftOptions = document.getElementById("gift-options");
const creditCounter = document.getElementById("credit-counter");

// --- Intro lines ---
const introLines = [
  "Hey.. I made this for a reason.",
  "I know this might look simple.",
  "Just a black screen and some text.",
  "It's my Birthday present to you!",
  "It's just a little something..",
  "Happy Birthday 🎂",
  "Now... here comes the real part.",
  "Here's a bunch of options!",
  "You can pick as many as you want up to your point limit.",
  "Each button you press will be selected, until you click submit.",
  "When you click submit, it'll email me!",
  "Then, you'll get sent Google forms.",
  "You don't have to fill them out, but it helps!",
  "Anyways... if you're still reading this...",
  "Happy Birthday, Aliza!! 🎉",
  "Thanks for being a great friend."
];

// --- Gifts ---
const gifts = {
  online: {
    "Will take a while": ["Proxied Collection", "Unity Game", "Animation"],
    "Normal Time Requests": ["Custom Website", "Offline Game", "Proxied Site or Game"],
    "Short requests": ["Scratch Game", "Text Adventure Game"],
    "Other": ["other"]
  },
  physical: {
    "Will take a while": ["Book or Short Story", "Large Artwork", "Crocheted Project", "Favor"],
    "Normal Requests": ["Small art", "Gift", "Money??"],
    "Other": ["other"]
  }
};

let typingSpeed = 50;
let lineIndex = 0;
let charIndex = 0;
let typing = false;
let credits = { online: 0, physical: 0 };
let selected = [];
let currentCategory = null;
let currentSubcategory = null;

// ---- Typing intro ----
function typeLine(callback) {
  typing = true;
  cursor.style.display = "inline-block";
  const currentLine = introLines[lineIndex];
  if (charIndex < currentLine.length) {
    textElement.textContent = currentLine.substring(0, charIndex + 1);
    charIndex++;
    setTimeout(() => typeLine(callback), typingSpeed);
  } else {
    setTimeout(() => {
      if (lineIndex < introLines.length - 1) {
        charIndex = 0;
        lineIndex++;
        textElement.textContent = "";
        typeLine(callback);
      } else {
        cursor.style.display = "none";
        typing = false;
        if (callback) callback();
      }
    }, 1000);
  }
}

// ---- Category handling ----
function openCategory(type) {
  if (typing) return;
  currentCategory = type;
  mainButtons.style.display = "none";
  categorySection.style.display = "flex";
  giftOptions.innerHTML = "";
  selected = [];
  showSubcategories(type);
}

function showSubcategories(type) {
  giftOptions.innerHTML = "";
  updateCreditsDisplay();
  Object.keys(gifts[type]).forEach(sub => {
    const btn = document.createElement("button");
    btn.textContent = sub;
    btn.onclick = () => openSubcategory(sub);
    giftOptions.appendChild(btn);
  });
}

function openSubcategory(sub) {
  currentSubcategory = sub;
  giftOptions.innerHTML = "";
  selected = [];
  updateCreditsDisplay();

  gifts[currentCategory][sub].forEach(gift => {
    const btn = document.createElement("button");
    btn.textContent = gift;
    btn.onclick = () => selectGift(gift, btn);
    giftOptions.appendChild(btn);
  });

  const controls = document.createElement("div");
  controls.style.marginTop = "20px";
  controls.style.display = "flex";
  controls.style.gap = "10px";

  const backBtn = document.createElement("button");
  backBtn.textContent = "Back to Subcategories";
  backBtn.onclick = () => showSubcategories(currentCategory);

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.onclick = () => submitGifts();

  controls.appendChild(backBtn);
  controls.appendChild(submitBtn);
  giftOptions.appendChild(controls);
}

// ---- Gift selection ----
function selectGift(gift, btn) {
  if (btn.classList.contains("selected")) {
    btn.classList.remove("selected");
    selected = selected.filter(g => g !== gift);
  } else {
    btn.classList.add("selected");
    selected.push(gift);
  }
}

// ---- Update credits display ----
function updateCreditsDisplay() {
  if (!currentCategory) return;
  creditCounter.textContent = `Remaining Credits: ${credits[currentCategory]}`;
}

// ---- Submit gifts ----
function submitGifts() {
  if (!selected.length) {
    alert("Please choose at least one gift!");
    return;
  }

  // Check if enough credits
  const remaining = credits[currentCategory] - selected.length;
  if (remaining < 0) {
    alert("⚠️ Not enough credits to submit these gifts!");
    return;
  }

  // Deduct credits from server
  fetch("/spend-credit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: currentCategory,
      used: selected.length
    })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert("⚠️ Not enough credits left!");
        return;
      }

      credits[currentCategory] = data.remaining;
      updateCreditsDisplay();

      // Send gift selection to Apps Script
      const scriptURL = "https://script.google.com/macros/s/AKfycby934mOjD8EfbwO4U3wy7r5GaFmB5bMgMmycozvOtiwj7H2MrPRHjfKzwbcuEoRrgC_/exec";
      return fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify({
          selectedGifts: selected,
          category: currentCategory,
          subcategory: currentSubcategory
        }),
      });
    })
    .then(res => res.text())
    .then(() => {
      alert("🎉 Your gift choices have been sent!");
      selected = [];
      goBack();
    })
    .catch(err => {
      console.error(err);
      alert("⚠️ Something went wrong: " + err.message);
    });
}

// ---- Go back ----
function goBack() {
  categorySection.style.display = "none";
  mainButtons.style.display = "flex";
}

// ---- On load ----
window.onload = async () => {
  try {
    const res = await fetch("/credits");
    credits = await res.json();
  } catch (e) {
    console.error("Failed to fetch credits, using defaults", e);
    credits = { online: 3, physical: 1 };
  }

  console.log("Loaded credits:", credits);
  typeLine(() => {
    setTimeout(() => {
      mainButtons.style.display = "flex";
      updateCreditsDisplay();
    }, 800);
  });
};

