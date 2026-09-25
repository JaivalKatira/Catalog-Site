// ---- Phone input (country code selector) ----
const phoneInput = document.querySelector("#phone");
const iti = window.intlTelInput(phoneInput, {
  initialCountry: "auto",
  geoIpLookup: function (callback) {
    fetch("https://ipapi.co/json")
      .then((res) => res.json())
      .then((data) => callback(data.country_code))
      .catch(() => callback("us"));
  },
  utilsScript:
    "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
});

// ---- Elements ----
const form = document.getElementById("leadForm");
const submitBtn = document.getElementById("submitBtn");
const formNote = document.getElementById("formNote");
const formStep = document.getElementById("formStep");
const downloadStep = document.getElementById("downloadStep");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");

// ---- Validation ----
function isValidEmail(value) {
  // Simple, practical email check (not a full RFC5322 parser)
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function clearErrors() {
  [nameError, emailError, phoneError].forEach((el) => (el.textContent = ""));
  [nameInput, emailInput, phoneInput].forEach((el) =>
    el.classList.remove("invalid")
  );
  formNote.textContent = "";
}

function validate() {
  clearErrors();
  let valid = true;

  if (!nameInput.value.trim()) {
    nameError.textContent = "Enter your name.";
    nameInput.classList.add("invalid");
    valid = false;
  }

  if (!isValidEmail(emailInput.value.trim())) {
    emailError.textContent = "Enter a valid email address.";
    emailInput.classList.add("invalid");
    valid = false;
  }

  if (!iti.isValidNumber()) {
    phoneError.textContent = "Enter a valid phone number for the selected country.";
    phoneInput.classList.add("invalid");
    valid = false;
  }

  return valid;
}

// ---- Submit to Supabase ----
async function saveLead({ name, email, phone }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify([{ name, email, phone }]),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase insert failed (${res.status}): ${text}`);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) return;

  submitBtn.disabled = true;
  submitBtn.querySelector(".btnLabel").textContent = "Submitting…";

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: iti.getNumber(), // full E.164 number, e.g. +14155552671
  };

  try {
    await saveLead(payload);
    formStep.classList.add("hidden");
    downloadStep.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    formNote.textContent =
      "Something went wrong saving your details. Please try again.";
    submitBtn.disabled = false;
    submitBtn.querySelector(".btnLabel").textContent = "Continue";
  }
});
