const textElement = document.getElementById("text");
const cursor = document.querySelector(".cursor");
const mainButtons = document.getElementById("main-buttons");
const categorySection = document.getElementById("category-section");
const giftOptions = document.getElementById("gift-options");
const creditCounter = document.getElementById("credit-counter");

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

// Gifts with subcategories
const gifts = {
  online: {
    "Will take a while": ["Custom Wallpaper", "Animated Background", "Profile Banner", "Emoji Pack"],
    "Normal Time Requests": ["Personalized Playlist", "Digital Art", "Custom Avatar", "Story Illustration"],
    "Short requests": ["Funny Video Compilation", "Online Puzzle Challenge", "Meme Pack", "Mini Game Pass"],
    "Other": ["Online Course Voucher", "E-book Bundle", "Tutorial Access", "Language App Subscription"]
  },
  physical: {
    "Will take a while": ["Bracelet", "Drawing", "Letter", "Friendship Keychain"],
    "Normal Requests": ["Plushie", "Snack Box", "Fun Socks", "Mug"],
    "Other": ["Mystery Box", "Gift Card", "Decorative Item", "Sticker Pack"]
  }
};

let typingSpeed = 30;
let lineIndex = 0;
let charIndex = 0;
let typing = false;
const credits = { online: 4, physical: 2 };
let selected = [];
let currentCategory = null;
let currentSubcategory = null;

// ---- Typing intro ----
function typeLine(callback) {
  typing = true;
  cursor.style.display = "inline-block";
  const currentLine = introLines[lineIndex];
  if(charIndex < currentLine.length){
    textElement.textContent = currentLine.substring(0,charIndex+1);
    charIndex++;
    setTimeout(()=>typeLine(callback),typingSpeed);
  } else {
    setTimeout(()=>{
      if(lineIndex<introLines.length-1){
        charIndex=0; lineIndex++; textElement.textContent="";
        typeLine(callback);
      } else {
        cursor.style.display="none";
        typing=false;
        if(callback) callback();
      }
    },1000);
  }
}

// ---- Category handling ----
function openCategory(type){
  if(typing) return;
  currentCategory=type;
  mainButtons.style.display="none";
  categorySection.style.display="flex";
  giftOptions.innerHTML="";
  selected=[];
  showSubcategories(type);
}

function showSubcategories(type){
  giftOptions.innerHTML="";
  credits[type]=type==='online'?4:2;
  updateCredits(type);
  Object.keys(gifts[type]).forEach(sub=>{
    const btn=document.createElement("button");
    btn.textContent=sub;
    btn.onclick=()=>openSubcategory(sub);
    giftOptions.appendChild(btn);
  });
}

function openSubcategory(sub){
  currentSubcategory=sub;
  giftOptions.innerHTML="";
  updateCredits(currentCategory);
  gifts[currentCategory][sub].forEach(gift=>{
    const btn=document.createElement("button");
    btn.textContent=gift;
    btn.onclick=()=>selectGift(gift,currentCategory,btn);
    giftOptions.appendChild(btn);
  });
  const controls=document.createElement("div");
  controls.style.marginTop="20px";
  controls.style.display="flex";
  controls.style.gap="10px";
  const backBtn=document.createElement("button");
  backBtn.textContent="Back to Subcategories";
  backBtn.onclick=()=>showSubcategories(currentCategory);
  const submitBtn=document.createElement("button");
  submitBtn.textContent="Submit";
  submitBtn.onclick=()=>submitGifts();
  controls.appendChild(backBtn); controls.appendChild(submitBtn);
  giftOptions.appendChild(controls);
}

function selectGift(gift,type,btn){
  if(btn.classList.contains("selected")){
    btn.classList.remove("selected"); credits[type]++; selected=selected.filter(g=>g!==gift);
  } else {
    if(credits[type]>0){ btn.classList.add("selected"); credits[type]--; selected.push(gift);
    } else { alert("No credits left!"); }
  }
  updateCredits(type);
}

function updateCredits(type){
  creditCounter.textContent=`Remaining Credits: ${credits[type]}`;
}

function goBack(){ categorySection.style.display="none"; mainButtons.style.display="flex"; }

// ---- Submit gifts: call backend ----
function submitGifts(){
  if(selected.length===0){ alert("You haven't selected any gifts!"); return; }

  fetch("http://localhost:3000/send-gifts",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ selectedGifts:selected, category:currentCategory, subcategory:currentSubcategory })
  })
    .then(res=>res.text())
    .then(msg=>alert(msg))
    .catch(err=>alert("Error sending emails: "+err));

  selected=[];
  showSubcategories(currentCategory);
}

// ---- Start typing on load ----
window.onload=()=>{ typeLine(()=>{ setTimeout(()=>{ mainButtons.style.display="flex"; },800); }); };
