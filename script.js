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

// Division Bangla names
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

// District Bangla names
const districtBN = {
  "Dhaka": "ঢাকা",
  "Gazipur": "গাজীপুর",
  "Jamalpur": "জামালপুর",
  "Mymensingh": "ময়মনসিংহ",
  "Tangail": "টাঙ্গাইল",
  "Kishoreganj": "কিশোরগঞ্জ",
  "Narayanganj": "নারায়ণগঞ্জ",
  "Narsingdi": "নরসিংদী",
  "Manikganj": "মানিকগঞ্জ",
  "Munshiganj": "মুন্সীগঞ্জ",
  "Faridpur": "ফরিদপুর",
  "Gopalganj": "গোপালগঞ্জ",
  "Madaripur": "মাদারীপুর",
  "Shariatpur": "শরীয়তপুর",
  "Netrokona": "নেত্রকোনা",
  "Sherpur": "শেরপুর",
  "Kurigram": "কুড়িগ্রাম",
  "Bogura": "বগুড়া",
  "Cumilla": "কুমিল্লা",
  "Sylhet": "সিলেট",
  "Chattogram": "চট্টগ্রাম"
};

// Upazila Bangla names
const upazilaBN = {
  "Dewanganj": "দেওয়ানগঞ্জ",
  "Islampur": "ইসলামপুর",
  "Jamalpur Sadar": "জামালপুর সদর",
  "Melandaha": "মেলান্দহ",
  "Madarganj": "মাদারগঞ্জ",
  "Sarishabari": "সরিষাবাড়ী",
  "Bakshiganj": "বকশীগঞ্জ",
  "Dhamrai": "ধামরাই",
  "Savar": "সাভার",
  "Gazipur Sadar": "গাজীপুর সদর"
};

// City corporations under Dhaka district
const cityCorporations = {
  "Dhaka": [
    {
      bn: "ঢাকা উত্তর সিটি কর্পোরেশন",
      en: "Dhaka North City Corporation"
    },
    {
      bn: "ঢাকা দক্ষিণ সিটি কর্পোরেশন",
      en: "Dhaka South City Corporation"
    }
  ],
  "Gazipur": [
    {
      bn: "গাজীপুর সিটি কর্পোরেশন",
      en: "Gazipur City Corporation"
    }
  ]
};

// Bilingual name
function locationName(bn, en) {
  return (bn || en) + " - " + en;
}

// Reset dropdown
function resetDropdown(element, placeholder) {
  element.innerHTML = "";

  const option = document.createElement("option");
  option.value = "";
  option.textContent = placeholder;

  element.appendChild(option);
}

// API fetch
async function getLocationData(path) {
  const response = await fetch(LOCATION_API + path);

  if (!response.ok) {
    throw new Error("Location API error");
  }

  const result = await response.json();

  return result.data || [];
}

// Load divisions
async function loadDivisions() {
  try {
    locationStatus.textContent = "বিভাগ লোড হচ্ছে...";

    const [divisionData, districtData] = await Promise.all([
      getLocationData("/divisions"),
      getLocationData("/districts")
    ]);

    divisions = divisionData;
    allDistricts = districtData;

    resetDropdown(divisionSelect, "বিভাগ নির্বাচন করুন");

    divisions.forEach(item => {
      const option = document.createElement("option");

      const en = item.division;
      const bn = divisionBN[en] || item.divisionbn || en;

      option.value = en;
      option.textContent = locationName(bn, en);

      divisionSelect.appendChild(option);
    });

    locationStatus.textContent = "বিভাগ নির্বাচন করুন";

  } catch (error) {
    console.error(error);
    locationStatus.textContent = "ঠিকানা লোড করা যায়নি";
  }
}

// Division change
divisionSelect.addEventListener("change", async function() {
  selectedDivision = this.value;
  selectedDistrict = "";

  currentDistricts = [];

  resetDropdown(districtSelect, "জেলা নির্বাচন করুন");
  resetDropdown(areaSelect, "উপজেলা / সিটি কর্পোরেশন নির্বাচন করুন");

  districtSelect.disabled = true;
  areaSelect.disabled = true;

  if (!selectedDivision) return;

  try {
    locationStatus.textContent = "জেলা লোড হচ্ছে...";

    currentDistricts = await getLocationData(
      "/division/" + encodeURIComponent(selectedDivision)
    );

    currentDistricts.forEach(item => {
      const option = document.createElement("option");

      const en = item.district;

      const districtInfo = allDistricts.find(
        d => d.district === en
      );

      const bn =
        districtBN[en] ||
        districtInfo?.districtbn ||
        en;

      option.value = en;
      option.textContent = locationName(bn, en);

      districtSelect.appendChild(option);
    });

    districtSelect.disabled = false;

    locationStatus.textContent = "জেলা নির্বাচন করুন";

  } catch (error) {
    console.error(error);
    locationStatus.textContent = "জেলা লোড করা যায়নি";
  }
});

// District change
districtSelect.addEventListener("change", function() {
  selectedDistrict = this.value;

  resetDropdown(areaSelect, "উপজেলা / সিটি কর্পোরেশন নির্বাচন করুন");

  areaSelect.disabled = true;

  if (!selectedDistrict) return;

  const district = currentDistricts.find(
    item => item.district === selectedDistrict
  );

  if (!district) return;

  // Upazila options
  (district.upazilla || []).forEach(name => {
    const option = document.createElement("option");

    option.value = name;

    const bn = upazilaBN[name] || name;

    option.textContent = locationName(bn, name);

    areaSelect.appendChild(option);
  });

  // City corporations
  const cities = cityCorporations[selectedDistrict] || [];

  if (cities.length) {
    const group = document.createElement("optgroup");

    group.label = "সিটি কর্পোরেশন / City Corporation";

    cities.forEach(city => {
      const option = document.createElement("option");

      option.value = city.en;
      option.textContent = locationName(city.bn, city.en);

      group.appendChild(option);
    });

    areaSelect.appendChild(group);
  }

  areaSelect.disabled = false;

  locationStatus.textContent = "এলাকা নির্বাচন করুন";
});


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

loadDivisions();

loadMemberCounts();

setInterval(loadMemberCounts, 60000);
