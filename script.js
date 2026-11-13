
/* =====================================
   UNITED VOLUNTEERS FOUNDATION
   UVF - MAIN JAVASCRIPT
===================================== */


/* =====================================
   1. LANGUAGE SYSTEM
===================================== */

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


/* =====================================
   2. MOBILE MENU
===================================== */

const menu = document.getElementById("menu");

document.getElementById("menuButton")
  .addEventListener("click", () => {
    menu.classList.toggle("show");
  });

menu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    menu.classList.remove("show");
  });
});


/* =====================================
   3. SUPABASE CONFIGURATION
===================================== */

// নিজের Supabase Project URL বসাও
const SUPABASE_URL =
  "YOUR_SUPABASE_PROJECT_URL";

// নিজের Publishable Key অথবা legacy anon key বসাও
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


/* =====================================
   4. BANGLADESH LOCATION API
===================================== */

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


async function getLocationData(path) {

  const response = await fetch(LOCATION_API + path);

  if (!response.ok) {
    throw new Error("Location API error");
  }

  const result = await response.json();

  if (result.status && result.status.code !== 200) {
    throw new Error("Location API returned an error");
  }

  return result.data || [];

}


function bilingual(bn, en) {

  if (bn && en) return bn + " - " + en;

  return bn || en || "";

}


function resetSelect(select, placeholder) {

  select.innerHTML = "";

  const option = document.createElement("option");

  option.value = "";
  option.textContent = placeholder;

  select.appendChild(option);

}


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

  // Upazila list
  (district.upazilla || []).forEach(name => {

    const option = document.createElement("option");

    option.value = name;
    option.textContent = name;

    areaSelect.appendChild(option);

  });

  // City corporation list
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


// Division change
divisionSelect.addEventListener("change", async function() {

  selectedDivision = this.value;
  selectedDistrict = "";
  currentDistricts = [];

  resetSelect(
    districtSelect,
    currentLanguage === "bn"
      ? "জেলা লোড হচ্ছে..."
      : "Loading Districts..."
  );

  resetSelect(
    areaSelect,
    currentLanguage === "bn"
      ? "উপজেলা নির্বাচন করুন"
      : "Select Upazila"
  );

  districtSelect.disabled = true;
  areaSelect.disabled = true;

  if (!selectedDivision) {
    renderDistricts();
    return;
  }

  try {

    locationStatus.textContent =
      currentLanguage === "bn"
        ? "জেলা লোড হচ্ছে..."
        : "Loading districts...";

    currentDistricts = await getLocationData(
      "/division/" + encodeURIComponent(selectedDivision)
    );

    renderDistricts();

    locationStatus.textContent =
      currentLanguage === "bn"
        ? "জেলা নির্বাচন করুন।"
        : "Select a district.";

  } catch (error) {

    console.error(error);

    locationStatus.textContent =
      "জেলা লোড করা যায়নি।";

  }

});


// District change
districtSelect.addEventListener("change", function() {

  selectedDistrict = this.value;

  renderAreas();

  locationStatus.textContent =
    selectedDistrict
      ? "এলাকা নির্বাচন করুন।"
      : "জেলা নির্বাচন করুন।";

});


// Load location
async function loadLocations() {

  try {

    locationStatus.textContent =
      "বাংলাদেশের ঠিকানা লোড হচ্ছে...";

    const results = await Promise.all([

      getLocationData("/divisions"),

      getLocationData("/districts")

    ]);

    divisions = results[0];
    allDistricts = results[1];

    renderDivisions();

    locationStatus.textContent =
      "বিভাগ নির্বাচন করুন।";

  } catch (error) {

    console.error("Location loading error:", error);

    locationStatus.textContent =
      "ঠিকানা লোড হয়নি। ইন্টারনেট পরীক্ষা করুন।";

  }

}


/* =====================================
   5. SUPABASE MEMBER COUNTS
===================================== */

async function loadMemberCounts() {

  const donorCount =
    document.getElementById("donorCount");

  const volunteerCount =
    document.getElementById("volunteerCount");

  const status =
    document.getElementById("statsStatus");

  if (!db) {

    status.textContent =
      "Supabase সংযোগ সেটআপ করা হয়নি।";

    return;

  }

  try {

    const [
      donorResult,
      volunteerResult
    ] = await Promise.all([

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

    if (donorResult.error) throw donorResult.error;

    if (volunteerResult.error) throw volunteerResult.error;

    donorCount.textContent =
      (donorResult.count || 0).toLocaleString("en-US") + "+";

    volunteerCount.textContent =
      (volunteerResult.count || 0).toLocaleString("en-US") + "+";

    status.textContent = "";

  } catch (error) {

    console.error("Supabase count error:", error);

    status.textContent =
      "সদস্য সংখ্যা লোড করা যায়নি।";

  }

}


/* =====================================
   6. BLOOD DONOR SEARCH
===================================== */

const searchButton =
  document.getElementById("searchButton");

const donorResults =
  document.getElementById("donorResults");


function showMessage(message) {

  donorResults.innerHTML = "";

  const p = document.createElement("p");

  p.className = "search-placeholder";
  p.textContent = message;

  donorResults.appendChild(p);

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

    phone.textContent =
      currentLanguage === "bn"
        ? "কল করুন"
        : "Call";

    phone.className = "btn btn-green";

    card.appendChild(phone);

  }

  return card;

}


async function searchDonors() {

  if (!db) {

    showMessage("Supabase সংযোগ সেটআপ করা হয়নি।");

    return;

  }

  const division = divisionSelect.value;
  const district = districtSelect.value;
  const area = areaSelect.value;
  const blood = document.getElementById(
    "bloodGroupSelect"
  ).value;

  if (!division && !district && !area && !blood) {

    showMessage("অনুগ্রহ করে অন্তত একটি ফিল্টার নির্বাচন করুন।");

    return;

  }

  searchButton.disabled = true;

  showMessage("রক্তদাতা খোঁজা হচ্ছে...");

  try {

    let query = db
      .from("blood_donors")
      .select(
        "name, phone, blood_group, division, district, upazila"
      );

    if (division) {
      query = query.eq("division", division);
    }

    if (district) {
      query = query.eq("district", district);
    }

    if (area) {

      if (area.startsWith("CITY:")) {

        query = query.eq("upazila", area.substring(5));

      } else {

        query = query.eq("upazila", area);

      }

    }

    if (blood) {
      query = query.eq("blood_group", blood);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;

    donorResults.innerHTML = "";

    if (!data || data.length === 0) {

      showMessage("কোনো রক্তদাতা পাওয়া যায়নি।");

    } else {

      data.forEach(donor => {

        donorResults.appendChild(
          createDonorCard(donor)
        );

      });

    }

  } catch (error) {

    console.error("Donor search error:", error);

    showMessage(
      "রক্তদাতার তথ্য লোড করা যায়নি। ডাটাবেসের কলাম ও অনুমতি পরীক্ষা করুন।"
    );

  } finally {

    searchButton.disabled = false;

  }

}


searchButton.addEventListener(
  "click",
  searchDonors
);


/* =====================================
   7. INITIALIZE WEBSITE
===================================== */

document.getElementById("year").textContent =
  new Date().getFullYear();

setLanguage(currentLanguage);

loadLocations();

loadMemberCounts();

setInterval(loadMemberCounts, 60000);
