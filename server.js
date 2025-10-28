const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

// --- Path to store credits ---
const CREDIT_FILE = "./credits.json";

// --- Initialize credits file if it doesn't exist ---
if (!fs.existsSync(CREDIT_FILE)) {
  fs.writeFileSync(CREDIT_FILE, JSON.stringify({ online: 3, physical: 1 }, null, 2));
}

// --- Helper functions ---
function readCredits() {
  return JSON.parse(fs.readFileSync(CREDIT_FILE, "utf8"));
}

function writeCredits(credits) {
  fs.writeFileSync(CREDIT_FILE, JSON.stringify(credits, null, 2));
}

// --- Get current credits ---
app.get("/credits", (req, res) => {
  const credits = readCredits();
  res.json(credits);
});

// --- Spend credits (only after submit) ---
app.post("/spend-credit", (req, res) => {
  const { category, used } = req.body;

  if (!["online", "physical"].includes(category)) {
    return res.status(400).json({ success: false, message: "Invalid category" });
  }

  const credits = readCredits();
  const available = credits[category] ?? 0;

  if (used <= 0) {
    return res.status(400).json({ success: false, message: "Invalid number of credits used" });
  }

  if (available < used) {
    return res.json({ success: false, message: "Not enough credits", remaining: available });
  }

  credits[category] = available - used;
  writeCredits(credits);

  res.json({ success: true, remaining: credits[category] });
});

// --- Handle gift submissions (optional logging) ---
app.post("/send-gifts", (req, res) => {
  const { selectedGifts, category, subcategory } = req.body;

  if (!selectedGifts || !Array.isArray(selectedGifts)) {
    return res.status(400).send("Invalid gift selection data.");
  }

  console.log("🎁 Gift submission received:");
  console.log("- Category:", category);
  console.log("- Subcategory:", subcategory);
  console.log("- Selected Gifts:", selectedGifts);

  res.send("✅ Gift selection received!");
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🎁 Server running on port ${PORT}`));
