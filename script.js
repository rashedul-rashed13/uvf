
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

  document.getElementById("bnButton")
    .classList.toggle("active", language === "bn");

  document.getElementById("enButton")
    .classList.toggle("active", language === "en");

  renderDivisions();
  renderDistricts();
  renderAreas();

}

document.getElementById("bnButton")
  .addEventListener("click", () => setLanguage("bn"));

document.getElementById("enButton")
  .addEventListener("click", () => setLanguage("en"));


// ============================================
// 2. MENU SYSTEM
// ============================================

const menu = document.getElementById("menu");
const menuButton = document.getElementById("menuButton");

function closeMenu() {
  menu.classList.remove("show");
  menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", function(event) {

  event.stopPropagation();

  const isOpen = menu.classList.toggle("show");

  menuButton.setAttribute("aria-expanded", String(isOpen));

});

// Menu link click
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

// Click outside to close
document.addEventListener("click", function(event) {

  if (
    !menu.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    closeMenu();
  }

});

// Escape key
document.addEventListener("keydown", function(event) {

  if (event.key === "Escape") {
    closeMenu();
  }

});


// ============================================
// 3. SUPABASE CONNECTION
// ============================================

// Supabase Dashboard থেকে URL বসাও
const SUPABASE_URL =
  "YOUR_SUPABASE_PROJECT_URL";

// Publishable key অথবা legacy anon key বসাও
const SUPABASE_KEY =
  "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";

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
// 4. BANGLADESH DIVISION / DISTRICT / UPAZILA
// ============================================

const LOCATION_API =
  "https://bdapis.com/api/v1.2";

let divisions = [];
let allDistricts = [];
let currentDistricts = [];

let selectedDivision = "";
let selectedDistrict = "";

const divisionSelect =
  document.getElementById("divisionSelect");

const districtSelect =
  document.getElementById("districtSelect");

const areaSelect =
  document.getElementById("areaSelect");

const locationStatus =
  document.getElementById("locationStatus");


// City Corporation data

const cityCorporations = {

  Dhaka: [
    ["ঢাকা উত্তর", "Dhaka North City Corporation"],
    ["ঢাকা দক্ষিণ", "Dhaka South City Corporation"]
  ],

  Chattogram: [
    ["চট্টগ্রাম", "Chattogram City Corporation"]
  ],

  Khulna: [
    ["খুলনা", "Khulna City Corporation"]
  ],

  Rajshahi: [
    ["রাজশাহী", "Rajshahi City Corporation"]
  ],

  Barishal: [
    ["বরিশাল", "Barishal City Corporation"]
  ],

  Sylhet: [
    ["সিলেট", "Sylhet City Corporation"]
  ],

  Rangpur: [
    ["রংপুর", "Rangpur City Corporation"]
  ],

  Mymensingh: [
    ["ময়মনসিংহ", "Mymensingh City Corporation"]
  ],

  Cumilla: [
    ["কুমিল্লা", "Cumilla City Corporation"]
  ],

  Gazipur: [
    ["গাজীপুর", "Gazipur City Corporation"]
  ],

  Narayanganj: [
    ["নারায়ণগঞ্জ", "Narayanganj City Corporation"]
  ]

};


// API request

async function getLocationData(path) {

  const response = await fetch(LOCATION_API + path);

  if (!response.ok) {
    throw new Error("Location API error");
  }

  const result = await response.json();

  if (result.status && result.status.code !== 200) {
    throw new Error("Location API error");
  }

  return result.data || [];

}


// বাংলা - English

function bilingual(bn, en) {

  if (bn && en) {
    return bn + " - " + en;
  }

  return bn || en || "";

}


// Select reset

function resetSelect(select, placeholder) {

  select.innerHTML = "";

  const option = document.createElement("option");

  option.value = "";
  option.textContent = placeholder;

  select.appendChild(option);

}


// Division rendering

function renderDivisions() {

  resetSelect(
    divisionSelect,
    currentLanguage === "bn"
      ? "বিভাগ নির্বাচন করুন"
      : "Select Division"
  );

  divisions.forEach(item => {

    const option = document.createElement("option");

    option.value = item.division;

    option.textContent = bilingual(
      item.divisionbn,
      item.division
    );

    divisionSelect.appendChild(option);

  });

  divisionSelect.value = selectedDivision;

}


// District rendering

function renderDistricts() {

  resetSelect(
    districtSelect,
    currentLanguage === "bn"
      ? "জেলা নির্বাচন করুন"
      : "Select District"
  );

  currentDistricts.forEach(item => {

    const districtInfo = allDistricts.find(
      district => district.district === item.district
    );

    const option = document.createElement("option");

    option.value = item.district;

    option.textContent = bilingual(
      districtInfo?.districtbn,
      item.district
    );

    districtSelect.appendChild(option);

  });

  districtSelect.disabled = !selectedDivision;

  districtSelect.value = selectedDistrict;

}


// Upazila rendering

function renderAreas() {

  resetSelect(
    areaSelect,
    currentLanguage === "bn"
      ? "উপজেলা / সিটি কর্পোরেশন নির্বাচন করুন"
      : "Select Upazila / City Corporation"
  );

  const district = currentDistricts.find(
    item => item.district === selectedDistrict
  );

  if (!district) {

    areaSelect.disabled = true;

    return;

  }

  (district.upazilla || []).forEach(name => {

    const option = document.createElement("option");

    option.value = name;
    option.textContent = name;

    areaSelect.appendChild(option);

  });

  const cities = cityCorporations[selectedDistrict] || [];

  if (cities.length) {

    const group = document.createElement("optgroup");

    group.label =
      currentLanguage === "bn"
        ? "সিটি কর্পোরেশন"
        : "City Corporation";

    cities.forEach(city => {

      const option = document.createElement("option");

      option.value = "CITY:" + city[1];

      option.textContent = bilingual(city[0], city[1]);

      group.appendChild(option);

    });

    areaSelect.appendChild(group);

  }

  areaSelect.disabled = false;

}


// Division selection

divisionSelect.addEventListener("change", async function() {

  selectedDivision = this.value;

  selectedDistrict = "";

  currentDistricts = [];

  districtSelect.disabled = true;
  areaSelect.disabled = true;

  if (!selectedDivision) {

    renderDistricts();
    renderAreas();

    return;

  }

  locationStatus.textContent =
    currentLanguage === "bn"
      ? "জেলা লোড হচ্ছে..."
      : "Loading districts...";

  try {

    currentDistricts = await getLocationData(
      "/division/" + encodeURIComponent(selectedDivision)
    );

    renderDistricts();
    renderAreas();

    locationStatus.textContent =
      currentLanguage === "bn"
        ? "জেলা নির্বাচন করুন।"
        : "Select a district.";

  } catch (error) {

    console.error(error);

    locationStatus.textContent =
      currentLanguage === "bn"
        ? "জেলা লোড করা যায়নি।"
        : "Could not load districts.";

  }

});


// District selection

districtSelect.addEventListener("change", function() {

  selectedDistrict = this.value;

  renderAreas();

  locationStatus.textContent =
    currentLanguage === "bn"
      ? "উপজেলা নির্বাচন করুন।"
      : "Select an upazila.";

});


// Load all divisions

async function loadLocations() {

  try {

    locationStatus.textContent =
      currentLanguage === "bn"
        ? "বাংলাদেশের ঠিকানা লোড হচ্ছে..."
        : "Loading Bangladesh locations...";

    const results = await Promise.all([

      getLocationData("/divisions"),

      getLocationData("/districts")

    ]);

    divisions = results[0];
    allDistricts = results[1];

    renderDivisions();

    locationStatus.textContent =
      currentLanguage === "bn"
        ? "বিভাগ নির্বাচন করুন।"
        : "Select a division.";

  } catch (error) {

    console.error("Location error:", error);

    locationStatus.textContent =
      currentLanguage === "bn"
        ? "ঠিকানা লোড হয়নি। ইন্টারনেট পরীক্ষা করুন।"
        : "Could not load locations. Check internet.";

  }

}


// ============================================
// 5. SUPABASE MEMBER COUNTS
// ============================================

async function loadMemberCounts() {

  if (!db) {

    document.getElementById("statsStatus").textContent =
      "Supabase সংযোগ সেটআপ করা হয়নি।";

    return;

  }

  try {

    const [donors, volunteers] = await Promise.all([

      db.from("blood_donors")
        .select("id", {
          count: "exact",
          head: true
        }),

      db.from("volunteers")
        .select("id", {
          count: "exact",
          head: true
        })

    ]);

    if (donors.error) throw donors.error;

    if (volunteers.error) throw volunteers.error;

    document.getElementById("donorCount").textContent =
      (donors.count || 0).toLocaleString("en-US") + "+";

    document.getElementById("volunteerCount").textContent =
      (volunteers.count || 0).toLocaleString("en-US") + "+";

    document.getElementById("statsStatus").textContent = "";

  } catch (error) {

    console.error("Statistics error:", error);

    document.getElementById("statsStatus").textContent =
      "সদস্য সংখ্যা লোড করা যায়নি।";

  }

}


// ============================================
// 6. BLOOD DONOR SEARCH
// ============================================

const donorResults =
  document.getElementById("donorResults");

const searchButton =
  document.getElementById("searchButton");


function showSearchMessage(message) {

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

    phone.textContent =
      currentLanguage === "bn"
        ? "কল করুন"
        : "Call";

    card.appendChild(phone);

  }

  return card;

}


async function searchDonors() {

  if (!db) {

    showSearchMessage("Supabase সংযোগ সেটআপ করা হয়নি।");

    return;

  }

  const division = divisionSelect.value;
  const district = districtSelect.value;
  const area = areaSelect.value;

  const blood = document.getElementById(
    "bloodGroupSelect"
  ).value;

  if (!division && !district && !area && !blood) {

    showSearchMessage(
      currentLanguage === "bn"
        ? "অন্তত একটি ফিল্টার নির্বাচন করুন।"
        : "Please select at least one filter."
    );

    return;

  }

  searchButton.disabled = true;

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

    if (division) {
      query = query.eq("division", division);
    }

    if (district) {
      query = query.eq("district", district);
    }

    if (area) {

      const areaValue = area.startsWith("CITY:")
        ? area.substring(5)
        : area;

      query = query.eq("upazila", areaValue);

    }

    if (blood) {
      query = query.eq("blood_group", blood);
    }

    const { data, error } = await query;

    if (error) throw error;

    donorResults.innerHTML = "";

    if (!data || data.length === 0) {

      showSearchMessage(
        currentLanguage === "bn"
          ? "কোনো রক্তদাতা পাওয়া যায়নি।"
          : "No donors found."
      );

    } else {

      data.forEach(donor => {

        donorResults.appendChild(
          createDonorCard(donor)
        );

      });

    }

  } catch (error) {

    console.error("Donor search error:", error);

    showSearchMessage(
      currentLanguage === "bn"
        ? "রক্তদাতার তথ্য পাওয়া যায়নি। ডাটাবেজ পরীক্ষা করুন।"
        : "Could not load donors. Check database settings."
    );

  } finally {

    searchButton.disabled = false;

  }

}

searchButton.addEventListener("click", searchDonors);


// ============================================
// 7. WEBSITE INITIALIZATION
// ============================================

document.getElementById("year").textContent =
  new Date().getFullYear();

setLanguage(currentLanguage);

loadLocations();

loadMemberCounts();

setInterval(loadMemberCounts, 60000);
