const DEFAULT_HEADERS = {
  Accept: "text/plain",
};

const textCache = new Map();
const collectionCache = new Map();

// Inlined in place of content/services/*.md so the directory can be removed.
const SERVICE_RECORDS = [
  {
    id: "service-asic-design",
    title: "ASIC Design",
    summary:
      "End-to-end ASIC development from architecture through tape-out with measurable schedule and quality control.",
    image: "/services/thumbnail-asic-design.png",
    heroImage: "/services/full-asic-design.png",
    body: `## High-Performance Chip-to-Chip Communication

  We engineer scalable ==NoC== and ==Chip-to-Chip== communication fabrics for compute-intensive multi-die systems where latency, coherency, and sustained bandwidth are architectural constraints.

  - Cache-coherent interconnect architecture for heterogeneous CPU, GPU, NPU, and accelerator clusters
  - Low-latency NoC topology, routing, virtual channels, multicast, and QoS design for predictable service
  - Chiplet and Chip-to-Chip transport adaptation for standards-based and proprietary links, including UCIe-style integration
  - Bandwidth, latency, and congestion modeling across coherent, streaming, control-plane, and CXL-style traffic classes
  - Verification strategy for ordering, deadlock freedom, backpressure, link recovery, and RAS-oriented resilience

  ## Custom RISC-V Co-Processor and ISA Extensions

  We design high-performance ==RISC-V== extensions and tightly coupled ==AI accelerators== that translate critical workloads into differentiated latency, throughput, and energy efficiency.

  - Vector, tensor, matrix, SIMD, and domain-specific execution engines for AI inference, DSP, and edge workloads
  - Custom instruction, NPU, and co-processor microarchitecture with pipeline, issue, speculation, and exception integration
  - Tightly coupled memory, scratchpad, DMA, and cache-coherency strategy for high data-reuse workloads
  - Hardware-software contract definition spanning compiler intrinsics, runtime APIs, firmware, drivers, and performance counters
  - PPA-aware verification and performance modeling from microarchitecture through heterogeneous SoC integration

  ## MEMS-Enabled Digital Subsystems

  We turn sensor data into dependable system behavior through robust ==Digital Interfaces==, deterministic timing, and ==Edge-sensor Processing== architectures around ==Mixed-Signal== MEMS front ends.

  - Sensor interface RTL for mixed-signal front ends, control loops, low-power acquisition, and always-on sensing paths
  - Calibration, compensation, digital filtering, and sensor-fusion pipelines for reliable measurements
  - Deterministic timestamping, buffering, interrupt handling, and event sequencing across asynchronous clock domains
  - Sensor-hub architecture for multi-sensor aggregation, context awareness, embedded ML preprocessing, and host integration
  - Verification focused on real operating conditions, fault handling, data integrity, and integration corner cases

  ## DDR Memory Controller with Atomics Support

  We architect ==DDR== subsystems that preserve memory ordering and ==Atomic== correctness under high concurrency while delivering predictable latency and bandwidth to CPUs, accelerators, chiplets, and I/O masters.

  - DDR controller microarchitecture, command scheduling, and subsystem integration for modern heterogeneous SoC traffic
  - Atomic operations, memory ordering, coherency hooks, and RAS-aware error handling for shared-memory systems
  - QoS, arbitration, and admission-control strategies for mixed real-time, CPU, NPU, GPU, and I/O workloads
  - Latency and bandwidth optimization under realistic contention, refresh, power-management, and thermal conditions
  - Verification plans for ordering, data integrity, ECC paths, stress behavior, and system-level performance closure`,
  },
  {
    id: "service-rapid-fpga-prototyping",
    title: "Rapid FPGA Prototyping",
    summary:
      "Fast, production-representative FPGA prototypes to de-risk architecture and accelerate software and system validation.",
    image: "/services/thumbnail-rapid-fpga-prototyping.png",
    heroImage: "/services/full-rapid-fpga-prototyping.png",
    body: `## ASIC-to-FPGA Adaptation Strategy

We translate ASIC intent into FPGA-ready implementations while preserving functional equivalence on the most risk-critical paths.

- Prototype platform selection aligned to capacity, I/O, and timeline constraints
- Partitioning strategy for multi-FPGA or single-device implementation targets
- RTL adaptation for FPGA resources, clocking structures, and memory primitives
- Substitution planning for ASIC-only constructs while maintaining behavior fidelity
- Constraint and build methodology tuned for fast iteration and stable closure

## Bring-Up, Timing Closure, and Interface Validation

We execute structured bring-up that prioritizes observability and early proof of key subsystem behavior under representative clocks and traffic.

- Timing closure support with path prioritization and incremental optimization loops
- High-speed I/O bring-up for protocol and board-level interoperability checks
- On-chip debug instrumentation for triggerable and repeatable failure capture
- Reset, clock, and CDC sanity strategy for prototype stability at scale
- Bring-up evidence package with issue logs, fixes, and remaining constraints

## Pre-Silicon Software and System Enablement

We use prototypes to unblock firmware and system teams before silicon arrives, reducing schedule risk across downstream integration phases.

- Firmware boot and driver validation against representative hardware behavior
- System scenario emulation for workload, interrupt, and data-path integration testing
- Application and middleware readiness checkpoints using prototype-based execution
- Co-validation workflows across hardware, firmware, and test engineering teams
- Demo readiness planning for internal reviews and customer-facing milestones

## Iteration Control and Program Risk Burn-Down

We manage prototype evolution with traceable revisions so teams can quantify progress and de-risk tape-out decisions.

- Structured revision control for RTL, constraints, and board-level configuration
- Change-impact analysis tied to test evidence and open issue status
- Risk tracking for unresolved functional, performance, and integration gaps
- Decision-support reporting for architecture and implementation trade-offs
- Final handoff package with known limitations and next-step recommendations`,
  },
  {
    id: "service-rtl-design-verification",
    title: "RTL Design Verification",
    summary:
      "Coverage-driven RTL verification that improves first-silicon confidence and reduces debug churn.",
    image: "/services/thumbnail-rtl-design-verification.png",
    heroImage: "/services/full-rtl-design-verification.png",
    body: `## Verification Planning and Risk Mapping

We define verification scope from product requirements and failure-risk analysis so effort is concentrated on the behaviors most likely to impact silicon success.

- Requirement-to-test traceability model with measurable closure targets
- Feature prioritization based on functional criticality and bug escape impact
- Test intent decomposition across unit, subsystem, and SoC integration levels
- Signoff criteria planning for coverage, bug maturity, and residual-risk thresholds
- Milestone-based execution plan aligned to design maturity and release gates

## UVM Environment and ABV Infrastructure

We build scalable verification environments that support parallel development, reuse, and rigorous protocol and data-path checking.

- UVM testbench architecture with reusable agents, sequences, and configuration layers
- Assertion-based verification for protocol, timing, and microarchitectural properties
- Scoreboard and reference-model strategy for deterministic correctness checking
- Functional coverage model linked to specification intent and corner conditions
- Environment coding standards that improve maintainability and debug clarity

## Regression Execution and Debug Closure

We run reproducible regressions with disciplined triage so teams can move from failure detection to verified fixes with minimal churn.

- Regression suite strategy for smoke, feature, stress, and random scenarios
- Failure classification and triage flow with owner mapping and priority control
- Root-cause isolation support across design, testbench, and tool interactions
- Fix validation gates to prevent reopen churn and unintended side effects
- Trend reporting for bug arrival, closure velocity, and regression health

## Signoff Readiness and Residual-Risk Management

We prepare signoff artifacts that make verification status transparent, defensible, and actionable for project decision-makers.

- Coverage closure analysis across code, functional, and assertion metrics
- Uncovered-feature and waiver review with explicit technical rationale
- Residual-risk summary tied to business and schedule impact assessment
- Signoff review package for engineering leadership and program governance
- Post-signoff recommendations for silicon bring-up and validation continuity`,
  },
  {
    id: "service-custom-ip-vip-development",
    title: "Custom IP & VIP Development",
    summary:
      "Reusable custom IP and verification IP engineered for integration speed, protocol compliance, and long-term maintainability.",
    image: "/services/thumbnail-custom-ip-vip-development.png",
    heroImage: "/services/full-custom-ip-vip-development.png",
    body: `## Reusable Design IP Architecture

We build custom RTL IP blocks with reuse and predictable integration as first-order constraints. Designs are structured to remain stable across multiple SoC programs while allowing controlled feature growth.

- Microarchitecture design for control, datapath, and interface-centric IP blocks
- Parameterization strategy that balances configurability with timing and area discipline
- Clean register-map and interface contract definition for firmware and integration teams
- Clock, reset, and low-power intent alignment for subsystem-level consistency
- Design documentation artifacts that support handoff, reuse, and maintainability

## Protocol-Aware VIP and Compliance Infrastructure

We develop VIP that validates protocol behavior under realistic operating conditions, not just ideal transactions. The focus is standards compliance plus robustness under stress, error, and corner scenarios.

- Configurable UVM agents with scalable active/passive deployment modes
- Protocol checkers, assertions, and scoreboards aligned to spec intent
- Scenario libraries for legal, illegal, and recovery-sequence traffic patterns
- Coverage model planning tied to protocol features and risk hotspots
- Compliance reporting structure for review, signoff, and customer visibility

## Integration-Centric Packaging and Release

We package IP and VIP for efficient adoption in customer environments, with metadata, version controls, and integration guidance that reduce onboarding friction.

- Packaging aligned to IP-XACT or customer-specific release conventions
- Integration metadata, dependency mapping, and configuration matrix support
- Release qualification criteria covering lint, simulation, and basic performance checks
- Backward-compatibility guidelines for revision updates across active projects
- Handoff bundles with user guides, examples, and known-limitations disclosure

## Lifecycle Maintenance and Migration Planning

We support long-life IP programs with structured maintenance so teams can evolve functionality without destabilizing verified integrations.

- Change-impact analysis for feature adds and protocol revision migration
- Controlled deprecation strategy with compatibility bridges where required
- Bug-fix qualification flow with regression gates before release propagation
- Reuse governance model for multi-project branch and baseline management
- Sustaining support framework for downstream integration and debug teams`,
  },
  {
    id: "service-embedded-system-design",
    title: "Embedded System Design",
    summary:
      "Hardware-software co-design services for embedded platforms that must perform reliably in production environments.",
    image: "/services/thumbnail-embedded-system-design.png",
    heroImage: "/services/full-embedded-system-design.png",
    body: `## Platform Architecture and System Partitioning

We define embedded platforms from system requirements downward, balancing compute, memory, interfaces, and power budgets against real deployment constraints.

- SoC, MCU, FPGA, and peripheral partitioning strategy for target workloads
- Memory hierarchy planning for bandwidth, latency, and deterministic behavior
- Interface architecture across sensor, control, networking, and storage domains
- Power and clock domain strategy aligned to operating modes and duty cycles
- System dependency and interface contract documentation for cross-team alignment

## Firmware Bring-Up and Board-Level Integration

We enable predictable first bring-up by aligning low-level software with board design assumptions and silicon behavior from day one.

- BSP and boot-flow definition including reset sequencing and initialization order
- Driver bring-up for critical peripherals, buses, and interrupt infrastructure
- Middleware integration planning for communication stacks and service layers
- Early hardware abstraction boundaries that simplify application portability
- Bring-up checklist and milestone criteria for staged platform readiness

## Cross-Domain Debug and Observability

We establish co-debug workflows that shorten root-cause loops across hardware, firmware, and integration boundaries.

- Instrumentation strategy for trace, log, and event-correlation visibility
- Fault isolation methods spanning firmware state, bus behavior, and peripheral status
- Reproducible debug scenario design for intermittent and timing-sensitive issues
- Interface-level sanity monitors for rapid detection of integration regressions
- Issue triage discipline linking symptoms to actionable subsystem owners

## Validation for Production Reliability

We plan validation to expose field-relevant failures before release, with objective acceptance criteria tied to product requirements.

- Validation matrix across performance, reliability, thermal, and stress conditions
- Test procedures and pass/fail criteria for manufacturing and deployment contexts
- Environmental and long-duration scenario coverage for stability confidence
- Defect tracking with severity-based closure and residual-risk visibility
- Productization handoff package for sustaining and operations teams`,
  },
  {
    id: "service-eda-automation",
    title: "EDA Automation",
    summary:
      "Automation frameworks for EDA flows that improve throughput, repeatability, and decision speed across design and verification.",
    image: "/services/thumbnail-eda-automation.png",
    heroImage: "/services/full-eda-automation.png",
    body: `## Flow Orchestration and Reproducible Execution

We automate design and verification flows so runs are deterministic, auditable, and easy to scale across teams and compute environments.

- Multi-tool orchestration for lint, simulation, synthesis, STA, and signoff-adjacent tasks
- Configuration-driven execution with project, block, and target-level parameter control
- Environment bootstrapping and dependency validation to reduce setup variability
- Artifact lifecycle handling with traceable run IDs and output provenance
- Standardized run wrappers that enforce consistent invocation and logging behavior

## Regression Intelligence and Failure Triage

We improve debug velocity by structuring regressions for fast isolation of true failures versus infrastructure noise.

- Regression scheduling logic for smoke, nightly, and milestone-grade suites
- Automatic failure bucketing and signature-based duplicate detection
- Retry and quarantine policies for unstable tests with accountability controls
- Triage dashboards linking failures to commits, tool versions, and configuration deltas
- Escalation hooks for critical gate failures and release-impacting regressions

## Metrics Engineering and Quality Gates

We build a data backbone that turns raw logs into engineering decisions, with objective gates for progress and release readiness.

- Coverage, QoR, and runtime metric extraction with normalized schemas
- Trend analytics across branches, milestones, and toolchain revisions
- Threshold-based quality gate enforcement with pass/fail policy definitions
- Delta reporting for rapid detection of regressions in performance or closure status
- Publish-ready summaries for technical leadership and program management

## CI/CD and Compute-Scale Integration

We integrate EDA automation into CI infrastructure so verification and implementation pipelines can run continuously with controlled cost and capacity.

- CI pipeline integration for merge-gate, nightly, and release qualification workflows
- Job distribution strategies across on-prem and cloud compute resources
- License-aware scheduling to maximize throughput under tool capacity limits
- Cache and incremental execution strategies to reduce redundant reruns
- Runbook and operating model documentation for sustainment and scaling teams`,
  },
];

// Inlined in place of content/people/*.md so the directory can be removed.
const PEOPLE_RECORDS = [
  {
    id: "people-asif-mahmood",
    name: "Asif Mahmood",
    title: "Chairman, ADN Group",
    focus: "Strategic direction and capability growth",
    summary:
      "Providing the strategic vision behind ADN Group's growth and empowering ADN Semiconductors to build globally competitive semiconductor design and training capabilities from Bangladesh.",
    image: "/people/person-asif-mahmood.png",
    expertise:
      "Group strategy | Capability development | Semiconductor ecosystem leadership",
    body: "Asif Mahmood provides the long-range strategic direction behind ADN Group growth and supports ADN Semiconductors in scaling global-quality design and training capabilities from Bangladesh.",
  },
  {
    id: "people-faruque-a-khan",
    name: "Faruque A. Khan",
    title: "Founder\\nManaging Director & CEO",
    focus: "Organization building and execution quality",
    summary:
      "Leading the vision to build a high-quality front-end semiconductor design and training organization under ADN Group.",
    image: "/people/person-faruque-a-khan.png",
    expertise:
      "Front-end design leadership | Team scaling | Delivery governance",
    body: "Faruque A. Khan leads the vision and execution model for ADN Semiconductors, focused on building a high-quality front-end semiconductor design and training organization under ADN Group.",
  },
  {
    id: "people-foez-ahmed",
    name: "Foez Ahmed",
    title: "Technical Lead, \\n Engineering Division",
    focus:
      "Architecture, SoC integration, verification closure, and delivery quality",
    summary:
      "Senior RTL and verification engineer with 4+ years of hands-on ASIC and FPGA delivery experience across RISC-V SoC architecture, AMBA interconnects, and verification-first execution.",
    image: "/people/person-foez-ahmed.png",
    expertise:
      "SystemVerilog RTL and UVM | RISC-V SoC and cache architecture | AXI, AHB, APB, OBI, Wishbone, etc. interconnects | Lint, CDC/RDC, and synthesis-ready handoff | Formal and SVA-based verification | Python, Bash, Makefile automation",
    body: `Foez Ahmed is a Senior Engineer in RTL Design and Verification at ADN Semiconductor. His work spans the full front-end silicon flow, from micro-architecture planning and RTL implementation to verification closure and synthesis-ready handoff.

Since starting his professional journey in 2022, he has built deep execution strength in AMBA-based systems, reusable IP development, and integration-heavy SoC programs, including RV64G platform work. He is experienced in SystemVerilog, UVM, assertion-based verification, and formal methods, with practical delivery discipline around lint, CDC/RDC, and signoff readiness.

He also builds workflow automation with Python, Bash, and Makefile-based tooling to improve regression throughput, coverage tracking, and repeatability across client-oriented hardware projects.`,
  },
];

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

function normalizeMultilineText(value, fallback = "") {
  return normalizeText(value, fallback)
    .replace(/\\n/g, "\n")
    .replace(/\s*\n\s*/g, "\n");
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

function normalizeImageSet(value) {
  return normalizeText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
}

function getBodyExcerpt(body, fallback) {
  const cleaned = normalizeText(body).replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return fallback;
  }

  return cleaned.length > 220 ? `${cleaned.slice(0, 217)}...` : cleaned;
}

const INSIGHT_CATEGORY_ALIASES = Object.freeze({
  interview: "interviews",
  guide: "guides",
  benchmark: "benchmarks",
  study: "studies",
  story: "stories",
  article: "stories",
  blog: "stories",
  news: "news",
  update: "news",
  event: "events",
  infographic: "infographics",
  announcement: "announcements",
});

function normalizeInsightCategory(value) {
  const raw = toPageSlug(value, "news");
  return INSIGHT_CATEGORY_ALIASES[raw] || raw;
}

function formatInsightCategoryLabel(category) {
  return normalizeText(category)
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeInsight(record, index) {
  const category = normalizeInsightCategory(record?.category || record?.type);

  return {
    id: normalizeText(record?.id, `insight-${index + 1}`),
    category,
    categoryLabel: formatInsightCategoryLabel(category),
    type: normalizeText(record?.type, "Update"),
    title: normalizeMultilineText(record?.title, "Untitled insight"),
    summary: normalizeText(
      record?.summary,
      getBodyExcerpt(record?.body, "No summary is available yet."),
    ),
    date: normalizeText(record?.date, ""),
    author: normalizeText(record?.author, "ADN Semiconductors"),
    url: normalizeText(record?.url, "#contact"),
    image: normalizeText(record?.image, ""),
    imageSrcset: normalizeImageSet(record?.imageSrcset),
    imageSizes: normalizeText(record?.imageSizes),
    body: normalizeText(record?.body),
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
    title: normalizeMultilineText(record?.title, "Untitled role"),
    location: normalizeText(record?.location, "Location not listed"),
    team: normalizeText(record?.team, "Team not listed"),
    type: normalizeText(record?.type, "Role type not listed"),
    summary: normalizeText(
      record?.summary,
      getBodyExcerpt(record?.body, "Role summary pending update."),
    ),
    requirements: (requirementsFromMeta.length
      ? requirementsFromMeta
      : requirementsFromBody
    )
      .map((item) => normalizeText(item))
      .filter(Boolean),
    applyUrl: normalizeText(
      record?.applyUrl,
      "careers.html#career-application",
    ),
    body: normalizeText(record?.body),
  };
}

function normalizeService(record, index) {
  return {
    id: normalizeText(record?.id, `service-${index + 1}`),
    title: normalizeMultilineText(record?.title, "Untitled service"),
    summary: normalizeText(
      record?.summary,
      getBodyExcerpt(record?.body, "Service description pending update."),
    ),
    image: normalizeText(record?.image, ""),
    heroImage: normalizeText(record?.heroImage, ""),
    imageSrcset: normalizeImageSet(record?.imageSrcset),
    imageSizes: normalizeText(record?.imageSizes),
    body: normalizeText(record?.body),
  };
}

function normalizePerson(record, index) {
  return {
    id: normalizeText(record?.id, `person-${index + 1}`),
    name: normalizeText(record?.name, "Unnamed team member"),
    title: normalizeMultilineText(record?.title, "Team Member"),
    focus: normalizeText(record?.focus, "Semiconductor delivery"),
    summary: normalizeText(
      record?.summary,
      getBodyExcerpt(record?.body, "Profile details are being updated."),
    ),
    email: normalizeText(record?.email, ""),
    profileUrl: normalizeText(record?.profileUrl, ""),
    linkedin: normalizeText(record?.linkedin, ""),
    image: normalizeText(record?.image, ""),
    imageSrcset: normalizeImageSet(record?.imageSrcset),
    imageSizes: normalizeText(record?.imageSizes),
    expertise: splitList(record?.expertise),
    body: normalizeText(record?.body),
  };
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return {
      meta: {},
      body: content,
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
    body: content.slice(match[0].length),
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
  if (textCache.has(path)) {
    return textCache.get(path);
  }

  const request = (async () => {
    const response = await fetch(path, {
      method: "GET",
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status}`);
    }

    return response.text();
  })();

  textCache.set(path, request);

  try {
    return await request;
  } catch (error) {
    textCache.delete(path);
    throw error;
  }
}

async function fetchCollection(manifestPath) {
  if (collectionCache.has(manifestPath)) {
    return collectionCache.get(manifestPath);
  }

  const request = (async () => {
    const manifestText = await fetchText(manifestPath);
    const files = parseManifest(manifestText);

    return Promise.all(
      files.map(async (fileName) => {
        const filePath = resolveSiblingPath(manifestPath, fileName);
        const raw = await fetchText(filePath);
        const parsed = parseFrontmatter(raw);

        return {
          ...parsed.meta,
          body: normalizeText(parsed.body),
          source: filePath,
        };
      }),
    );
  })();

  collectionCache.set(manifestPath, request);

  try {
    return await request;
  } catch (error) {
    collectionCache.delete(manifestPath);
    throw error;
  }
}

async function loadNormalizedCollection(path, normalizer) {
  try {
    const records = await fetchCollection(path);
    return records.map(normalizer);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function loadInsights(path = "content/insights/index.md") {
  return loadNormalizedCollection(path, normalizeInsight);
}

export async function loadRoles(path = "content/careers/index.md") {
  return loadNormalizedCollection(path, normalizeRole);
}

export async function loadServices() {
  return SERVICE_RECORDS.map(normalizeService);
}

export async function loadPeople() {
  return PEOPLE_RECORDS.map(normalizePerson);
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
    day: "2-digit",
  });
}

export function saveJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
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
