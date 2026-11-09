const locations = {
  "Dhaka": {
    bn: "ঢাকা",
    districts: {
      "Dhaka": {
        bn: "ঢাকা",
        upazilas: ["Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar"]
      },
      "Gazipur": {
        bn: "গাজীপুর",
        upazilas: ["Gazipur Sadar", "Kaliakair", "Kapasia", "Sreepur"]
      },
      "Narayanganj": {
        bn: "নারায়ণগঞ্জ",
        upazilas: ["Narayanganj Sadar", "Sonargaon", "Rupganj"]
      },
      "Tangail": {
        bn: "টাঙ্গাইল",
        upazilas: ["Tangail Sadar", "Mirzapur", "Kalihati"]
      }
    }
  },
  "Chattogram": {
    bn: "চট্টগ্রাম",
    districts: {
      "Chattogram": {
        bn: "চট্টগ্রাম",
        upazilas: ["Panchlaish", "Pahartali", "Hathazari", "Sitakunda", "Raozan"]
      },
      "Cox's Bazar": {
        bn: "কক্সবাজার",
        upazilas: ["Cox's Bazar Sadar", "Teknaf", "Ukhia", "Ramu"]
      },
      "Cumilla": {
        bn: "কুমিল্লা",
        upazilas: ["Cumilla Sadar", "Daudkandi", "Chandina", "Laksam"]
      },
      "Feni": {
        bn: "ফেনী",
        upazilas: ["Feni Sadar", "Daganbhuiyan", "Chhagalnaiya"]
      },
      "Noakhali": {
        bn: "নোয়াখালী",
        upazilas: ["Noakhali Sadar", "Begumganj", "Senbagh"]
      }
    }
  },
  "Rajshahi": {
    bn: "রাজশাহী",
    districts: {
      "Rajshahi": {
        bn: "রাজশাহী",
        upazilas: ["Boalia", "Rajpara", "Paba", "Godagari"]
      },
      "Bogura": {
        bn: "বগুড়া",
        upazilas: ["Bogura Sadar", "Sherpur", "Shibganj"]
      }
    }
  },
  "Khulna": {
    bn: "খুলনা",
    districts: {
      "Khulna": {
        bn: "খুলনা",
        upazilas: ["Khulna Sadar", "Dumuria", "Dighalia"]
      },
      "Jashore": {
        bn: "যশোর",
        upazilas: ["Jashore Sadar", "Manirampur", "Jhikargacha"]
      }
    }
  },
  "Barishal": {
    bn: "বরিশাল",
    districts: {
      "Barishal": {
        bn: "বরিশাল",
        upazilas: ["Barishal Sadar", "Bakerganj", "Babuganj"]
      }
    }
  },
  "Sylhet": {
    bn: "সিলেট",
    districts: {
      "Sylhet": {
        bn: "সিলেট",
        upazilas: ["Sylhet Sadar", "Beanibazar", "Golapganj"]
      }
    }
  },
  "Rangpur": {
    bn: "রংপুর",
    districts: {
      "Rangpur": {
        bn: "রংপুর",
        upazilas: ["Rangpur Sadar", "Mithapukur", "Pirgachha"]
      }
    }
  },
  "Mymensingh": {
    bn: "ময়মনসিংহ",
    districts: {
      "Mymensingh": {
        bn: "ময়মনসিংহ",
        upazilas: ["Mymensingh Sadar", "Trishal", "Bhaluka"]
      }
    }
  }
};

// English ও বাংলা নাম
function getBanglaUpazila(name) {
  const names = {
    "Dhamrai": "ধামরাই",
    "Dohar": "দোহার",
    "Keraniganj": "কেরানীগঞ্জ",
    "Savar": "সাভার",
    "Gazipur Sadar": "গাজীপুর সদর",
    "Panchlaish": "পাঁচলাইশ",
    "Pahartali": "পাহাড়তলী",
    "Hathazari": "হাটহাজারী",
    "Sitakunda": "সীতাকুণ্ড",
    "Raozan": "রাউজান",
    "Cox's Bazar Sadar": "কক্সবাজার সদর",
    "Teknaf": "টেকনাফ",
    "Ukhia": "উখিয়া",
    "Ramu": "রামু",
    "Cumilla Sadar": "কুমিল্লা সদর",
    "Feni Sadar": "ফেনী সদর",
    "Noakhali Sadar": "নোয়াখালী সদর"
  };
  return names[name] || name;
}

const division = document.getElementById("division");
const district = document.getElementById("district");
const upazila = document.getElementById("upazila");

function fillOptions(select, items, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;

  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    select.appendChild(option);
  });
}

// বিভাগ
fillOptions(
  division,
  Object.entries(locations).map(([key, value]) => ({
    value: key,
    label: `${value.bn} - ${key}`
  })),
  "সব বিভাগ"
);

// বিভাগ নির্বাচন
division.addEventListener("change", () => {
  district.disabled = !division.value;
  upazila.disabled = true;

  fillOptions(district, [], "সব জেলা");
  fillOptions(upazila, [], "আগে জেলা নির্বাচন করুন");

  if (!division.value) return;

  const districts = locations[division.value].districts;

  fillOptions(
    district,
    Object.entries(districts).map(([key, value]) => ({
      value: key,
      label: `${value.bn} - ${key}`
    })),
    "সব জেলা"
  );
});

// জেলা নির্বাচন
district.addEventListener("change", () => {
  upazila.disabled = !district.value;

  fillOptions(upazila, [], "সব উপজেলা / সিটি কর্পোরেশন");

  if (!district.value) return;

  const list = locations[division.value]
    .districts[district.value].upazilas;

  fillOptions(
    upazila,
    list.map(name => ({
      value: name,
      label: `${getBanglaUpazila(name)} - ${name}`
    })),
    "সব উপজেলা / সিটি কর্পোরেশন"
  );
});

// ডেমো রক্তদাতা
const donors = [
  {
    name: "মোঃ আব্দুল্লাহ",
    blood: "A+",
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Savar",
    phone: "01700000001"
  },
  {
    name: "মোঃ হাসান",
    blood: "B+",
    division: "Chattogram",
    district: "Chattogram",
    upazila: "Panchlaish",
    phone: "01700000002"
  },
  {
    name: "মোঃ রাকিব",
    blood: "O+",
    division: "Chattogram",
    district: "Cox's Bazar",
    upazila: "Teknaf",
    phone: "01700000003"
  },
  {
    name: "মোঃ সাকিব",
    blood: "AB+",
    division: "Dhaka",
    district: "Gazipur",
    upazila: "Gazipur Sadar",
    phone: "01700000004"
  },
  {
    name: "মোঃ ইমরান",
    blood: "A-",
    division: "Rajshahi",
    district: "Rajshahi",
    upazila: "Paba",
    phone: "01700000005"
  },
  {
    name: "মোঃ সোহেল",
    blood: "B-",
    division: "Khulna",
    district: "Khulna",
    upazila: "Dumuria",
    phone: "01700000006"
  },
  {
    name: "মোঃ আরিফ",
    blood: "O-",
    division: "Sylhet",
    district: "Sylhet",
    upazila: "Beanibazar",
    phone: "01700000007"
  },
  {
    name: "মোঃ নাঈম",
    blood: "AB-",
    division: "Barishal",
    district: "Barishal",
    upazila: "Bakerganj",
    phone: "01700000008"
  },
  {
    name: "মোঃ রিয়াদ",
    blood: "A+",
    division: "Mymensingh",
    district: "Mymensingh",
    upazila: "Trishal",
    phone: "01700000009"
  }
];

const results = document.getElementById("results");

document.getElementById("searchBtn").addEventListener("click", () => {
  const selectedDivision = division.value;
  const selectedDistrict = district.value;
  const selectedUpazila = upazila.value;
  const selectedBlood = document.getElementById("blood").value;

  const filtered = donors.filter(donor =>
    (!selectedDivision || donor.division === selectedDivision) &&
    (!selectedDistrict || donor.district === selectedDistrict) &&
    (!selectedUpazila || donor.upazila === selectedUpazila) &&
    (!selectedBlood || donor.blood === selectedBlood)
  );

  document.getElementById("searchCount").textContent =
    `মোট ${filtered.length} জন রক্তদাতা পাওয়া গেছে`;

  if (!filtered.length) {
    results.innerHTML = `
      <div class="search-symbol">⌕</div>
      <h3>কোনো রক্তদাতা পাওয়া যায়নি</h3>
      <p>অন্য এলাকা অথবা রক্তের গ্রুপ দিয়ে চেষ্টা করুন।</p>
    `;
    return;
  }

  results.innerHTML = `
    <div class="donor-list">
      ${filtered.map(donor => `
        <div class="donor-item">
          <h3>${donor.name}</h3>
          <span class="blood-badge">${donor.blood}</span>
          <p>
            ${locations[donor.division].bn} -
            ${locations[donor.division].districts[donor.district].bn}
          </p>
          <p>${getBanglaUpazila(donor.upazila)}</p>
          <a href="tel:${donor.phone}">যোগাযোগ করুন →</a>
        </div>
      `).join("")}
    </div>
  `;
});

// মোবাইল মেনু
document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("nav").classList.toggle("show");
});

// ডেমো নিবন্ধন ফর্ম
document.getElementById("demoForm").addEventListener("submit", event => {
  event.preventDefault();
  document.getElementById("formMessage").textContent =
    "এটি ডেমো ফর্ম। পরবর্তীতে ডাটাবেস যুক্ত হলে নিবন্ধন কার্যকর হবে।";
});

// বর্তমান বছর
document.getElementById("year").textContent =
  new Date().getFullYear();
