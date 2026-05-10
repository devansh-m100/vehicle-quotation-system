const modelInput = document.getElementById("model-input");
const fuelInput = document.getElementById("fuel-input");
const hybridToneInput = document.getElementById("hybrid-tone-input");
const variantInput = document.getElementById("variant-input");
const resetButton = document.getElementById("reset-button");
const downloadImageButton = document.getElementById("download-image-button");
const downloadPdfButton = document.getElementById("download-pdf-button");
const shareImageButton = document.getElementById("share-image-button");
const sharePdfButton = document.getElementById("share-pdf-button");

const hybridToneField = document.getElementById("hybrid-tone-field");
const hybridToneLabel = document.getElementById("hybrid-tone-label");

const totalRecords = document.getElementById("total-records");
const matchCount = document.getElementById("match-count");
const filtersMatchCount = document.getElementById("filters-match-count");
const filtersHeadingMatchCount = document.getElementById("filters-heading-match-count");
const matchList = document.getElementById("match-list");

const quickQuoteLine = document.getElementById("quick-quote-line");
const resultTitle = document.getElementById("result-title");
const recordNote = document.getElementById("record-note");
const resultCard = document.querySelector(".quotation-sheet");
const quotationDate = document.getElementById("quotation-date");

const detailTargets = {
  breakdownTransmission: document.getElementById("breakdown-transmission"),
  exShowroom: document.getElementById("ex-showroom"),
  onRoadBasic: document.getElementById("on-road-basic"),
  onRoadBasicRow: document.getElementById("on-road-basic-row"),
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
let selectedRecord = null;

totalRecords.textContent = `${records.length} variants`;
quotationDate.textContent = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric"
}).format(new Date());

function formatPrice(value) {
  return value && value !== "0" ? `₹${value}` : value === "0" ? "₹0" : "-";
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

  if (!hasModelSelection || !hasFuelSelection || needsSpecialFilterSelection) {
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
  filtersHeadingMatchCount.textContent = String(filteredRecords.length);
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
      <strong>${record.modelName} | ${record.variant}</strong>
      <span>${record.fuelType} | ${record.transmissionType} | On road ${formatPrice(record.onRoadBasic)}</span>
    `;
    matchList.appendChild(pill);
  });
}

function createFileSafeName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildExportFileName(record) {
  return `${createFileSafeName(record.modelName)}-${createFileSafeName(record.variant)}`;
}

function setExportButtonsDisabled(disabled) {
  [downloadImageButton, downloadPdfButton, shareImageButton, sharePdfButton].forEach((button) => {
    button.disabled = disabled;
  });
}

async function captureSelectedCarCard(scale = 2) {
  if (!selectedRecord) {
    throw new Error("Select a car before exporting.");
  }

  if (!window.html2canvas) {
    throw new Error("Image export library not available.");
  }

  return window.html2canvas(resultCard, {
    backgroundColor: "#f8f5ef",
    scale,
    useCORS: true,
    ignoreElements: (element) => element.classList?.contains("export-actions")
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function exportSelectedCarAsImage() {
  const canvas = await captureSelectedCarCard(1.3);
  const filename = `${buildExportFileName(selectedRecord)}.jpg`;

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.78);
  });

  if (!blob) {
    throw new Error("Could not create image file.");
  }

  downloadBlob(blob, filename);
}

async function exportSelectedCarAsPdf() {
  if (!window.jspdf?.jsPDF) {
    throw new Error("PDF export library not available.");
  }

  const canvas = await captureSelectedCarCard(1.3);
  const imageData = canvas.toDataURL("image/jpeg", 0.78);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
    compress: true
  });

  pdf.addImage(imageData, "JPEG", 0, 0, canvas.width, canvas.height, undefined, "FAST");
  pdf.save(`${buildExportFileName(selectedRecord)}.pdf`);
}

async function createSelectedCarPdfBlob() {
  if (!window.jspdf?.jsPDF) {
    throw new Error("PDF export library not available.");
  }

  const canvas = await captureSelectedCarCard(1.3);
  const imageData = canvas.toDataURL("image/jpeg", 0.78);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
    compress: true
  });

  pdf.addImage(imageData, "JPEG", 0, 0, canvas.width, canvas.height, undefined, "FAST");

  return pdf.output("blob");
}

function buildShareSummary() {
  return [
    `${selectedRecord.modelName} ${selectedRecord.variant}`,
    `${selectedRecord.fuelType} | ${selectedRecord.transmissionType}`,
    `Ex-Showroom: ${formatPrice(selectedRecord.exShowroom)}`,
    `On Road: ${formatPrice(selectedRecord.onRoadBasic)}`,
    `With Value Package: ${formatPrice(selectedRecord.onRoadValue)}`
  ].join("\n");
}

async function shareSelectedCarImage() {
  const summary = buildShareSummary();

  if (navigator.share) {
    try {
      const canvas = await captureSelectedCarCard(1.3);
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.78);
      });

      if (blob) {
        const file = new File([blob], `${buildExportFileName(selectedRecord)}.jpg`, { type: "image/jpeg" });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `${selectedRecord.modelName} ${selectedRecord.variant}`,
            text: summary,
            files: [file]
          });
          return;
        }
      }

      await navigator.share({
        title: `${selectedRecord.modelName} ${selectedRecord.variant}`,
        text: summary
      });
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(summary);
    window.alert("Image sharing is not available here, so the selected car details were copied to your clipboard.");
    return;
  }

  window.alert(summary);
}

async function shareSelectedCarPdf() {
  const summary = buildShareSummary();

  if (navigator.share) {
    try {
      const blob = await createSelectedCarPdfBlob();

      if (blob) {
        const file = new File([blob], `${buildExportFileName(selectedRecord)}.pdf`, { type: "application/pdf" });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `${selectedRecord.modelName} ${selectedRecord.variant}`,
            text: summary,
            files: [file]
          });
          return;
        }
      }

      await navigator.share({
        title: `${selectedRecord.modelName} ${selectedRecord.variant}`,
        text: summary
      });
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(summary);
    window.alert("PDF sharing is not available here, so the selected car details were copied to your clipboard.");
    return;
  }

  window.alert(summary);
}

async function handleExport(action) {
  if (!selectedRecord) {
    window.alert("Select a car first.");
    return;
  }

  setExportButtonsDisabled(true);

  try {
    await action();
  } catch (error) {
    window.alert(error.message || "Something went wrong while exporting.");
  } finally {
    setExportButtonsDisabled(false);
  }
}

function renderRecord(record) {
  selectedRecord = record || null;

  if (!record) {
    quickQuoteLine.textContent = "Quick Quote generated for Vehicle Name Variant Fuel Transmission";
    resultTitle.textContent = "Choose a car to view pricing";
    recordNote.textContent = "Note: Quotation valid for only 2 days from the above date.";
    setExportButtonsDisabled(true);

    Object.values(detailTargets).forEach((target) => {
      target.textContent = "-";
    });
    return;
  }

  quickQuoteLine.textContent = `Quick Quote generated for ${record.modelName} ${record.variant} ${record.fuelType} ${record.transmissionType}`;
  resultTitle.textContent = `${record.modelName} ${record.variant}`;
  recordNote.textContent = "Note: Quotation valid for only 2 days from the above date.";
  setExportButtonsDisabled(false);

  detailTargets.breakdownTransmission.textContent = record.transmissionType;
  detailTargets.exShowroom.textContent = formatPrice(record.exShowroom);
  detailTargets.onRoadBasic.textContent = formatPrice(record.onRoadBasic);
  detailTargets.onRoadBasicRow.textContent = formatPrice(record.onRoadBasic);
  detailTargets.onRoadValue.textContent = formatPrice(record.onRoadValue);
  detailTargets.fuelType.textContent = record.fuelType;
  detailTargets.transmissionType.textContent = record.transmissionType;
  detailTargets.roadTax.textContent = formatPrice(record.roadTax);
  detailTargets.tcs.textContent = formatPrice(record.tcs);
  detailTargets.insurance.textContent = formatPrice(record.insurance);
  detailTargets.fastag.textContent = formatPrice(record.fastag);
  detailTargets.miscCharges.textContent = formatPrice(record.miscCharges);
  detailTargets.leKit.textContent = formatPrice(record.leKit);
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

downloadImageButton.addEventListener("click", () => {
  handleExport(exportSelectedCarAsImage);
});

downloadPdfButton.addEventListener("click", () => {
  handleExport(exportSelectedCarAsPdf);
});

shareImageButton.addEventListener("click", () => {
  handleExport(shareSelectedCarImage);
});

sharePdfButton.addEventListener("click", () => {
  handleExport(shareSelectedCarPdf);
});

updateUI();
