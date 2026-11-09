import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
 getFirestore, collection, addDoc, getDocs, 
 query, where, runTransaction, doc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
 apiKey: "AIzaSyCUtcXUXAamrTsH-Jij_kOxxT6kWaIF8mk",
 authDomain: "united-volunteer-s-foundation.firebaseapp.com",
 projectId: "united-volunteer-s-foundation",
 storageBucket: "united-volunteer-s-foundation.firebasestorage.app",
 messagingSenderId: "363056628590",
 appId: "1:363056628590:web:b71f66f718c3b678a9f77f",
 measurementId: "G-VSP93EWNK6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Language Management
let currentLanguage = localStorage.getItem("uvf-language") || "bn";

window.setLanguage = function(lang) {
 currentLanguage = lang;
 document.querySelectorAll("[data-bn][data-en]").forEach(el => {
  el.textContent = el.getAttribute("data-" + lang);
 });
 document.documentElement.lang = lang;
 localStorage.setItem("uvf-language", lang);
 document.getElementById("bnBtn").classList.toggle("active", lang === "bn");
 document.getElementById("enBtn").classList.toggle("active", lang === "en");
};

window.toggleMenu = function() {
 document.getElementById("mainMenu").classList.toggle("open");
};

window.closeMenu = function() {
 document.getElementById("mainMenu").classList.remove("open");
};

// Form Open/Close Handlers
window.openForm = function(id) {
 document.querySelectorAll(".form-section").forEach(f => f.classList.remove("active"));
 document.getElementById(id).classList.add("active");
 document.getElementById(id).scrollIntoView({ behavior: "smooth" });
};

window.closeForms = function() {
 document.querySelectorAll(".form-section").forEach(f => f.classList.remove("active"));
};

// ID Generator Transaction
async function createId(type) {
 const counterRef = doc(db, "counters", type);
 return await runTransaction(db, async tx => {
  const snap = await tx.get(counterRef);
  const next = (snap.exists() ? snap.data().value : 0) + 1;
  tx.set(counterRef, { value: next });
  return type === "donor"
   ? "UVF-D-" + String(next).padStart(5, "0")
   : "UVF-V-" + String(next).padStart(3, "0");
 });
}

// Donor Form Submission
document.getElementById("donorRegistrationForm").addEventListener("submit", async e => {
 e.preventDefault();
 const form = e.target;
 const msg = document.getElementById("donorMessage");
 const btn = form.querySelector("button[type=submit]");
 btn.disabled = true;
 msg.className = "form-message";
 msg.style.display = "block";
 msg.textContent = "তথ্য জমা হচ্ছে...";

 try {
  const values = Object.fromEntries(new FormData(form).entries());
  const existing = await getDocs(query(collection(db, "donors"), where("phone", "==", values.phone)));
  
  if (!existing.empty) throw new Error("এই মোবাইল নম্বরে ইতোমধ্যে নিবন্ধন করা হয়েছে।");
  
  const donorId = await createId("donor");
  await addDoc(collection(db, "donors"), {
   ...values, donorId, status: "pending", createdAt: serverTimestamp()
  });

  msg.className = "form-message success";
  msg.textContent = "সফল! আপনার Donor ID: " + donorId + "। যাচাই শেষে নিবন্ধন অনুমোদিত হবে।";
  form.reset();
  loadStats();
 } catch (err) {
  msg.className = "form-message error";
  msg.textContent = "সমস্যা: " + err.message;
 } finally {
  btn.disabled = false;
 }
});

// Volunteer Form Submission
document.getElementById("volunteerRegistrationForm").addEventListener("submit", async e => {
 e.preventDefault();
 const form = e.target;
 const msg = document.getElementById("volunteerMessage");
 const btn = form.querySelector("button[type=submit]");
 btn.disabled = true;
 msg.className = "form-message";
 msg.style.display = "block";
 msg.textContent = "তথ্য যাচাই হচ্ছে...";

 try {
  const values = Object.fromEntries(new FormData(form).entries());
  const donors = await getDocs(query(collection(db, "donors"), where("phone", "==", values.donorPhone)));
  
  if (donors.empty) throw new Error("আগে রক্তদাতা হিসেবে নিবন্ধন করুন।");
  
  const donor = donors.docs[0].data();
  if (donor.status !== "approved") throw new Error("আপনার রক্তদাতা নিবন্ধন এখনো অনুমোদিত হয়নি।");
  
  const volunteerId = await createId("volunteer");
  await addDoc(collection(db, "volunteers"), {
   ...values, volunteerId, donorId: donor.donorId,
   status: "pending", createdAt: serverTimestamp()
  });

  msg.className = "form-message success";
  msg.textContent = "আবেদন জমা হয়েছে! আপনার Volunteer ID: " + volunteerId;
  form.reset();
  loadStats();
 } catch (err) {
  msg.className = "form-message error";
  msg.textContent = "সমস্যা: " + err.message;
 } finally {
  btn.disabled = false;
 }
});

// Load Statistics Counters
async function loadStats() {
 try {
  const [d, v] = await Promise.all([
   getDocs(query(collection(db, "donors"), where("status", "==", "approved"))),
   getDocs(query(collection(db, "volunteers"), where("status", "==", "approved")))
  ]);
  document.getElementById("donorCount").textContent = d.size;
  document.getElementById("volunteerCount").textContent = v.size;
 } catch (e) {
  console.error(e);
 }
}

// Initialize on Load
loadStats();
setLanguage(currentLanguage);

