const LOCAL_KEY = "stageElectricsAcronymPortal.personalEntries.v1";

let personalEntries = loadPersonalEntries();
let activeCategory = "All";
let selectedAcronym = null;
let quizIndex = 0;
let quizAnswerVisible = false;

const elements = {
  searchInput: document.querySelector("#searchInput"),
  categoryFilters: document.querySelector("#categoryFilters"),
  glossaryGrid: document.querySelector("#glossaryGrid"),
  selectedAcronym: document.querySelector("#selectedAcronym"),
  selectedTerm: document.querySelector("#selectedTerm"),
  selectedPlainEnglish: document.querySelector("#selectedPlainEnglish"),
  selectedContext: document.querySelector("#selectedContext"),
  selectedExample: document.querySelector("#selectedExample"),
  selectedRemember: document.querySelector("#selectedRemember"),
  quizAcronym: document.querySelector("#quizAcronym"),
  quizAnswer: document.querySelector("#quizAnswer"),
  showAnswerBtn: document.querySelector("#showAnswerBtn"),
  nextQuizBtn: document.querySelector("#nextQuizBtn"),
  addForm: document.querySelector("#addForm"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput"),
  clearLocalBtn: document.querySelector("#clearLocalBtn"),
  saveMessage: document.querySelector("#saveMessage"),
};

function getAllAcronyms() {
  const base = Array.isArray(window.DEFAULT_ACRONYMS) ? window.DEFAULT_ACRONYMS : [];
  const merged = [...base, ...personalEntries];
  return merged.sort((a, b) => a.acronym.localeCompare(b.acronym, undefined, { sensitivity: "base" }));
}

function loadPersonalEntries() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Could not load local acronym entries", error);
    return [];
  }
}

function savePersonalEntries() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(personalEntries, null, 2));
}

function normaliseEntry(entry) {
  return {
    acronym: String(entry.acronym || "").trim(),
    term: String(entry.term || "").trim(),
    category: String(entry.category || "General").trim(),
    short: String(entry.short || "").trim(),
    plainEnglish: String(entry.plainEnglish || "").trim(),
    stageContext: String(entry.stageContext || "").trim(),
    example: String(entry.example || "").trim(),
    remember: String(entry.remember || "").trim(),
  };
}

function getCategories() {
  const categories = new Set(getAllAcronyms().map((item) => item.category).filter(Boolean));
  return ["All", ...Array.from(categories).sort()];
}

function getFilteredAcronyms() {
  const query = elements.searchInput.value.trim().toLowerCase();

  const categoryMatches = getAllAcronyms().filter((item) => {
    return activeCategory === "All" || item.category === activeCategory;
  });

  if (!query) {
    return categoryMatches;
  }

  const exactAcronymMatches = categoryMatches.filter((item) => {
    return item.acronym.toLowerCase() === query;
  });

  if (exactAcronymMatches.length > 0) {
    return exactAcronymMatches;
  }

  const acronymStartsWithMatches = categoryMatches.filter((item) => {
    return item.acronym.toLowerCase().startsWith(query);
  });

  if (acronymStartsWithMatches.length > 0) {
    return acronymStartsWithMatches;
  }

  return categoryMatches.filter((item) => {
    const words = [
      item.acronym,
      item.term,
      item.category,
      item.short,
      item.plainEnglish,
      item.stageContext,
      item.example,
      item.remember,
    ]
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9/]+/);

    return words.some((word) => word.startsWith(query));
  });
}

function renderCategories() {
  elements.categoryFilters.innerHTML = "";
  getCategories().forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-chip ${category === activeCategory ? "active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      activeCategory = category;
      render();
    });
    elements.categoryFilters.appendChild(button);
  });
}

function renderGlossary() {
  const acronyms = getFilteredAcronyms();
  elements.glossaryGrid.innerHTML = "";

  if (acronyms.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No matching acronym yet. Add it when you learn it.";
    elements.glossaryGrid.appendChild(empty);
    return;
  }

  if (!selectedAcronym || !getAllAcronyms().some((item) => item.acronym === selectedAcronym)) {
    selectedAcronym = acronyms[0].acronym;
  }

  acronyms.forEach((item) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `term-card ${item.acronym === selectedAcronym ? "active" : ""}`;
    card.innerHTML = `
      <strong>${escapeHtml(item.acronym)}</strong>
      <div class="term">${escapeHtml(item.term)}</div>
      <p class="short">${escapeHtml(item.short)}</p>
      <span class="category">${escapeHtml(item.category)}</span>
    `;
    card.addEventListener("click", () => {
      selectedAcronym = item.acronym;
      renderSelected();
      renderGlossary();
    });
    elements.glossaryGrid.appendChild(card);
  });
}

function renderSelected() {
  const all = getAllAcronyms();
  const item = all.find((entry) => entry.acronym === selectedAcronym) || all[0];
  if (!item) return;
  selectedAcronym = item.acronym;
  elements.selectedAcronym.textContent = item.acronym;
  elements.selectedTerm.textContent = item.term;
  elements.selectedPlainEnglish.textContent = item.plainEnglish || item.short;
  elements.selectedContext.textContent = item.stageContext || "No specific context added yet.";
  elements.selectedExample.textContent = item.example || "No example added yet.";
  elements.selectedRemember.textContent = item.remember || `${item.acronym} = ${item.term}`;
}

function renderQuiz() {
  const all = getAllAcronyms();
  if (!all.length) return;
  const item = all[quizIndex % all.length];
  elements.quizAcronym.textContent = item.acronym;
  if (quizAnswerVisible) {
    elements.quizAnswer.classList.remove("hidden");
    elements.quizAnswer.innerHTML = `<strong>${escapeHtml(item.term)}</strong><br>${escapeHtml(item.remember || item.short)}`;
  } else {
    elements.quizAnswer.classList.add("hidden");
    elements.quizAnswer.innerHTML = "";
  }
}

function render() {
  renderCategories();
  renderGlossary();
  renderSelected();
  renderQuiz();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[char]));
}

function showMessage(message) {
  elements.saveMessage.textContent = message;
  window.clearTimeout(showMessage.timeout);
  showMessage.timeout = window.setTimeout(() => {
    elements.saveMessage.textContent = "";
  }, 5000);
}

elements.searchInput.addEventListener("input", renderGlossary);

elements.showAnswerBtn.addEventListener("click", () => {
  quizAnswerVisible = true;
  renderQuiz();
});

elements.nextQuizBtn.addEventListener("click", () => {
  quizIndex += 1;
  quizAnswerVisible = false;
  renderQuiz();
});

elements.addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(elements.addForm);
  const entry = normaliseEntry(Object.fromEntries(formData.entries()));

  if (!entry.acronym || !entry.term || !entry.short || !entry.plainEnglish) {
    showMessage("Please complete the required fields before saving.");
    return;
  }

  const existingIndex = personalEntries.findIndex((item) => item.acronym.toLowerCase() === entry.acronym.toLowerCase());
  if (existingIndex >= 0) {
    personalEntries[existingIndex] = entry;
    showMessage(`${entry.acronym} updated in this browser.`);
  } else {
    personalEntries.push(entry);
    showMessage(`${entry.acronym} saved in this browser.`);
  }

  savePersonalEntries();
  selectedAcronym = entry.acronym;
  elements.addForm.reset();
  render();
});

elements.exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(personalEntries, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "my-acronym-additions.json";
  anchor.click();
  URL.revokeObjectURL(url);
  showMessage("Your local additions were exported as JSON.");
});

elements.importInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported)) throw new Error("Expected a JSON array");
    const cleaned = imported.map(normaliseEntry).filter((entry) => entry.acronym && entry.term);
    personalEntries = cleaned;
    savePersonalEntries();
    showMessage(`Imported ${cleaned.length} local acronym entr${cleaned.length === 1 ? "y" : "ies"}.`);
    render();
  } catch (error) {
    showMessage("That file could not be imported. Please use an exported JSON file from this portal.");
  } finally {
    event.target.value = "";
  }
});

elements.clearLocalBtn.addEventListener("click", () => {
  if (!confirm("Clear all acronyms saved locally in this browser? The built-in glossary will remain.")) return;
  personalEntries = [];
  savePersonalEntries();
  showMessage("Local additions cleared. Built-in acronyms remain.");
  render();
});

render();
