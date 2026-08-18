const DEFAULT_HEADERS = {
  Accept: "text/plain"
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

export function toPageSlug(value, fallback = "item") {
  const slug = normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || fallback;
}

function splitList(value) {
  return normalizeText(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getBodyExcerpt(body, fallback) {
  const cleaned = normalizeText(body).replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return fallback;
  }

  return cleaned.length > 220 ? `${cleaned.slice(0, 217)}...` : cleaned;
}

function normalizeInsight(record, index) {
  return {
    id: normalizeText(record?.id, `insight-${index + 1}`),
    type: normalizeText(record?.type, "Update"),
    title: normalizeText(record?.title, "Untitled insight"),
    summary: normalizeText(
      record?.summary,
      getBodyExcerpt(record?.body, "No summary is available yet.")
    ),
    date: normalizeText(record?.date, ""),
    author: normalizeText(record?.author, "ADN Semiconductors"),
    url: normalizeText(record?.url, "#contact"),
    image: normalizeText(record?.image, ""),
    body: normalizeText(record?.body)
  };
}

function normalizeRole(record, index) {
  const requirementsFromMeta = splitList(record?.requirements);
  const requirementsFromBody = normalizeText(record?.body)
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);

  return {
    id: normalizeText(record?.id, `role-${index + 1}`),
    title: normalizeText(record?.title, "Untitled role"),
    location: normalizeText(record?.location, "Location not listed"),
    team: normalizeText(record?.team, "Team not listed"),
    type: normalizeText(record?.type, "Role type not listed"),
    summary: normalizeText(
      record?.summary,
      getBodyExcerpt(record?.body, "Role summary pending update.")
    ),
    requirements: (requirementsFromMeta.length
      ? requirementsFromMeta
      : requirementsFromBody
    ).map((item) => normalizeText(item)).filter(Boolean),
    applyUrl: normalizeText(record?.applyUrl, "mailto:careers@adnsemiconductors.com"),
    body: normalizeText(record?.body)
  };
}

function normalizeService(record, index) {
  return {
    id: normalizeText(record?.id, `service-${index + 1}`),
    title: normalizeText(record?.title, "Untitled service"),
    summary: normalizeText(
      record?.summary,
      getBodyExcerpt(record?.body, "Service description pending update.")
    ),
    image: normalizeText(record?.image, ""),
    body: normalizeText(record?.body)
  };
}

function normalizePerson(record, index) {
  const categoryRaw = normalizeText(record?.category, "engineering").toLowerCase();
  const category = categoryRaw === "management" ? "management" : "engineering";

  return {
    id: normalizeText(record?.id, `person-${index + 1}`),
    category,
    name: normalizeText(record?.name, "Unnamed team member"),
    title: normalizeText(record?.title, "Team Member"),
    focus: normalizeText(record?.focus, "Semiconductor delivery"),
    summary: normalizeText(
      record?.summary,
      getBodyExcerpt(record?.body, "Profile details are being updated.")
    ),
    email: normalizeText(record?.email, ""),
    profileUrl: normalizeText(record?.profileUrl, ""),
    linkedin: normalizeText(record?.linkedin, ""),
    image: normalizeText(record?.image, ""),
    expertise: splitList(record?.expertise),
    body: normalizeText(record?.body)
  };
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return {
      meta: {},
      body: content
    };
  }

  const meta = {};
  const rawMeta = match[1].split(/\r?\n/);

  rawMeta.forEach((line) => {
    const separator = line.indexOf(":");
    if (separator < 0) {
      return;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) {
      meta[key] = value;
    }
  });

  return {
    meta,
    body: content.slice(match[0].length)
  };
}

function parseManifest(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.replace(/^-\s+/, ""))
    .filter(Boolean);
}

function resolveSiblingPath(basePath, relativePath) {
  const lastSlash = basePath.lastIndexOf("/");
  const baseDir = lastSlash >= 0 ? basePath.slice(0, lastSlash + 1) : "";
  return `${baseDir}${relativePath}`;
}

async function fetchText(path) {
  const response = await fetch(path, {
    method: "GET",
    headers: DEFAULT_HEADERS
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }

  return response.text();
}

async function fetchCollection(manifestPath) {
  const manifestText = await fetchText(manifestPath);
  const files = parseManifest(manifestText);

  const records = await Promise.all(
    files.map(async (fileName) => {
      const filePath = resolveSiblingPath(manifestPath, fileName);
      const raw = await fetchText(filePath);
      const parsed = parseFrontmatter(raw);

      return {
        ...parsed.meta,
        body: normalizeText(parsed.body),
        source: filePath
      };
    })
  );

  return records;
}

export async function loadInsights(path = "content/insights/index.md") {
  try {
    const records = await fetchCollection(path);
    return records.map(normalizeInsight);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function loadRoles(path = "content/careers/index.md") {
  try {
    const records = await fetchCollection(path);
    return records.map(normalizeRole);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function loadServices(path = "content/services/index.md") {
  try {
    const records = await fetchCollection(path);
    return records.map(normalizeService);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function loadPeople(path = "content/people/index.md") {
  try {
    const records = await fetchCollection(path);
    return records.map(normalizePerson);
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
