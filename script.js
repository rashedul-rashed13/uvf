
/* Supabase সংযোগ */
const SUPABASE_URL = "তোমার_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "তোমার_SUPABASE_ANON_KEY";

let db = null;

if (
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_ANON_KEY.includes("তোমার_")
) {
  db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}

/* মেনু */
const menu = document.getElementById("menu");

document.getElementById("menuBtn").onclick = () => {
  menu.classList.toggle("active");
};

/* ভাষা পরিবর্তন */
let currentLanguage = "bn";

function toggleLanguage() {
  currentLanguage = currentLanguage === "bn" ? "en" : "bn";

  document.querySelectorAll("[data-bn]").forEach(element => {
    element.textContent = element.dataset[currentLanguage];
  });
}

/* বাংলা ও ইংরেজি অবস্থানের তথ্য */
let locationData = [];

const division = document.getElementById("division");
const district = document.getElementById("district");
const upazila = document.getElementById("upazila");
const blood = document.getElementById("blood");

const results = document.getElementById("results");
const totalFound = document.getElementById("totalFound");

function addOption(select, value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  select.appendChild(option);
}

/* বিভাগ লোড */
async function loadLocations() {
  if (!db) return;

  const { data, error } = await db
    .from("locations")
    .select("*")
    .order("name_bn");

  if (error) {
    console.error(error);
    return;
  }

  locationData = data || [];

  locationData
    .filter(item => item.type === "division")
    .forEach(item => {
      addOption(
        division,
        item.id,
        `${item.name_bn} - ${item.name_en}`
      );
    });
}

/* জেলা লোড */
division.addEventListener("change", () => {
  district.innerHTML = '<option value="">জেলা নির্বাচন করুন</option>';
  upazila.innerHTML = '<option value="">আগে জেলা নির্বাচন করুন</option>';

  district.disabled = !division.value;
  upazila.disabled = true;

  locationData
    .filter(item =>
      item.type === "district" &&
      String(item.parent_id) === division.value
    )
    .forEach(item => {
      addOption(
        district,
        item.id,
        `${item.name_bn} - ${item.name_en}`
      );
    });

  searchDonors();
});

/* উপজেলা লোড */
district.addEventListener("change", () => {
  upazila.innerHTML = '<option value="">সব উপজেলা</option>';
  upazila.disabled = !district.value;

  locationData
    .filter(item =>
      item.type === "upazila" &&
      String(item.parent_id) === district.value
    )
    .forEach(item => {
      addOption(
        upazila,
        item.id,
        `${item.name_bn} - ${item.name_en}`
      );
    });

  searchDonors();
});

/* রক্তদাতা সার্চ */
blood.addEventListener("change", searchDonors);
upazila.addEventListener("change", searchDonors);

async function searchDonors() {
  if (!db) {
    totalFound.textContent = "ডাটাবেজ সংযুক্ত করা হয়নি";
    return;
  }

  let query = db
    .from("donors")
    .select("*", { count: "exact" })
    .eq("status", "approved");

  if (division.value) query = query.eq("division_id", division.value);
  if (district.value) query = query.eq("district_id", district.value);
  if (upazila.value) query = query.eq("upazila_id", upazila.value);
  if (blood.value) query = query.eq("blood_group", blood.value);

  const { data, count, error } = await query;

  if (error) {
    console.error(error);
    return;
  }

  totalFound.textContent = `মোট ${count || 0} জন রক্তদাতা পাওয়া গেছে`;

  results.innerHTML = "";

  if (!data || data.length === 0) {
    results.innerHTML = `
      <div class="empty">
        <h3>কোনো রক্তদাতা পাওয়া যায়নি</h3>
        <p>অন্য ফিল্টার নির্বাচন করে চেষ্টা করুন।</p>
      </div>`;
    return;
  }

  data.forEach(person => {
    const card = document.createElement("div");
    card.className = "donor-card";

    const info = document.createElement("div");

    const name = document.createElement("h3");
    name.textContent = person.name;

    const address = document.createElement("p");
    address.textContent = person.address || "";

    info.append(name, address);

    const badge = document.createElement("span");
    badge.className = "blood-badge";
    badge.textContent = person.blood_group;

    card.append(info, badge);
    results.appendChild(card);
  });
}

/* স্বয়ংক্রিয় সদস্য সংখ্যা */
async function loadStats() {
  if (!db) return;

  const { count: donors, error: donorError } = await db
    .from("donors")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  const { count: volunteers, error: volunteerError } = await db
    .from("volunteers")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  if (donorError || volunteerError) {
    console.error(donorError || volunteerError);
    return;
  }

  const donorStat = document.getElementById("donorStat");
  const volunteerStat = document.getElementById("volunteerStat");
  const stats = document.getElementById("stats");

  donorStat.hidden = !donors;
  volunteerStat.hidden = !volunteers;

  document.getElementById("donorCount").textContent = donors + "+";
  document.getElementById("volunteerCount").textContent = volunteers + "+";

  stats.hidden = !donors && !volunteers;
}

/* ওয়েবসাইট চালু */
async function initialize() {
  await loadLocations();
  await loadStats();
}

initialize();
