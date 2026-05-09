const modelInput = document.getElementById("model-input");
const fuelInput = document.getElementById("fuel-input");
const variantInput = document.getElementById("variant-input");
const resetButton = document.getElementById("reset-button");

const modelOptions = document.getElementById("model-options");
const fuelOptions = document.getElementById("fuel-options");
const variantOptions = document.getElementById("variant-options");

const totalRecords = document.getElementById("total-records");
const matchCount = document.getElementById("match-count");
const matchList = document.getElementById("match-list");

const resultTitle = document.getElementById("result-title");
const resultChip = document.getElementById("result-chip");
const recordNote = document.getElementById("record-note");

const detailTargets = {
  exShowroom: document.getElementById("ex-showroom"),
  onRoadBasic: document.getElementById("on-road-basic"),
  onRoadValue: document.getElementById("on-road-value"),
  fuelType: document.getElementById("fuel-type"),
  transmissionType: document.getElementById("transmission-type"),
  roadTax: document.getElementById("road-tax"),
  tcs: document.getElementById("tcs"),
  insurance: document.getElementById("insurance"),
  fastag: document.getElementById("fastag"),
  leKit: document.getElementById("le-kit"),
  miscCharges: document.getElementById("misc-charges"),
  extendedWarranty: document.getElementById("extended-warranty"),
  accessoryKit: document.getElementById("accessory-kit"),
  dashCam: document.getElementById("dash-cam"),
  glossStudio: document.getElementById("gloss-studio")
};

const records = window.CAR_DATA ?? [];
totalRecords.textContent = `${records.length} variants`;

function formatPrice(value) {
  return value && value !== "0" ? `Rs. ${value}` : value === "0" ? "Rs. 0" : "-";
}

function uniqueValues(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function isValidOption(value, options) {
  return !value || options.includes(value);
}

function buildOptions(datalist, values) {
  datalist.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    datalist.appendChild(option);
  });
}

function getFilteredRecords() {
  return records.filter((record) => {
    const matchesModel = !modelInput.value || record.modelName === modelInput.value;
    const matchesFuel = !fuelInput.value || record.fuelType === fuelInput.value;
    const matchesVariant = !variantInput.value || record.variant === variantInput.value;
    return matchesModel && matchesFuel && matchesVariant;
  });
}

function normalizeSingleChoiceFuel(availableFuels) {
  if (availableFuels.length === 1) {
    fuelInput.value = availableFuels[0];
    fuelInput.placeholder = `Only ${availableFuels[0]}`;
    return;
  }

  if (!availableFuels.length) {
    fuelInput.value = "";
    fuelInput.placeholder = "Choose fuel type";
    return;
  }

  fuelInput.placeholder = "Choose fuel type";
}

function syncAvailableOptions() {
  const availableModels = uniqueValues(records.map((record) => record.modelName));
  const availableFuels = uniqueValues(
    records
      .filter((record) => !modelInput.value || record.modelName === modelInput.value)
      .map((record) => record.fuelType)
  );
  const availableVariants = uniqueValues(
    records
      .filter((record) => (!modelInput.value || record.modelName === modelInput.value))
      .filter((record) => (!fuelInput.value || record.fuelType === fuelInput.value))
      .map((record) => record.variant)
  );

  if (!isValidOption(modelInput.value, availableModels)) {
    modelInput.value = "";
  }

  if (!isValidOption(fuelInput.value, availableFuels)) {
    fuelInput.value = "";
  }

  normalizeSingleChoiceFuel(availableFuels);

  if (!isValidOption(variantInput.value, availableVariants)) {
    variantInput.value = "";
  }

  buildOptions(modelOptions, availableModels);
  buildOptions(fuelOptions, availableFuels);
  buildOptions(variantOptions, availableVariants);
}

function renderMatches(filteredRecords) {
  matchCount.textContent = String(filteredRecords.length);
  matchList.innerHTML = "";

  if (!filteredRecords.length) {
    const empty = document.createElement("div");
    empty.className = "side-pill";
    empty.innerHTML = "<strong>No matching record</strong><span>Try resetting the filters.</span>";
    matchList.appendChild(empty);
    return;
  }

  filteredRecords.slice(0, 12).forEach((record) => {
    const pill = document.createElement("div");
    pill.className = "side-pill";
    pill.innerHTML = `
      <strong>${record.modelName} • ${record.variant}</strong>
      <span>${record.fuelType} • ${record.transmissionType} • On road ${formatPrice(record.onRoadBasic)}</span>
    `;
    matchList.appendChild(pill);
  });
}

function renderRecord(record) {
  if (!record) {
    resultTitle.textContent = "Choose a car to view pricing";
    resultChip.textContent = "Waiting for selection";
    recordNote.textContent = "Pick a matching record to see the complete price breakup.";

    Object.values(detailTargets).forEach((target) => {
      target.textContent = "-";
    });
    return;
  }

  resultTitle.textContent = `${record.modelName} ${record.variant}`;
  resultChip.textContent = `${record.fuelType} • ${record.transmissionType}`;
  recordNote.textContent = record.note || "Price details loaded from dataset.";

  detailTargets.exShowroom.textContent = formatPrice(record.exShowroom);
  detailTargets.onRoadBasic.textContent = formatPrice(record.onRoadBasic);
  detailTargets.onRoadValue.textContent = formatPrice(record.onRoadValue);
  detailTargets.fuelType.textContent = record.fuelType;
  detailTargets.transmissionType.textContent = record.transmissionType;
  detailTargets.roadTax.textContent = formatPrice(record.roadTax);
  detailTargets.tcs.textContent = formatPrice(record.tcs);
  detailTargets.insurance.textContent = formatPrice(record.insurance);
  detailTargets.fastag.textContent = formatPrice(record.fastag);
  detailTargets.leKit.textContent = formatPrice(record.leKit);
  detailTargets.miscCharges.textContent = formatPrice(record.miscCharges);
  detailTargets.extendedWarranty.textContent = formatPrice(record.extendedWarranty);
  detailTargets.accessoryKit.textContent = formatPrice(record.accessoryKit);
  detailTargets.dashCam.textContent = formatPrice(record.dashCam);
  detailTargets.glossStudio.textContent = formatPrice(record.glossStudio);
}

function updateUI() {
  syncAvailableOptions();
  const filteredRecords = getFilteredRecords();
  renderMatches(filteredRecords);

  const exactMatch = filteredRecords.length === 1
    ? filteredRecords[0]
    : filteredRecords.find((record) => record.variant === variantInput.value);

  renderRecord(exactMatch || null);
}

[modelInput, fuelInput, variantInput].forEach((input) => {
  input.addEventListener("input", updateUI);
  input.addEventListener("change", updateUI);
});

resetButton.addEventListener("click", () => {
  modelInput.value = "";
  fuelInput.value = "";
  variantInput.value = "";
  updateUI();
});

updateUI();
