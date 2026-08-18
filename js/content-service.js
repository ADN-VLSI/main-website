const DEFAULT_HEADERS = {
  "Content-Type": "application/json"
};

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function normalizeInsight(record, index) {
  return {
    id: normalizeText(record?.id, `insight-${index + 1}`),
    type: normalizeText(record?.type, "Update"),
    title: normalizeText(record?.title, "Untitled insight"),
    summary: normalizeText(record?.summary, "No summary is available yet."),
    date: normalizeText(record?.date, ""),
    author: normalizeText(record?.author, "ADN Semiconductors"),
    url: normalizeText(record?.url, "#contact")
  };
}

function normalizeRole(record, index) {
  return {
    id: normalizeText(record?.id, `role-${index + 1}`),
    title: normalizeText(record?.title, "Untitled role"),
    location: normalizeText(record?.location, "Location not listed"),
    team: normalizeText(record?.team, "Team not listed"),
    type: normalizeText(record?.type, "Role type not listed"),
    summary: normalizeText(record?.summary, "Role summary pending update."),
    requirements: normalizeArray(record?.requirements)
      .map((item) => normalizeText(item))
      .filter(Boolean),
    applyUrl: normalizeText(record?.applyUrl, "mailto:careers@adnsemiconductors.com")
  };
}

async function fetchJson(path) {
  const response = await fetch(path, {
    method: "GET",
    headers: DEFAULT_HEADERS
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }

  return response.json();
}

export async function loadInsights(path = "data/insights.json") {
  try {
    const payload = await fetchJson(path);
    return normalizeArray(payload?.insights).map(normalizeInsight);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function loadRoles(path = "data/careers.json") {
  try {
    const payload = await fetchJson(path);
    return normalizeArray(payload?.roles).map(normalizeRole);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function formatDate(value) {
  if (!value) {
    return "Date pending";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

export function saveJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
