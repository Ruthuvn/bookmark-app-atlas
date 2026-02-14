const API_BASE = "http://localhost:3000/api"; // For local development
// Update to your production URL when deploying

const elements = {
  loading: document.getElementById("loading"),
  loginRequired: document.getElementById("login-required"),
  metadataForm: document.getElementById("metadata-form"),
  success: document.getElementById("success"),
  urlInput: document.getElementById("url"),
  title: document.getElementById("title"),
  description: document.getElementById("description"),
  notes: document.getElementById("notes"),
  ogImage: document.getElementById("og-image"),
  favicon: document.getElementById("favicon"),
  saveBtn: document.getElementById("save-btn"),
  closeBtn: document.getElementById("close-btn"),
};

let pageMetadata = null;

async function init() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab || !tab.url) {
      showError("Could not get current tab URL.");
      return;
    }

    elements.urlInput.value = tab.url;

    // Check authentication and fetch metadata
    const metaRes = await fetchMetadata(tab.url);
    
    // Check if user is logged in by attempting to fetch a protected resource
    const authCheck = await fetch(`${API_BASE}/bookmarks`, {
      method: "GET",
    });
    
    if (authCheck.status === 401) {
      showLoginRequired();
      return;
    }

    displayMetadata(metaRes);
    showForm();
  } catch (err) {
    console.error("Init error:", err);
    showError("An unexpected error occurred.");
  }
}

async function fetchMetadata(url) {
  try {
    const response = await fetch(`${API_BASE}/fetch-metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    return await response.json();
  } catch (err) {
    console.error("Metadata fetch error:", err);
    return {
      title: "",
      description: "",
      og_image_url: null,
      favicon_url: null,
    };
  }
}


function displayMetadata(meta) {
  pageMetadata = meta;
  elements.title.textContent =
    meta.title || new URL(elements.urlInput.value).hostname;
  elements.description.textContent =
    meta.description || "No description available.";

  if (meta.og_image_url) {
    elements.ogImage.src = meta.og_image_url;
    elements.ogImage.classList.remove("hidden");
  }

  if (meta.favicon_url) {
    elements.favicon.src = meta.favicon_url;
    elements.favicon.classList.remove("hidden");
  }
}

async function saveBookmark() {
  elements.saveBtn.disabled = true;
  elements.saveBtn.textContent = "Saving...";

  try {
    const description = elements.notes.value || elements.description.textContent;
    
    const response = await fetch(`${API_BASE}/bookmarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: elements.urlInput.value,
        title: elements.title.textContent,
        description: description,
      }),
    });

    if (response.ok) {
      showSuccess();
    } else {
      const err = await response.json();
      throw new Error(err.error || "Failed to save");
    }
  } catch (err) {
    alert("Error: " + err.message);
    elements.saveBtn.disabled = false;
    elements.saveBtn.textContent = "Save Bookmark";
  }
}

function showForm() {
  elements.loading.classList.add("hidden");
  elements.metadataForm.classList.remove("hidden");
}

function showLoginRequired() {
  elements.loading.classList.add("hidden");
  elements.loginRequired.classList.remove("hidden");
}

function showSuccess() {
  elements.metadataForm.classList.add("hidden");
  elements.success.classList.remove("hidden");
}

function showError(msg) {
  elements.loading.innerHTML = `<p style="color: #e74c3c;">${msg}</p>`;
}

elements.saveBtn.addEventListener("click", saveBookmark);
elements.closeBtn.addEventListener("click", () => window.close());

init();
