import { saveJsonFile } from "../js/content-service.js";

const insightsEditor = document.querySelector("#insights-editor");
const rolesEditor = document.querySelector("#roles-editor");
const statusNode = document.querySelector("#status");

const insightTemplate = document.querySelector("#insight-template");
const roleTemplate = document.querySelector("#role-template");

const addInsightButton = document.querySelector("#add-insight");
const addRoleButton = document.querySelector("#add-role");
const exportInsightsButton = document.querySelector("#export-insights");
const exportRolesButton = document.querySelector("#export-roles");
const exportAllButton = document.querySelector("#export-all");
const importInsightsInput = document.querySelector("#import-insights");
const importRolesInput = document.querySelector("#import-roles");

const state = {
  insights: [],
  roles: []
};

function setStatus(message) {
  if (statusNode) {
    statusNode.textContent = message;
  }
}

function asText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function createId(prefix) {
  const now = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${now}-${rnd}`;
}

function normalizeInsight(raw) {
  return {
    id: asText(raw?.id, createId("insight")),
    type: asText(raw?.type, "Insight"),
    title: asText(raw?.title, ""),
    summary: asText(raw?.summary, ""),
    date: asText(raw?.date, ""),
    author: asText(raw?.author, "ADN Semiconductors"),
    url: asText(raw?.url, "#contact")
  };
}

function normalizeRole(raw) {
  const requirements = Array.isArray(raw?.requirements)
    ? raw.requirements.map((item) => asText(item)).filter(Boolean)
    : [];

  return {
    id: asText(raw?.id, createId("role")),
    title: asText(raw?.title, ""),
    location: asText(raw?.location, ""),
    team: asText(raw?.team, ""),
    type: asText(raw?.type, "Full-time"),
    summary: asText(raw?.summary, ""),
    requirements,
    applyUrl: asText(raw?.applyUrl, "mailto:careers@adnsemiconductors.com")
  };
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path}: ${response.status}`);
  }
  return response.json();
}

async function loadData() {
  try {
    const [insightPayload, rolesPayload] = await Promise.all([
      fetchJson("../data/insights.json"),
      fetchJson("../data/careers.json")
    ]);

    state.insights = (Array.isArray(insightPayload?.insights) ? insightPayload.insights : [])
      .map(normalizeInsight);
    state.roles = (Array.isArray(rolesPayload?.roles) ? rolesPayload.roles : [])
      .map(normalizeRole);

    renderInsightsEditor();
    renderRolesEditor();
    setStatus("Loaded local JSON content.");
  } catch (error) {
    console.error(error);
    setStatus(
      "Unable to fetch JSON files. Run this site from a local web server (not file://) to edit content."
    );
  }
}

function createField(node, field, value, onChange) {
  const input = node.querySelector(`[data-field=\"${field}\"]`);
  if (!input) {
    return;
  }

  input.value = value;
  input.addEventListener("input", () => {
    onChange(input.value);
  });
}

function renderInsightsEditor() {
  if (!insightsEditor || !insightTemplate) {
    return;
  }

  insightsEditor.innerHTML = "";

  if (!state.insights.length) {
    const empty = document.createElement("p");
    empty.textContent = "No insight entries yet.";
    insightsEditor.append(empty);
    return;
  }

  state.insights.forEach((item, index) => {
    const fragment = insightTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".editor-card");

    createField(card, "type", item.type, (value) => {
      state.insights[index].type = asText(value, "Insight");
    });
    createField(card, "date", item.date, (value) => {
      state.insights[index].date = asText(value);
    });
    createField(card, "author", item.author, (value) => {
      state.insights[index].author = asText(value, "ADN Semiconductors");
    });
    createField(card, "url", item.url, (value) => {
      state.insights[index].url = asText(value, "#contact");
    });
    createField(card, "title", item.title, (value) => {
      state.insights[index].title = asText(value);
    });
    createField(card, "summary", item.summary, (value) => {
      state.insights[index].summary = asText(value);
    });

    card.querySelector("[data-action=\"remove\"]")?.addEventListener("click", () => {
      state.insights.splice(index, 1);
      renderInsightsEditor();
      setStatus("Insight removed.");
    });

    insightsEditor.append(fragment);
  });
}

function requirementsToMultiline(requirements) {
  return requirements.join("\n");
}

function multilineToRequirements(text) {
  return text
    .split("\n")
    .map((line) => asText(line))
    .filter(Boolean);
}

function renderRolesEditor() {
  if (!rolesEditor || !roleTemplate) {
    return;
  }

  rolesEditor.innerHTML = "";

  if (!state.roles.length) {
    const empty = document.createElement("p");
    empty.textContent = "No role entries yet.";
    rolesEditor.append(empty);
    return;
  }

  state.roles.forEach((role, index) => {
    const fragment = roleTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".editor-card");

    createField(card, "title", role.title, (value) => {
      state.roles[index].title = asText(value);
    });
    createField(card, "team", role.team, (value) => {
      state.roles[index].team = asText(value);
    });
    createField(card, "location", role.location, (value) => {
      state.roles[index].location = asText(value);
    });
    createField(card, "type", role.type, (value) => {
      state.roles[index].type = asText(value, "Full-time");
    });
    createField(card, "applyUrl", role.applyUrl, (value) => {
      state.roles[index].applyUrl = asText(value, "mailto:careers@adnsemiconductors.com");
    });
    createField(card, "summary", role.summary, (value) => {
      state.roles[index].summary = asText(value);
    });
    createField(card, "requirements", requirementsToMultiline(role.requirements), (value) => {
      state.roles[index].requirements = multilineToRequirements(value);
    });

    card.querySelector("[data-action=\"remove\"]")?.addEventListener("click", () => {
      state.roles.splice(index, 1);
      renderRolesEditor();
      setStatus("Role removed.");
    });

    rolesEditor.append(fragment);
  });
}

function addInsight() {
  state.insights.push(
    normalizeInsight({
      title: "",
      summary: "",
      date: "",
      author: "ADN Semiconductors",
      type: "Insight",
      url: "#contact"
    })
  );
  renderInsightsEditor();
  setStatus("Insight added.");
}

function addRole() {
  state.roles.push(
    normalizeRole({
      title: "",
      location: "",
      team: "",
      type: "Full-time",
      summary: "",
      requirements: [],
      applyUrl: "mailto:careers@adnsemiconductors.com"
    })
  );
  renderRolesEditor();
  setStatus("Role added.");
}

function exportInsights() {
  const payload = {
    insights: state.insights.map(normalizeInsight)
  };
  saveJsonFile("insights.json", payload);
  setStatus("Exported insights.json.");
}

function exportRoles() {
  const payload = {
    roles: state.roles.map(normalizeRole)
  };
  saveJsonFile("careers.json", payload);
  setStatus("Exported careers.json.");
}

function exportAll() {
  const payload = {
    insights: state.insights.map(normalizeInsight),
    roles: state.roles.map(normalizeRole)
  };
  saveJsonFile("combined-content.json", payload);
  setStatus("Exported combined-content.json.");
}

async function readFileAsJson(file) {
  const raw = await file.text();
  return JSON.parse(raw);
}

function setupImport(input, mode) {
  if (!input) {
    return;
  }

  input.addEventListener("change", async () => {
    const [file] = input.files || [];
    if (!file) {
      return;
    }

    try {
      const payload = await readFileAsJson(file);

      if (mode === "insights") {
        const list = Array.isArray(payload?.insights) ? payload.insights : payload;
        if (!Array.isArray(list)) {
          throw new Error("Invalid insights JSON shape");
        }
        state.insights = list.map(normalizeInsight);
        renderInsightsEditor();
        setStatus("Imported insights content.");
      }

      if (mode === "roles") {
        const list = Array.isArray(payload?.roles) ? payload.roles : payload;
        if (!Array.isArray(list)) {
          throw new Error("Invalid careers JSON shape");
        }
        state.roles = list.map(normalizeRole);
        renderRolesEditor();
        setStatus("Imported careers content.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Import failed. Ensure the file is valid JSON with insights or roles arrays.");
    }

    input.value = "";
  });
}

function setupEvents() {
  addInsightButton?.addEventListener("click", addInsight);
  addRoleButton?.addEventListener("click", addRole);
  exportInsightsButton?.addEventListener("click", exportInsights);
  exportRolesButton?.addEventListener("click", exportRoles);
  exportAllButton?.addEventListener("click", exportAll);

  setupImport(importInsightsInput, "insights");
  setupImport(importRolesInput, "roles");
}

setupEvents();
loadData();
