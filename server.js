const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Replace with your Gmail credentials (use an App Password if 2FA is on)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "poukade@cassiaschools.org",
    pass: "Books@recool13"
  }
});

app.post("/send-gifts", (req, res) => {
  const { selectedGifts, category, subcategory } = req.body;

  // Email to you
  const mailToYou = {
    from: "poukade@cassiaschools.org",
    to: "poukade@cassiaschools.org",
    subject: `Aliza's Gift Selection`,
    text: `Category: ${category}\nSubcategory: ${subcategory}\nSelected Gifts:\n${selectedGifts.join("\n")}`
  };

  // Email to her
  const mailToHer = {
    from: "poukade@cassiaschools.org",
    to: "rosaliza@cassiaschools.org",
    subject: `Your Gift Form`,
    text: `Hi Aliza!\n\nThanks for selecting your gifts!\nPlease fill out this form: https://forms.gle/example123`
  };

  transporter.sendMail(mailToYou, (err, info) => {
    if (err) return res.status(500).send(err.toString());
    transporter.sendMail(mailToHer, (err2, info2) => {
      if (err2) return res.status(500).send(err2.toString());
      res.send("Emails sent successfully!");
    });
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
