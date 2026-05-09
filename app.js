const modelInput = document.getElementById("model-input");
const fuelInput = document.getElementById("fuel-input");
const hybridToneInput = document.getElementById("hybrid-tone-input");
const variantInput = document.getElementById("variant-input");
const resetButton = document.getElementById("reset-button");

const hybridToneField = document.getElementById("hybrid-tone-field");
const hybridToneLabel = document.getElementById("hybrid-tone-label");

const totalRecords = document.getElementById("total-records");
const matchCount = document.getElementById("match-count");
const filtersMatchCount = document.getElementById("filters-match-count");
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
const filterInputs = [modelInput, fuelInput, hybridToneInput, variantInput];

totalRecords.textContent = `${records.length} variants`;

function formatPrice(value) {
  return value && value !== "0" ? `Rs. ${value}` : value === "0" ? "Rs. 0" : "-";
}

function formatMatchLabel(count) {
  return `${count} ${count === 1 ? "match" : "matches"}`;
}

function uniqueValues(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function isValidOption(value, options) {
  return !value || options.includes(value);
}

function getPlaceholder(select, fallback) {
  return select.dataset.placeholder || fallback;
}

function buildOptions(select, values, placeholder) {
  const currentValue = select.value;
  select.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  placeholderOption.disabled = values.length > 0;
  placeholderOption.hidden = values.length > 0;
  select.appendChild(placeholderOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  select.value = isValidOption(currentValue, values) ? currentValue : "";

  if (!select.value) {
    placeholderOption.selected = true;
  }
}

function syncSelect(select, values, fallbackPlaceholder) {
  const placeholder = getPlaceholder(select, fallbackPlaceholder);
  buildOptions(select, values, placeholder);

  if (values.length === 1) {
    select.value = values[0];
    select.options[0].textContent = `Only ${values[0]}`;
    return;
  }

  select.options[0].textContent = placeholder;
}

function getSpecialFilterConfig() {
  const isHyryder = modelInput.value.toLowerCase().includes("hyryder");

  if (!isHyryder) {
    return null;
  }

  if (fuelInput.value === "Hybrid") {
    return {
      label: "Normal or Dual Tone Hybrid",
      placeholder: "Choose hybrid type",
      property: "hybridToneType"
    };
  }

  if (fuelInput.value === "Petrol") {
    return {
      label: "Neo Drive MT AT Dual Tone, etc",
      placeholder: "Choose petrol type",
      property: "petrolDriveType"
    };
  }

  return null;
}

function getFilteredRecords() {
  const specialFilterConfig = getSpecialFilterConfig();
  const hasAnySelection = Boolean(
    modelInput.value || fuelInput.value || hybridToneInput.value || variantInput.value
  );

  if (!hasAnySelection) {
    return [];
  }

  return records.filter((record) => {
    const matchesModel = !modelInput.value || record.modelName === modelInput.value;
    const matchesFuel = !fuelInput.value || record.fuelType === fuelInput.value;
    const matchesSpecialFilter = !specialFilterConfig
      || !hybridToneInput.value
      || record[specialFilterConfig.property] === hybridToneInput.value;
    const matchesVariant = !variantInput.value || record.variant === variantInput.value;

    return matchesModel && matchesFuel && matchesSpecialFilter && matchesVariant;
  });
}

function syncHybridToneField(availableHybridToneTypes, specialFilterConfig) {
  const showHybridTone = Boolean(specialFilterConfig);
  hybridToneField.classList.toggle("is-hidden", !showHybridTone);

  if (!showHybridTone || !specialFilterConfig) {
    hybridToneInput.value = "";
    hybridToneInput.dataset.placeholder = "Choose hybrid type";
    hybridToneLabel.textContent = "Normal or Dual Tone Hybrid";
    syncSelect(hybridToneInput, [], "Choose hybrid type");
    return;
  }

  hybridToneLabel.textContent = specialFilterConfig.label;
  hybridToneInput.dataset.placeholder = specialFilterConfig.placeholder;
  syncSelect(hybridToneInput, availableHybridToneTypes, specialFilterConfig.placeholder);
}

function syncAvailableOptions() {
  const availableModels = uniqueValues(records.map((record) => record.modelName));

  if (!isValidOption(modelInput.value, availableModels)) {
    modelInput.value = "";
  }

  syncSelect(modelInput, availableModels, "Choose model");

  const hasModelSelection = Boolean(modelInput.value);
  fuelInput.dataset.placeholder = hasModelSelection
    ? "Choose fuel type"
    : "Select previous filter first";
  const availableFuels = hasModelSelection
    ? uniqueValues(
      records
        .filter((record) => record.modelName === modelInput.value)
        .map((record) => record.fuelType)
    )
    : [];

  if (!isValidOption(fuelInput.value, availableFuels)) {
    fuelInput.value = "";
  }

  syncSelect(fuelInput, availableFuels, "Choose fuel type");

  const refreshedSpecialFilterConfig = getSpecialFilterConfig();
  const hasFuelSelection = Boolean(modelInput.value && fuelInput.value);
  const availableHybridToneTypes = hasFuelSelection
    ? uniqueValues(
      records
        .filter((record) => record.modelName === modelInput.value)
        .filter((record) => record.fuelType === fuelInput.value)
        .map((record) => refreshedSpecialFilterConfig ? record[refreshedSpecialFilterConfig.property] : null)
        .filter(Boolean)
    )
    : [];

  if (
    refreshedSpecialFilterConfig
    && !isValidOption(hybridToneInput.value, availableHybridToneTypes)
  ) {
    hybridToneInput.value = "";
  }

  if (refreshedSpecialFilterConfig) {
    hybridToneInput.dataset.placeholder = hasFuelSelection
      ? refreshedSpecialFilterConfig.placeholder
      : "Select previous filter first";
  }

  syncHybridToneField(availableHybridToneTypes, refreshedSpecialFilterConfig);

  const needsSpecialFilterSelection = Boolean(
    refreshedSpecialFilterConfig && availableHybridToneTypes.length > 0 && !hybridToneInput.value
  );
  const canShowVariants = hasFuelSelection && !needsSpecialFilterSelection;
  let variantPlaceholder = "Choose variant";

  if (!hasModelSelection) {
    variantPlaceholder = "Select previous filter first";
  } else if (!hasFuelSelection) {
    variantPlaceholder = "Select previous filter first";
  } else if (needsSpecialFilterSelection) {
    variantPlaceholder = "Select previous filter first";
  }

  variantInput.dataset.placeholder = variantPlaceholder;
  const availableVariants = canShowVariants
    ? uniqueValues(
      records
        .filter((record) => record.modelName === modelInput.value)
        .filter((record) => record.fuelType === fuelInput.value)
        .filter((record) => (
          !refreshedSpecialFilterConfig
          || record[refreshedSpecialFilterConfig.property] === hybridToneInput.value
        ))
        .map((record) => record.variant)
    )
    : [];

  if (!isValidOption(variantInput.value, availableVariants)) {
    variantInput.value = "";
  }

  syncSelect(variantInput, availableVariants, variantPlaceholder);
}

function renderMatches(filteredRecords) {
  matchCount.textContent = String(filteredRecords.length);
  filtersMatchCount.textContent = String(filteredRecords.length);
  matchList.innerHTML = "";

  if (!filteredRecords.length) {
    const empty = document.createElement("div");
    empty.className = "side-pill";
    empty.innerHTML = "<strong>No matching record</strong><span>Try adjusting any filter.</span>";
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

filterInputs.forEach((input) => {
  input.addEventListener("change", updateUI);
});

resetButton.addEventListener("click", () => {
  filterInputs.forEach((input) => {
    input.value = "";
  });
  updateUI();
});

updateUI();
