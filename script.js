/* =====================================================
   UNITED VOLUNTEERS FOUNDATION (UVF) - SCRIPT.JS
   Dynamic Bangladesh Location & Language Switcher
===================================================== */


/* 1. LANGUAGE SWITCHING */

let currentLanguage = localStorage.getItem("uvf_language") || "bn";

function setLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("uvf_language", language);
  document.documentElement.lang = language;

  // Static text translations using data attributes
  document.querySelectorAll("[data-bn][data-en]").forEach(element => {
    element.textContent = language === "bn"
      ? element.dataset.bn
      : element.dataset.en;
  });

  document.querySelectorAll(
    "[data-placeholder-bn][data-placeholder-en]"
  ).forEach(element => {
    element.placeholder = language === "bn"
      ? element.dataset.placeholderBn
      : element.dataset.placeholderEn;
  });

  // Re-render dropdowns dynamically based on current language
  renderDivisionOptions();
  renderDistrictOptions();
  renderAreaOptions();
}

function changeLanguage(language) {
  setLanguage(language);
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-language]");
  if (button) setLanguage(button.dataset.language);
});


/* 2. MOBILE MENU & TOGGLE HANDLER */

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menuButton");
  const menu = document.getElementById("menu");

  if (menuButton && menu) {
    menuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const opened = menu.classList.toggle("open");
      menu.classList.toggle("show", opened);
      menuButton.setAttribute("aria-expanded", String(opened));
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !menuButton.contains(e.target)) {
        menu.classList.remove("open", "show");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("open", "show");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }
});


/* 3. BANGLADESH LOCATION API */

const LOCATION_API = "https://bdapis.vercel.app/geo/v2.0";

let divisions = [];
let districts = [];
let upazilas = [];

let selectedDivision = "";
let selectedDistrict = "";


/* 4. CITY CORPORATIONS */

const cityCorporations = {
  "Dhaka": [
    { bn: "ঢাকা উত্তর সিটি কর্পোরেশন", en: "Dhaka North City Corporation" },
    { bn: "ঢাকা দক্ষিণ সিটি কর্পোরেশন", en: "Dhaka South City Corporation" }
  ],
  "Chattogram": [
    { bn: "চট্টগ্রাম সিটি কর্পোরেশন", en: "Chattogram City Corporation" }
  ],
  "Khulna": [
    { bn: "খুলনা সিটি কর্পোরেশন", en: "Khulna City Corporation" }
  ],
  "Rajshahi": [
    { bn: "রাজশাহী সিটি কর্পোরেশন", en: "Rajshahi City Corporation" }
  ],
  "Barishal": [
    { bn: "বরিশাল সিটি কর্পোরেশন", en: "Barishal City Corporation" }
  ],
  "Sylhet": [
    { bn: "সিলেট সিটি কর্পোরেশন", en: "Sylhet City Corporation" }
  ],
  "Rangpur": [
    { bn: "রংপুর সিটি কর্পোরেশন", en: "Rangpur City Corporation" }
  ],
  "Mymensingh": [
    { bn: "ময়মনসিংহ সিটি কর্পোরেশন", en: "Mymensingh City Corporation" }
  ],
  "Cumilla": [
    { bn: "কুমিল্লা সিটি কর্পোরেশন", en: "Cumilla City Corporation" }
  ],
  "Gazipur": [
    { bn: "গাজীপুর সিটি কর্পোরেশন", en: "Gazipur City Corporation" }
  ],
  "Narayanganj": [
    { bn: "নারায়ণগঞ্জ সিটি কর্পোরেশন", en: "Narayanganj City Corporation" }
  ],
  "Bogura": [
    { bn: "বগুড়া সিটি কর্পোরেশন", en: "Bogura City Corporation" }
  ]
};


/* 5. LOCATION HELPERS */

function getLocationArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  return [];
}

function getEnglishName(item) {
  return item.name ||
    item.en ||
    item.name_en ||
    item.division ||
    item.district ||
    item.upazila ||
    item.upazilla ||
    "";
}

function getBanglaName(item) {
  return item.bn_name ||
    item.bn ||
    item.name_bn ||
    item.divisionbn ||
    item.districtbn ||
    item.upazillabn ||
    item.upazill_bn ||
    getEnglishName(item);
}

function getLocationId(item) {
  return item.id ?? item._id ?? item.code ?? "";
}

function formatLocation(item) {
  const bn = getBanglaName(item);
  const en = getEnglishName(item);
  return currentLanguage === "bn" ? (bn || en) : (en || bn);
}

function formatCityCorporation(item) {
  return currentLanguage === "bn" ? (item.bn || item.en) : (item.en || item.bn);
}

async function fetchLocationData(endpoint) {
  try {
    const response = await fetch(`${LOCATION_API}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return getLocationArray(data);
  } catch (error) {
    console.error("API Fetch Error:", error);
    return [];
  }
}


/* 6. FILTER ELEMENTS */

function divisionSelect() {
  return document.getElementById("divisionSelect") ||
    document.getElementById("filterDivision") ||
    document.getElementById("divisionFilter");
}

function districtSelect() {
  return document.getElementById("districtSelect") ||
    document.getElementById("filterDistrict") ||
    document.getElementById("districtFilter");
}

function areaSelect() {
  return document.getElementById("areaSelect") ||
    document.getElementById("filterUpazila") ||
    document.getElementById("upazilaFilter");
}

function bloodGroupSelect() {
  return document.getElementById("bloodGroupSelect") ||
    document.getElementById("filterBloodGroup") ||
    document.getElementById("bloodGroupFilter");
}


/* 7. DROPDOWN OPTIONS */

function setSelectOptions(select, items, placeholder) {
  if (!select) return;

  const previousValue = select.value;
  select.innerHTML = "";

  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = placeholder;
  select.appendChild(firstOption);

  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    select.appendChild(option);
  });

  if ([...select.options].some(option => option.value === previousValue)) {
    select.value = previousValue;
  }
}

function renderDivisionOptions() {
  const select = divisionSelect();
  if (!select) return;

  setSelectOptions(
    select,
    divisions.map(item => ({
      value: getEnglishName(item),
      label: formatLocation(item)
    })),
    currentLanguage === "bn"
      ? "বিভাগ নির্বাচন করুন"
      : "Select Division"
  );
}

function renderDistrictOptions() {
  const select = districtSelect();
  if (!select) return;

  setSelectOptions(
    select,
    districts.map(item => ({
      value: getEnglishName(item),
      label: formatLocation(item)
    })),
    currentLanguage === "bn"
      ? "জেলা নির্বাচন করুন"
      : "Select District"
  );
}

function renderAreaOptions() {
  const select = areaSelect();
  if (!select) return;

  const items = upazilas.map(item => ({
    value: getEnglishName(item),
    label: formatLocation(item)
  }));

  (cityCorporations[selectedDistrict] || []).forEach(item => {
    items.push({
      value: item.en,
      label: formatCityCorporation(item)
    });
  });

  setSelectOptions(
    select,
    items,
    currentLanguage === "bn"
      ? "উপজেলা / সিটি কর্পোরেশন নির্বাচন করুন"
      : "Select Upazila / City Corporation"
  );
}


/* 8. LOAD DIVISIONS */

async function loadDivisions() {
  divisions = await fetchLocationData("/divisions");
  renderDivisionOptions();
  
  const status = document.getElementById("locationStatus");
  if (status) {
    status.textContent = currentLanguage === "bn" ? "ঠিকানা সফলভাবে লোড হয়েছে" : "Locations loaded successfully";
  }
}


/* 9. LOAD DISTRICTS */

async function loadDistricts(divisionName) {
  districts = [];
  upazilas = [];
  selectedDivision = divisionName;
  selectedDistrict = "";

  renderDistrictOptions();
  renderAreaOptions();

  const district = districtSelect();
  const area = areaSelect();

  if (district) district.disabled = true;
  if (area) area.disabled = true;

  if (!divisionName) {
    if (district) district.disabled = false;
    if (area) area.disabled = false;
    return;
  }

  const division = divisions.find(item =>
    getEnglishName(item).toLowerCase() === divisionName.toLowerCase()
  );

  if (!division) {
    if (district) district.disabled = false;
    if (area) area.disabled = false;
    return;
  }

  districts = await fetchLocationData(
    `/districts/${encodeURIComponent(getLocationId(division))}`
  );

  renderDistrictOptions();

  if (district) district.disabled = false;
  if (area) area.disabled = false;
}


/* 10. LOAD UPAZILAS */

async function loadUpazilas(districtName) {
  upazilas = [];
  selectedDistrict = districtName;

  renderAreaOptions();

  const area = areaSelect();
  if (area) area.disabled = true;

  if (!districtName) {
    if (area) area.disabled = false;
    return;
  }

  const district = districts.find(item =>
    getEnglishName(item).toLowerCase() === districtName.toLowerCase()
  );

  if (!district) {
    if (area) area.disabled = false;
    return;
  }

  upazilas = await fetchLocationData(
    `/upazilas/${encodeURIComponent(getLocationId(district))}`
  );

  renderAreaOptions();

  if (area) area.disabled = false;
}


/* 11. LOCATION EVENT LISTENERS */

function initializeLocationListeners() {
  const division = divisionSelect();
  const district = districtSelect();
  const area = areaSelect();
  const bloodGroup = bloodGroupSelect();

  if (division) {
    division.addEventListener("change", async () => {
      await loadDistricts(division.value);
    });
  }

  if (district) {
    district.addEventListener("change", async () => {
      await loadUpazilas(district.value);
    });
  }

  if (area) {
    area.addEventListener("change", filterBloodDonors);
  }

  if (bloodGroup) {
    bloodGroup.addEventListener("change", filterBloodDonors);
  }
}


/* 12. LOAD LOCATIONS */

async function loadLocations() {
  await loadDivisions();
  initializeLocationListeners();
}


/* 13. BLOOD DONOR FILTER */

function getBloodDonorFilters() {
  return {
    division: divisionSelect()?.value || "",
    district: districtSelect()?.value || "",
    upazila: areaSelect()?.value || "",
    blood_group: bloodGroupSelect()?.value || ""
  };
}

function filterBloodDonors() {
  const filters = getBloodDonorFilters();
  document.dispatchEvent(
    new CustomEvent("uvf:donor-filter-change", {
      detail: filters
    })
  );
}


/* 14. WEBSITE INITIALIZATION & START */

document.addEventListener("DOMContentLoaded", () => {
  setLanguage(currentLanguage);
  loadLocations();
});
