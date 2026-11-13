// ============================================
// UNITED VOLUNTEERS FOUNDATION
// UVF WEBSITE JAVASCRIPT
// ============================================


// ============================================
// 1. LANGUAGE SYSTEM
// ============================================

let currentLanguage =
  localStorage.getItem("uvf_language") || "bn";

function setLanguage(language) {

  currentLanguage = language;

  localStorage.setItem("uvf_language", language);

  document.documentElement.lang = language;

  document.querySelectorAll("[data-bn][data-en]").forEach(element => {

    element.textContent =
      element.getAttribute("data-" + language);

  });

  const bnBtn = document.getElementById("bnButton");
  const enBtn = document.getElementById("enButton");

  if (bnBtn) bnBtn.classList.toggle("active", language === "bn");
  if (enBtn) enBtn.classList.toggle("active", language === "en");

  renderDivisions();
  renderDistricts();
  renderAreas();

}

const bnButtonElement = document.getElementById("bnButton");
if (bnButtonElement) {
  bnButtonElement.addEventListener("click", () => setLanguage("bn"));
}

const enButtonElement = document.getElementById("enButton");
if (enButtonElement) {
  enButtonElement.addEventListener("click", () => setLanguage("en"));
}


// ============================================
// 2. MENU SYSTEM
// ============================================

const menu = document.getElementById("menu");
const menuButton = document.getElementById("menuButton");

function closeMenu() {
  if (menu) menu.classList.remove("show");
  if (menuButton) menuButton.setAttribute("aria-expanded", "false");
}

if (menuButton && menu) {
  menuButton.addEventListener("click", function(event) {
    event.stopPropagation();
    const isOpen = menu.classList.toggle("show");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function() {
      menu.querySelectorAll(".menu-link")
        .forEach(item => item.classList.remove("active"));

      if (this.classList.contains("menu-link")) {
        this.classList.add("active");
      }

      closeMenu();
    });
  });
}

document.addEventListener("click", function(event) {
  if (menu && menuButton) {
    if (
      !menu.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
  }
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    closeMenu();
  }
});


// ============================================
// 3. SUPABASE CONNECTION
// ============================================

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";

let db = null;

if (
  window.supabase &&
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("YOUR_") &&
  !SUPABASE_KEY.includes("YOUR_")
) {
  db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );
}


// ============================================
// 4. BANGLADESH DIVISION / DISTRICT / UPAZILA (BN - EN FORMAT)
// ============================================

const LOCATION_API = "https://bdapis.com/api/v1.2";

const divisionSelect = document.getElementById("divisionSelect");
const districtSelect = document.getElementById("districtSelect");
const areaSelect = document.getElementById("areaSelect");
const locationStatus = document.getElementById("locationStatus");

let divisions = [];
let allDistricts = [];
let currentDistricts = [];

let selectedDivision = "";
let selectedDistrict = "";
let selectedArea = "";

// ১. সকল বিভাগের বাংলা নাম
const divisionBN = {
  "Dhaka": "ঢাকা",
  "Chattogram": "চট্টগ্রাম",
  "Rajshahi": "রাজশাহী",
  "Khulna": "খুলনা",
  "Barishal": "বরিশাল",
  "Sylhet": "সিলেট",
  "Rangpur": "রংপুর",
  "Mymensingh": "ময়মনসিংহ"
};

// ২. সকল জেলার বাংলা নাম
const districtBN = {
  "Dhaka": "ঢাকা", "Gazipur": "গাজীপুর", "Jamalpur": "জামালপুর", "Mymensingh": "ময়মনসিংহ",
  "Tangail": "টাঙ্গাইল", "Kishoreganj": "কিশোরগঞ্জ", "Narayanganj": "নারায়ণগঞ্জ", "Narsingdi": "নরসিংদী",
  "Manikganj": "মানিকগঞ্জ", "Munshiganj": "মুন্সীগঞ্জ", "Faridpur": "ফরিদপুর", "Gopalganj": "গোপালগঞ্জ",
  "Madaripur": "মাদারীপুর", "Shariatpur": "শরীয়তপুর", "Netrokona": "নেত্রকোনা", "Sherpur": "শেরপুর",
  "Kurigram": "কুড়িগ্রাম", "Bogura": "বগুড়া", "Cumilla": "কুমিল্লা", "Sylhet": "সিলেট",
  "Chattogram": "চট্টগ্রাম", "Cox's Bazar": "কক্সবাজার", "Brahmanbaria": "ব্রাহ্মণবাড়িয়া", "Chandpur": "চাঁদপুর",
  "Noakhali": "নোয়াখালী", "Feni": "ফেনী", "Lakshmipur": "লক্ষ্মীপুর", "Khagrachhari": "খাগড়াছড়ি",
  "Rangamati": "রাঙ্গামাটি", "Bandarban": "বান্দরবান", "Rajshahi": "রাজশাহী", "Pabna": "পাবনা",
  "Sirajganj": "সিরাজগঞ্জ", "Natore": "নাটোর", "Naogaon": "নওগাঁ", "Chapainawabganj": "চাঁপাইনবাবগঞ্জ",
  "Joypurhat": "জয়পুরহাট", "Khulna": "খুলনা", "Jessore": "যশোর", "Satkhira": "সাতক্ষীরা",
  "Narail": "নড়াইল", "Magura": "মাগুরা", "Jhenaidah": "ঝিনাইদহ", "Kushtia": "কুষ্টিয়া",
  "Chuadanga": "চুয়াডাঙ্গা", "Meherpur": "মেহেরপুর", "Bagerhat": "বাগেরহাট", "Barishal": "বরিশাল",
  "Patuakhali": "পটুয়াখালী", "Bhola": "ভোলা", "Pirojpur": "পিরোজপুর", "Jhalokathi": "ঝালকাঠী",
  "Barguna": "বরগুনা", "Habiganj": "হবিগঞ্জ", "Moulvibazar": "মৌলভীবাজার", "Sunamganj": "সুনামগঞ্জ",
  "Rangpur": "রংপুর", "Gaibandha": "গাইবান্ধা", "Lalmonirhat": "লালমনিরহাট", "Nilphamari": "নীলফামারী",
  "Dinajpur": "দিনাজপুর", "Thakurgaon": "ঠাকুরগাঁও", "Panchagarh": "পঞ্চগড়"
};

// ৩. উপজেলাগুলোর বাংলা নাম (জামালপুর, ঢাকা ও অন্যান্য প্রধান এলাকার জন্য)
const upazilaBN = {
  "Dewanganj": "দেওয়ানগঞ্জ", "Islampur": "ইসলামপুর", "Jamalpur Sadar": "জামালপুর সদর",
  "Melandaha": "মেলান্দহ", "Madarganj": "মাদারগঞ্জ", "Sarishabari": "সরিষাবাড়ী",
  "Bakshiganj": "বকশীগঞ্জ", "Dhamrai": "ধামরাই", "Savar": "সাভার", "Gazipur Sadar": "গাজীপুর সদর",
  "Uttara": "উত্তরা", "Mirpur": "মিরপুর", "Gulshan": "গুলশান", "Dhanmondi": "ধানমন্ডি"
};

// ৪. প্রধান সিটি কর্পোরেশন
const cityCorporations = {
  "Dhaka": [
    { bn: "ঢাকা উত্তর সিটি কর্পোরেশন", en: "Dhaka North City Corporation" },
    { bn: "ঢাকা দক্ষিণ সিটি কর্পোরেশন", en: "Dhaka South City Corporation" }
  ],
  "Chattogram": [{ bn: "চট্টগ্রাম সিটি কর্পোরেশন", en: "Chattogram City Corporation" }],
  "Khulna": [{ bn: "খুলনা সিটি কর্পোরেশন", en: "Khulna City Corporation" }],
  "Rajshahi": [{ bn: "রাজশাহী সিটি কর্পোরেশন", en: "Rajshahi City Corporation" }],
  "Barishal": [{ bn: "বরিশাল সিটি কর্পোরেশন", en: "Barishal City Corporation" }],
  "Sylhet": [{ bn: "সিলেট সিটি কর্পোরেশন", en: "Sylhet City Corporation" }],
  "Rangpur": [{ bn: "রংপুর সিটি কর্পোরেশন", en: "Rangpur City Corporation" }],
  "Mymensingh": [{ bn: "ময়মনসিংহ সিটি কর্পোরেশন", en: "Mymensingh City Corporation" }],
  "Cumilla": [{ bn: "কুমিল্লা সিটি কর্পোরেশন", en: "Cumilla City Corporation" }],
  "Gazipur": [{ bn: "গাজীপুর সিটি কর্পোরেশন", en: "Gazipur City Corporation" }],
  "Narayanganj": [{ bn: "নারায়ণগঞ্জ সিটি কর্পোরেশন", en: "Narayanganj City Corporation" }]
};

// সুনির্দিষ্ট ফরম্যাট: বাংলা - ইংরেজি (যেমন: ঢাকা - Dhaka)
function formatName(bn, en) {
  if (bn && en && bn !== en) {
    return bn + " - " + en;
  }
  return en || bn || "";
}

function resetDropdown(element, placeholder) {
  if (!element) return;
  element.innerHTML = "";
  const option = document.createElement("option");
  option.value = "";
  option.textContent = placeholder;
  element.appendChild(option);
}

async function getLocationData(path) {
  const response = await fetch(LOCATION_API + path);
  if (!response.ok) {
    throw new Error("Location API error");
  }
  const result = await response.json();
  return result.data || [];
}

// বিভাগ রেন্ডার
function renderDivisions() {
  if (!divisionSelect) return;
  const currentVal = divisionSelect.value;
  resetDropdown(divisionSelect, "বিভাগ নির্বাচন করুন / Select Division");

  divisions.forEach(item => {
    const option = document.createElement("option");
    const en = item.division;
    const bn = divisionBN[en] || item.divisionbn || en;

    option.value = en;
    option.textContent = formatName(bn, en);
    divisionSelect.appendChild(option);
  });
  divisionSelect.value = currentVal || selectedDivision;
}

// জেলা রেন্ডার
function renderDistricts() {
  if (!districtSelect) return;
  const currentVal = districtSelect.value;
  resetDropdown(districtSelect, "জেলা নির্বাচন করুন / Select District");

  currentDistricts.forEach(item => {
    const option = document.createElement("option");
    const en = item.district;
    const districtInfo = allDistricts.find(d => d.district === en);
    const bn = districtBN[en] || districtInfo?.districtbn || en;

    option.value = en;
    option.textContent = formatName(bn, en);
    districtSelect.appendChild(option);
  });

  districtSelect.disabled = !selectedDivision;
  districtSelect.value = currentVal || selectedDistrict;
}

// উপজেলা ও সিটি কর্পোরেশন রেন্ডার
function renderAreas() {
  if (!areaSelect) return;
  const currentVal = areaSelect.value;
  resetDropdown(areaSelect, "উপজেলা / সিটি কর্পোরেশন / Area");

  const district = currentDistricts.find(item => item.district === selectedDistrict);

  if (!district) {
    areaSelect.disabled = true;
    return;
  }

  // উপজেলাগুলো যুক্ত করা
  (district.upazilla || []).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    const bn = upazilaBN[name] || name; 
    option.textContent = formatName(bn, name);
    areaSelect.appendChild(option);
  });

  // সিটি কর্পোরেশন যুক্ত করা
  const cities = cityCorporations[selectedDistrict] || [];
  if (cities.length) {
    const group = document.createElement("optgroup");
    group.label = "সিটি কর্পোরেশন / City Corporation";

    cities.forEach(city => {
      const option = document.createElement("option");
      option.value = city.en;
      option.textContent = formatName(city.bn, city.en);
      group.appendChild(option);
    });

    areaSelect.appendChild(group);
  }

  areaSelect.disabled = false;
  areaSelect.value = currentVal || selectedArea;
}

// ইনিশিয়াল লোড
async function loadLocations() {
  try {
    if (locationStatus) locationStatus.textContent = "ঠিকানা লোড হচ্ছে...";

    const [divisionData, districtData] = await Promise.all([
      getLocationData("/divisions"),
      getLocationData("/districts")
    ]);

    divisions = divisionData;
    allDistricts = districtData;

    renderDivisions();

    if (locationStatus) locationStatus.textContent = "বিভাগ নির্বাচন করুন";

  } catch (error) {
    console.error("Location error:", error);
    if (locationStatus) locationStatus.textContent = "ঠিকানা লোড করা যায়নি।";
  }
}

// ইভেন্ট লিসেনার
if (divisionSelect) {
  divisionSelect.addEventListener("change", async function() {
    selectedDivision = this.value;
    selectedDistrict = "";
    selectedArea = "";
    currentDistricts = [];

    if (districtSelect) districtSelect.disabled = true;
    if (areaSelect) areaSelect.disabled = true;

    resetDropdown(districtSelect, "জেলা নির্বাচন করুন / Select District");
    resetDropdown(areaSelect, "উপজেলা / সিটি কর্পোরেশন / Area");

    if (!selectedDivision) return;

    try {
      if (locationStatus) locationStatus.textContent = "জেলা লোড হচ্ছে...";
      currentDistricts = await getLocationData("/division/" + encodeURIComponent(selectedDivision));
      
      renderDistricts();
      if (locationStatus) locationStatus.textContent = "জেলা নির্বাচন করুন";
    } catch (error) {
      console.error(error);
      if (locationStatus) locationStatus.textContent = "জেলা লোড করা যায়নি";
    }
  });
}

if (districtSelect) {
  districtSelect.addEventListener("change", function() {
    selectedDistrict = this.value;
    selectedArea = "";

    renderAreas();
    if (locationStatus) locationStatus.textContent = "উপজেলা / এলাকা নির্বাচন করুন";
  });
}

if (areaSelect) {
  areaSelect.addEventListener("change", function() {
    selectedArea = this.value;
  });
}


// ============================================
// 5. SUPABASE MEMBER COUNTS
// ============================================

async function loadMemberCounts() {
  if (!db) {
    const statsStatus = document.getElementById("statsStatus");
    if (statsStatus) statsStatus.textContent = "Supabase সংযোগ সেটআপ করা হয়নি।";
    return;
  }

  try {
    const [donors, volunteers] = await Promise.all([
      db.from("blood_donors").select("id", { count: "exact", head: true }),
      db.from("volunteers").select("id", { count: "exact", head: true })
    ]);

    if (donors.error) throw donors.error;
    if (volunteers.error) throw volunteers.error;

    const donorCountEl = document.getElementById("donorCount");
    const volunteerCountEl = document.getElementById("volunteerCount");
    const statsStatusEl = document.getElementById("statsStatus");

    if (donorCountEl) donorCountEl.textContent = (donors.count || 0).toLocaleString("en-US") + "+";
    if (volunteerCountEl) volunteerCountEl.textContent = (volunteers.count || 0).toLocaleString("en-US") + "+";
    if (statsStatusEl) statsStatusEl.textContent = "";

  } catch (error) {
    console.error("Statistics error:", error);
    const statsStatusEl = document.getElementById("statsStatus");
    if (statsStatusEl) statsStatusEl.textContent = "সদস্য সংখ্যা লোড করা যায়নি।";
  }
}


// ============================================
// 6. BLOOD DONOR SEARCH
// ============================================

const donorResults = document.getElementById("donorResults");
const searchButton = document.getElementById("searchButton");

function showSearchMessage(message) {
  if (!donorResults) return;
  donorResults.innerHTML = "";
  const box = document.createElement("div");
  box.className = "search-placeholder";
  const text = document.createElement("p");
  text.textContent = message;
  box.appendChild(text);
  donorResults.appendChild(box);
}

function createDonorCard(donor) {
  const card = document.createElement("div");
  card.className = "donor-card-result";

  const details = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = donor.name || "রক্তদাতা";

  const info = document.createElement("p");
  info.textContent = [
    donor.blood_group,
    donor.district,
    donor.upazila
  ].filter(Boolean).join(" | ");

  details.append(name, info);
  card.appendChild(details);

  if (donor.phone) {
    const phone = document.createElement("a");
    phone.href = "tel:" + donor.phone;
    phone.className = "btn btn-green";
    phone.textContent = currentLanguage === "bn" ? "কল করুন" : "Call";
    card.appendChild(phone);
  }

  return card;
}

async function searchDonors() {
  if (!db) {
    showSearchMessage("Supabase সংযোগ সেটআপ করা হয়নি।");
    return;
  }

  const division = divisionSelect ? divisionSelect.value : "";
  const district = districtSelect ? districtSelect.value : "";
  const area = areaSelect ? areaSelect.value : "";
  const bloodEl = document.getElementById("bloodGroupSelect");
  const blood = bloodEl ? bloodEl.value : "";

  if (!division && !district && !area && !blood) {
    showSearchMessage(
      currentLanguage === "bn"
        ? "অন্তত একটি ফিল্টার নির্বাচন করুন।"
        : "Please select at least one filter."
    );
    return;
  }

  if (searchButton) searchButton.disabled = true;

  showSearchMessage(
    currentLanguage === "bn"
      ? "রক্তদাতা খোঁজা হচ্ছে..."
      : "Searching donors..."
  );

  try {
    let query = db
      .from("blood_donors")
      .select("name, phone, blood_group, division, district, upazila")
      .limit(50);

    if (division) query = query.eq("division", division);
    if (district) query = query.eq("district", district);
    if (area) {
      const areaValue = area.startsWith("CITY:") ? area.substring(5) : area;
      query = query.eq("upazila", areaValue);
    }
    if (blood) query = query.eq("blood_group", blood);

    const { data, error } = await query;

    if (error) throw error;

    if (donorResults) donorResults.innerHTML = "";

    if (!data || data.length === 0) {
      showSearchMessage(
        currentLanguage === "bn"
          ? "কোনো রক্তদাতা পাওয়া যায়নি।"
          : "No donors found."
      );
    } else {
      data.forEach(donor => {
        if (donorResults) {
          donorResults.appendChild(createDonorCard(donor));
        }
      });
    }

  } catch (error) {
    console.error("Donor search error:", error);
    showSearchMessage(
      currentLanguage === "bn"
        ? "রক্তদাতার তথ্য পাওয়া যায়নি।"
        : "Could not load donors."
    );
  } finally {
    if (searchButton) searchButton.disabled = false;
  }
}

if (searchButton) {
  searchButton.addEventListener("click", searchDonors);
}


// ============================================
// 7. WEBSITE INITIALIZATION
// ============================================

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

loadLocations();
loadMemberCounts();
setInterval(loadMemberCounts, 60000);
