
/* =====================================================
   UNITED VOLUNTEERS FOUNDATION
   PUBLIC WEBSITE SCRIPT
   Language + Menu + Bangladesh Location
===================================================== */


/* 1. LANGUAGE SYSTEM */

let currentLanguage =
  localStorage.getItem("uvf_language") || "bn";

if (!["bn", "en"].includes(currentLanguage)) {
  currentLanguage = "bn";
}

function setLanguage(language) {

  if (!["bn", "en"].includes(language)) return;

  currentLanguage = language;

  localStorage.setItem("uvf_language", language);

  document.documentElement.lang = language;

  document.querySelectorAll("[data-bn][data-en]").forEach(element => {

    element.textContent =
      language === "bn"
        ? element.dataset.bn
        : element.dataset.en;

  });

  document.querySelectorAll(
    "[data-placeholder-bn][data-placeholder-en]"
  ).forEach(element => {

    element.placeholder =
      language === "bn"
        ? element.dataset.placeholderBn
        : element.dataset.placeholderEn;

  });

  document.getElementById("bnButton")
    ?.classList.toggle("active", language === "bn");

  document.getElementById("enButton")
    ?.classList.toggle("active", language === "en");

  renderDivisionOptions();
  renderDistrictOptions();
  renderAreaOptions();

  updateLocationStatus();

  updateDonorMessage();

}


/* 2. LANGUAGE BUTTONS */

document.addEventListener("click", event => {

  const button = event.target.closest("[data-language]");

  if (button) {
    setLanguage(button.dataset.language);
  }

});


/* 3. MOBILE MENU */

document.addEventListener("DOMContentLoaded", () => {

  const menuButton = document.getElementById("menuButton");
  const menu = document.getElementById("menu");

  if (!menuButton || !menu) return;

  function closeMenu() {

    menu.classList.remove("show");

    menuButton.setAttribute("aria-expanded", "false");

  }

  menuButton.addEventListener("click", event => {

    event.stopPropagation();

    const opened = menu.classList.toggle("show");

    menuButton.setAttribute(
      "aria-expanded",
      String(opened)
    );

  });

  menu.addEventListener("click", event => {
    event.stopPropagation();
  });

  document.addEventListener("click", event => {

    if (
      !menu.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }

  });

  menu.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", closeMenu);

  });

});


/* 4. MENU ACTIVE LINK */

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".menu-link").forEach(link => {

    link.addEventListener("click", () => {

      document.querySelectorAll(".menu-link")
        .forEach(item => item.classList.remove("active"));

      if (link.getAttribute("href")?.startsWith("#")) {
        link.classList.add("active");
      }

    });

  });

});


/* 5. BANGLADESH LOCATION API */

const LOCATION_API = "https://bdapis.vercel.app/geo/v2.0";

let divisions = [];
let districts = [];
let upazilas = [];

let selectedDistrict = "";

let locationsLoaded = false;


/* 6. CITY CORPORATIONS */

const cityCorporations = {

  Dhaka: [
    {
      bn: "ঢাকা উত্তর সিটি কর্পোরেশন",
      en: "Dhaka North City Corporation"
    },
    {
      bn: "ঢাকা দক্ষিণ সিটি কর্পোরেশন",
      en: "Dhaka South City Corporation"
    }
  ],

  Chattogram: [
    {
      bn: "চট্টগ্রাম সিটি কর্পোরেশন",
      en: "Chattogram City Corporation"
    }
  ],

  Khulna: [
    {
      bn: "খুলনা সিটি কর্পোরেশন",
      en: "Khulna City Corporation"
    }
  ],

  Rajshahi: [
    {
      bn: "রাজশাহী সিটি কর্পোরেশন",
      en: "Rajshahi City Corporation"
    }
  ],

  Barishal: [
    {
      bn: "বরিশাল সিটি কর্পোরেশন",
      en: "Barishal City Corporation"
    }
  ],

  Sylhet: [
    {
      bn: "সিলেট সিটি কর্পোরেশন",
      en: "Sylhet City Corporation"
    }
  ],

  Rangpur: [
    {
      bn: "রংপুর সিটি কর্পোরেশন",
      en: "Rangpur City Corporation"
    }
  ],

  Mymensingh: [
    {
      bn: "ময়মনসিংহ সিটি কর্পোরেশন",
      en: "Mymensingh City Corporation"
    }
  ],

  Cumilla: [
    {
      bn: "কুমিল্লা সিটি কর্পোরেশন",
      en: "Cumilla City Corporation"
    }
  ],

  Gazipur: [
    {
      bn: "গাজীপুর সিটি কর্পোরেশন",
      en: "Gazipur City Corporation"
    }
  ],

  Narayanganj: [
    {
      bn: "নারায়ণগঞ্জ সিটি কর্পোরেশন",
      en: "Narayanganj City Corporation"
    }
  ]

};


/* 7. LOCATION HELPERS */

function getLocationArray(response) {

  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;

  if (Array.isArray(response?.result)) return response.result;

  return [];

}


function getEnglishName(item) {

  return (
    item.name ||
    item.en ||
    item.name_en ||
    item.division ||
    item.district ||
    item.upazila ||
    item.upazilla ||
    ""
  );

}


function getBanglaName(item) {

  return (
    item.bn_name ||
    item.bn ||
    item.name_bn ||
    item.divisionbn ||
    item.districtbn ||
    item.upazillabn ||
    item.upazill_bn ||
    getEnglishName(item)
  );

}


function getLocationId(item) {

  return item.id ?? item._id ?? item.code ?? "";

}


function formatLocation(item) {

  const bn = getBanglaName(item);
  const en = getEnglishName(item);

  return currentLanguage === "bn"
    ? (bn || en)
    : (en || bn);

}


/* 8. FETCH LOCATION DATA */

async function fetchLocationData(endpoint) {

  try {

    const response = await fetch(
      `${LOCATION_API}${endpoint}`
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    return getLocationArray(data);

  } catch (error) {

    console.error("Location API Error:", error);

    return [];

  }

}


/* 9. SELECT ELEMENTS */

function divisionSelect() {
  return document.getElementById("divisionSelect");
}

function districtSelect() {
  return document.getElementById("districtSelect");
}

function areaSelect() {
  return document.getElementById("areaSelect");
}

function bloodGroupSelect() {
  return document.getElementById("bloodGroupSelect");
}


/* 10. DROPDOWN BUILDER */

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

  if (
    [...select.options].some(
      option => option.value === previousValue
    )
  ) {
    select.value = previousValue;
  }

}


/* 11. RENDER DIVISIONS */

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


/* 12. RENDER DISTRICTS */

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


/* 13. RENDER UPAZILAS */

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
      label: currentLanguage === "bn"
        ? item.bn
        : item.en
    });

  });

  setSelectOptions(

    select,

    items,

    currentLanguage === "bn"
      ? "এলাকা নির্বাচন করুন"
      : "Select Area"

  );

}


/* 14. LOCATION STATUS */

function updateLocationStatus() {

  const status = document.getElementById("locationStatus");

  if (!status) return;

  if (!locationsLoaded) {

    status.textContent = currentLanguage === "bn"
      ? "ঠিকানা লোড হচ্ছে..."
      : "Loading locations...";

    return;

  }

  status.textContent = currentLanguage === "bn"
    ? "ঠিকানা সফলভাবে লোড হয়েছে"
    : "Locations loaded successfully";

}


/* 15. LOAD DIVISIONS */

async function loadDivisions() {

  const status = document.getElementById("locationStatus");

  if (status) {
    status.textContent = currentLanguage === "bn"
      ? "ঠিকানা লোড হচ্ছে..."
      : "Loading locations...";
  }

  divisions = await fetchLocationData("/divisions");

  renderDivisionOptions();

  locationsLoaded = divisions.length > 0;

  updateLocationStatus();

  if (!locationsLoaded && status) {

    status.textContent = currentLanguage === "bn"
      ? "ঠিকানা লোড হয়নি। ইন্টারনেট পরীক্ষা করুন।"
      : "Could not load locations. Check your internet.";

  }

}


/* 16. LOAD DISTRICTS */

async function loadDistricts(divisionName) {

  districts = [];
  upazilas = [];

  selectedDistrict = "";

  renderDistrictOptions();
  renderAreaOptions();

  const district = districtSelect();
  const area = areaSelect();

  if (district) district.disabled = true;
  if (area) area.disabled = true;

  if (!divisionName) return;

  const division = divisions.find(item =>
    getEnglishName(item).toLowerCase() ===
    divisionName.toLowerCase()
  );

  if (!division) return;

  const id = getLocationId(division);

  if (!id) {
    console.error("Division ID not found");
    return;
  }

  districts = await fetchLocationData(
    `/districts/${encodeURIComponent(id)}`
  );

  renderDistrictOptions();

  if (district) district.disabled = false;

}


/* 17. LOAD UPAZILAS */

async function loadUpazilas(districtName) {

  upazilas = [];

  selectedDistrict = districtName;

  renderAreaOptions();

  const area = areaSelect();

  if (area) area.disabled = true;

  if (!districtName) return;

  const district = districts.find(item =>
    getEnglishName(item).toLowerCase() ===
    districtName.toLowerCase()
  );

  if (!district) return;

  const id = getLocationId(district);

  if (!id) {
    console.error("District ID not found");
    return;
  }

  upazilas = await fetchLocationData(
    `/upazilas/${encodeURIComponent(id)}`
  );

  renderAreaOptions();

  if (area) area.disabled = false;

}


/* 18. FILTER DATA */

function getBloodDonorFilters() {

  return {

    division: divisionSelect()?.value || "",

    district: districtSelect()?.value || "",

    upazila: areaSelect()?.value || "",

    blood_group: bloodGroupSelect()?.value || ""

  };

}


/* 19. DONOR FILTER EVENT */

function filterBloodDonors() {

  const filters = getBloodDonorFilters();

  document.dispatchEvent(

    new CustomEvent("uvf:donor-filter-change", {
      detail: filters
    })

  );

}


/* 20. DONOR MESSAGE */

function updateDonorMessage() {

  const results = document.getElementById("donorResults");

  if (!results) return;

  results.innerHTML = "";

  const box = document.createElement("div");
  box.className = "empty-result";

  const icon = document.createElement("span");
  icon.textContent = "🩸";

  const message = document.createElement("p");

  message.textContent = currentLanguage === "bn"
    ? "রক্তদাতার তথ্য দেখতে অনুসন্ধান করুন।"
    : "Search to find blood donor information.";

  box.append(icon, message);

  results.appendChild(box);

}


/* 21. DONOR SEARCH BUTTON */

function initializeDonorSearch() {

  const button = document.getElementById("donorSearchButton");

  if (!button) return;

  button.addEventListener("click", () => {

    const filters = getBloodDonorFilters();

    filterBloodDonors();

    const results = document.getElementById("donorResults");

    if (!results) return;

    results.innerHTML = "";

    const box = document.createElement("div");
    box.className = "empty-result";

    const icon = document.createElement("span");
    icon.textContent = "🩸";

    const message = document.createElement("p");

    message.textContent = currentLanguage === "bn"
      ? "অনুসন্ধানের তথ্য প্রস্তুত। প্রকৃত রক্তদাতার ফলাফল পেতে ডেটাবেজ সংযুক্ত করতে হবে।"
      : "Search filters are ready. Connect the database to display actual donor results.";

    box.append(icon, message);

    results.appendChild(box);

  });

}


/* 22. LOCATION EVENT LISTENERS */

function initializeLocationListeners() {

  const division = divisionSelect();
  const district = districtSelect();
  const area = areaSelect();
  const bloodGroup = bloodGroupSelect();

  if (division) {

    division.addEventListener("change", async () => {

      await loadDistricts(division.value);

      filterBloodDonors();

    });

  }

  if (district) {

    district.addEventListener("change", async () => {

      await loadUpazilas(district.value);

      filterBloodDonors();

    });

  }

  if (area) {

    area.addEventListener("change", filterBloodDonors);

  }

  if (bloodGroup) {

    bloodGroup.addEventListener("change", filterBloodDonors);

  }

}


/* 23. FOOTER YEAR */

function updateFooterYear() {

  const year = document.getElementById("currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

}


/* 24. INITIALIZE WEBSITE */

document.addEventListener("DOMContentLoaded", async () => {

  setLanguage(currentLanguage);

  initializeLocationListeners();

  initializeDonorSearch();

  updateFooterYear();

  await loadDivisions();

});
