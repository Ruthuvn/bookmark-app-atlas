// Dev Atlas New Tab - Simplified dashboard-style UX

// ========================================
// STATE & CONFIG
// ========================================
let state = {
  categories: [],
  bookmarks: [],
  searchQuery: "",
  viewMode: "card", // card | list
  cardColumns: 3,
  listColumns: 1,
  foldedCategories: new Set(),
};

const ICON_MAP = {
  "home-01": "🏠",
  "folder-01": "📁",
  "folder-02": "📂",
  "book-01": "📚",
  code: "💻",
  terminal: "⌨️",
  "globe-01": "🌐",
  star: "⭐",
  heart: "❤️",
  "music-01": "🎵",
  "video-01": "🎬",
  "camera-01": "📸",
  "shopping-cart-01": "🛒",
  "money-01": "💰",
  "analytics-01": "📈",
  "settings-01": "⚙️",
  "user-01": "👤",
  "mail-01": "📧",
  "chat-01": "💭",
  "phone-01": "📱",
  "calendar-01": "📅",
  "search-01": "🔍",
  "rocket-01": "🚀",
  "bulb-01": "💡",
  "news-01": "📰",
  "ai-01": "🤖",
  "palette-01": "🎨",
};

const CARD_COLUMN_OPTIONS = [
  { value: 2, label: "2 columns" },
  { value: 3, label: "3 columns" },
  { value: 4, label: "4 columns" },
  { value: 5, label: "5 columns" },
];

const LIST_COLUMN_OPTIONS = [
  { value: 1, label: "1 column" },
  { value: 2, label: "2 columns" },
  { value: 3, label: "3 columns" },
];

// ========================================
// ELEMENT SELECTORS
// ========================================
const el = {
  grid: document.getElementById("bookmarks-grid"),
  loading: document.getElementById("loading-state"),
  login: document.getElementById("login-state"),
  empty: document.getElementById("empty-state"),
  omnibox: document.getElementById("omnibox"),
  viewBtns: document.querySelectorAll(".view-btn"),
  columnSelect: document.getElementById("column-select"),
};

// ========================================
// INITIALIZATION
// ========================================
async function init() {
  loadSettings();
  setupEventListeners();

  try {
    const [catRes, bookRes] = await Promise.all([
      fetchAPI("/categories"),
      fetchAPI("/bookmarks"),
    ]);

    if (catRes.status === 401) {
      showState("login");
      return;
    }

    state.categories = catRes.data || [];
    state.bookmarks = bookRes.data || [];

    if (state.categories.length === 0 && state.bookmarks.length === 0) {
      showState("empty");
      return;
    }

    render();
  } catch (err) {
    console.error("Init error:", err);
  }
}

// ========================================
// API & SETTINGS
// ========================================
async function fetchAPI(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
    });
    if (res.status === 401) return { status: 401 };
    return { data: await res.json() };
  } catch (err) {
    return { error: err.message };
  }
}

function loadSettings() {
  const saved = localStorage.getItem("mindcave_settings");
  if (saved) {
    const parsed = JSON.parse(saved);
    state = {
      ...state,
      ...parsed,
      foldedCategories: new Set(parsed.foldedCategories || []),
    };
  }
  updateUIFromState();
}

function saveSettings() {
  const toSave = {
    ...state,
    foldedCategories: Array.from(state.foldedCategories),
  };
  localStorage.setItem("mindcave_settings", JSON.stringify(toSave));
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
  // Omnibox Search
  el.omnibox.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.toLowerCase();
    render();
  });

  // Shortcut for search (Ctrl+K)
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      el.omnibox.focus();
    }
    if (e.key === "Escape" && document.activeElement === el.omnibox) {
      el.omnibox.value = "";
      state.searchQuery = "";
      render();
      el.omnibox.blur();
    }
  });

  // View toggles
  el.viewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextView = btn.dataset.view;
      if (!nextView || nextView === state.viewMode) return;
      state.viewMode = nextView;
      updateUIFromState();
      saveSettings();
      render();
    });
  });

  // Column selector
  el.columnSelect.addEventListener("change", (e) => {
    const cols = parseInt(e.target.value, 10) || 1;
    if (state.viewMode === "card") {
      state.cardColumns = cols;
    } else {
      state.listColumns = cols;
    }
    saveSettings();
    render();
  });

  // Import Bookmarks button (only available in empty state)
  const importBtn = document.getElementById("import-bookmarks-btn");
  if (importBtn) {
    importBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Open dashboard in new tab
      const dashboardWindow = window.open(
        "_blank"
      );

      // Try to trigger import after dashboard loads
      // Note: This may not work due to cross-origin restrictions
      // The user will need to manually click Import Bookmarks in the dashboard
      if (dashboardWindow) {
        setTimeout(() => {
          try {
            dashboardWindow.postMessage({ action: "openImport" }, "*");
          } catch (err) {
            console.log("Could not auto-trigger import:", err);
          }
        }, 1500);
      }
    });
  }
}

function updateUIFromState() {
  document.body.classList.remove("view-card", "view-list");
  document.body.classList.add(`view-${state.viewMode}`);

  el.viewBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === state.viewMode);
  });

  setColumnOptions();
}

function setColumnOptions() {
  const options =
    state.viewMode === "card" ? CARD_COLUMN_OPTIONS : LIST_COLUMN_OPTIONS;
  const targetValue =
    state.viewMode === "card" ? state.cardColumns : state.listColumns;
  el.columnSelect.innerHTML = options
    .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
    .join("");

  const valid = options.some((opt) => opt.value === targetValue);
  const valueToUse = valid ? targetValue : options[0].value;
  if (!valid) {
    if (state.viewMode === "card") state.cardColumns = valueToUse;
    else state.listColumns = valueToUse;
    saveSettings();
  }
  el.columnSelect.value = String(valueToUse);
}

// ========================================
// RENDERING
// ========================================
function render() {
  showState("grid");

  const filteredBookmarks = state.bookmarks.filter((b) => {
    const query = state.searchQuery;
    if (!query) return true;
    return (
      b.title?.toLowerCase().includes(query) ||
      b.url?.toLowerCase().includes(query) ||
      b.description?.toLowerCase().includes(query)
    );
  });

  const bookmarksByCategory = {};
  state.categories.forEach((c) => (bookmarksByCategory[c.id] = []));

  filteredBookmarks.forEach((b) => {
    if (b.category_id && bookmarksByCategory[b.category_id]) {
      bookmarksByCategory[b.category_id].push(b);
    }
  });

  el.grid.innerHTML = "";

  state.categories.forEach((cat) => {
    const items = bookmarksByCategory[cat.id];
    if (items.length === 0 && state.searchQuery) return;
    if (items.length === 0 && !state.searchQuery) return;

    const widget = createWidget(cat, items);
    el.grid.appendChild(widget);
  });

  const uncategorizedItems = filteredBookmarks.filter(
    (b) => !b.category_id || !bookmarksByCategory[b.category_id]
  );
  if (uncategorizedItems.length > 0) {
    el.grid.appendChild(
      createWidget({ name: "Uncategorized", id: "other" }, uncategorizedItems)
    );
  }
}

function createWidget(category, items) {
  const isFolded = state.foldedCategories.has(category.id);
  const div = document.createElement("div");
  const cols =
    state.viewMode === "card" ? state.cardColumns : state.listColumns;
  div.className = `category-widget ${isFolded ? "folded" : ""}`;

  const icon = ICON_MAP[category.icon] || "📁";
  const color = category.color || "var(--primary)";

  div.innerHTML = `
    <div class="category-header">
      <span class="category-fold-icon">▼</span>
      <span class="category-icon" style="color: ${color}">${icon}</span>
      <span class="category-name">${category.name}</span>
      <span class="category-count">${items.length}</span>
    </div>
    <ul class="bookmark-list ${
      state.viewMode === "card" ? "card-grid" : "list-grid"
    }" style="--cols: ${cols}">
      ${items.map((b) => createItemHTML(b)).join("")}
    </ul>
  `;

  div.querySelector(".category-header").addEventListener("click", () => {
    if (state.foldedCategories.has(category.id)) {
      state.foldedCategories.delete(category.id);
      div.classList.remove("folded");
    } else {
      state.foldedCategories.add(category.id);
      div.classList.add("folded");
    }
    saveSettings();
  });

  div.querySelectorAll(".bookmark-item").forEach((item, i) => {
    item.addEventListener("click", () => window.open(items[i].url, "_blank"));
  });

  return div;
}

function createItemHTML(b) {
  const domain = new URL(b.url).hostname.replace("www.", "");
  const favicon =
    b.favicon_url ||
    `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  const heading = b.title || domain;

  if (state.viewMode === "card") {
    return `
      <li class="bookmark-item card">
        <div class="bookmark-cover">
          ${
            b.og_image_url
              ? `<img src="${b.og_image_url}" loading="lazy" alt="${heading}" />`
              : `<div class="bookmark-cover-fallback">🔗</div>`
          }
        </div>
        <div class="bookmark-meta">
          <div class="bookmark-title-row">
            <img src="${favicon}" class="bookmark-favicon" alt="" />
            <span class="bookmark-title">${heading}</span>
          </div>
          ${
            b.description ? `<p class="bookmark-desc">${b.description}</p>` : ""
          }
        </div>
      </li>
    `;
  }

  return `
    <li class="bookmark-item list">
      <img src="${favicon}" class="bookmark-favicon" alt="" />
      <div class="bookmark-text">
        <span class="bookmark-title">${heading}</span>
        <span class="bookmark-url">${domain}</span>
        ${
          b.description
            ? `<span class="bookmark-desc">${b.description}</span>`
            : ""
        }
      </div>
    </li>
  `;
}

// ========================================
// HELPERS
// ========================================
function showState(s) {
  el.loading.classList.add("hidden");
  el.login.classList.add("hidden");
  el.empty.classList.add("hidden");
  el.grid.classList.add("hidden");
  if (s === "grid") el.grid.classList.remove("hidden");
  else el[s].classList.remove("hidden");
}

init();
