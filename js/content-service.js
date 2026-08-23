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
      "We architect coherent C2C and NoC fabrics, custom RISC-V and AI accelerators, mixed-signal MEMS subsystems, and atomics-capable DDR controllers from architecture through tape-out.",
    image: "/services/thumbnail-asic-design.png",
    heroImage: "/services/full-asic-design.png",
    body: `## High-Performance Chip-to-Chip Communication

  We engineer scalable ==C2C== and ==NoC== fabrics for compute-intensive ==Multi-Die Systems== where latency, coherency, and bandwidth are architectural constraints.

  - Cache-coherent interconnect architecture for heterogeneous CPU, GPU, NPU, and accelerator clusters
  - Low-latency NoC topology, routing, virtual channels, multicast, and QoS design for predictable service
  - Chiplet and Chip-to-Chip transport adaptation for standards-based and proprietary links, including UCIe-style integration
  - Bandwidth, latency, and congestion modeling across coherent, streaming, control-plane, and CXL-style traffic classes
  - Verification strategy for ordering, deadlock freedom, backpressure, link recovery, and RAS-oriented resilience

  ## Custom RISC-V Co-Processor and ISA Extensions

  We design high-performance ==RISC-V extensions== and tightly coupled ==AI accelerators== that translate critical workloads into differentiated latency, throughput, and energy efficiency.

  - Vector, tensor, matrix, SIMD, and domain-specific execution engines for AI inference, DSP, and edge workloads
  - Custom instruction, NPU, and co-processor microarchitecture with pipeline, issue, speculation, and exception integration
  - Tightly coupled memory, scratchpad, DMA, and cache-coherency strategy for high data-reuse workloads
  - Hardware-software contract definition spanning compiler intrinsics, runtime APIs, firmware, drivers, and performance counters
  - PPA-aware verification and performance modeling from microarchitecture through heterogeneous SoC integration

  ## MEMS-Enabled Digital Subsystems

  We turn sensor data into dependable system behavior through robust Digital Interfaces, ==Edge Processors==, and ==DSP== pipelines built around mixed-signal MEMS front ends.

  - Sensor interface RTL for mixed-signal front ends, control loops, low-power acquisition, and always-on sensing paths
  - Calibration, compensation, digital filtering, and sensor-fusion pipelines for reliable measurements
  - Deterministic timestamping, buffering, interrupt handling, and event sequencing across asynchronous clock domains
  - Sensor-hub architecture for multi-sensor aggregation, context awareness, embedded ML preprocessing, and host integration
  - Verification focused on real operating conditions, fault handling, data integrity, and integration corner cases

  ## DDR Memory Controller with Atomics Support

  We architect ==DDR Subsystems== that preserve memory ordering and ==Atomic Operations== under high concurrency, delivering predictable latency and bandwidth to CPUs, accelerators, chiplets, and I/O masters.

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
      "We boot real CPUs, SoCs, and AI accelerators on FPGA clusters months before silicon exists, turning tape-out risk into pre-silicon evidence.",
    image: "/services/thumbnail-rapid-fpga-prototyping.png",
    heroImage: "/services/full-rapid-fpga-prototyping.png",
    body: `## Multi-FPGA CPU and SoC Emulation

We ==partition large== CPU and SoC ==designs across arrays of FPGAs== so real cores boot and run before silicon even exists, exposing architectural issues no simulator could catch in a lifetime.

- Multi-FPGA partitioning strategy for designs that exceed a single device's capacity
- Inter-FPGA interconnect design for coherent, low-latency signal crossing across boards
- Real RISC-V, ARM, and custom core bring-up running actual boot code at MHz-class speeds
- Cross-FPGA clock and reset architecture that preserves cycle-level behavior fidelity
- Scale-out methodology proven on production multi-core and multi-die SoC programs

## Hardware-in-the-Loop for AI Accelerators

We ==Emulate Custom NPUs and AI Co-Processors== on FPGA fabric so real neural network workloads run against candidate hardware ==months before tape-out==.

- Accelerator RTL mapped to FPGA fabric with representative memory and datapath behavior
- Live inference execution against target neural network models and workloads
- Compiler, driver, and runtime bring-up against actual accelerator behavior, not a model
- Performance and utilization measurement under real workload traffic patterns
- Early feedback loop connecting architecture, software, and verification teams

## At-Speed Interoperability and Firmware Bring-Up

We ==connect prototypes to== real hosts, buses, and peripherals so protocol, firmware, and OS behavior ==get validated the way they will in the field==.

- PCIe, DDR, Ethernet, MIPI, and other high-speed interface bring-up against real partner hardware
- Full firmware and driver stack execution on prototype hardware ahead of first silicon
- OS boot and application-level validation using production-representative code paths
- Interrupt, DMA, and system-scenario testing under realistic traffic and timing
- Interoperability evidence suitable for partner and customer engagement

## Pre-Silicon Digital Twin for Demos and Risk Burn-Down

We treat the FPGA prototype as a living ==digital twin== of the ASIC, giving programs a demonstrable, revisable system ==months ahead of tape-out==.

- Demo-grade prototypes for internal reviews, customer previews, and ecosystem enablement
- Structured revision control across RTL, constraints, and board-level configuration
- Change-impact tracking tied to test evidence and open issue status
- Risk burn-down reporting for unresolved functional, performance, and integration gaps
- Final handoff package summarizing known limitations and tape-out readiness`,
  },
  {
    id: "service-rtl-design-verification",
    title: "RTL Design Verification",
    summary:
      "We find Deadlocks before Your Silicon does — coverage-driven RTL verification that builds first-silicon confidence and cuts debug churn.",
    image: "/services/thumbnail-rtl-design-verification.png",
    heroImage: "/services/full-rtl-design-verification.png",
    body: `## Formal Deadlock and Race Detection

We catch deadlocks, race conditions, and protocol violations before tape-out using ==formal proofs and assertion-based verification==, closing bug classes that regression alone would miss for years.

- Formal property proofs for deadlock freedom, mutual exclusion, and liveness on arbiters, FSMs, and interconnects
- Assertion-based verification embedded directly in RTL for always-on protocol and microarchitectural checking
- Corner-case exposure for race conditions across asynchronous and multi-clock domains
- Bug classes eliminated pre-silicon that would otherwise surface as field escapes
- Formal signoff evidence tied to specific design properties, not just simulated coverage

## UVM Coverage Closure for Complex SoCs

We build ==reusable UVM environments== that drive functional coverage to closure on the SoC corner cases that matter most, not just the ones easiest to hit.

- Constrained-random UVM testbenches targeting real protocol, data-path, and system-level scenarios
- Scoreboard and reference-model checking that catches silent data corruption, not just crashes
- Functional coverage models mapped directly to specification intent and known risk areas
- Reusable agents and sequences that cut environment bring-up time across projects
- Coverage closure reporting that shows exactly what is proven, not just percentages

## High-Throughput Regression and Fast Triage

We run ==large-scale regression suites== with disciplined triage that turns bug arrival into a verified fix in hours, not weeks.

- Smoke, feature, and stress regressions sized for daily and milestone-driven execution
- Automated failure classification that routes bugs to the right owner immediately
- Root-cause isolation across RTL, testbench, and tool interactions to kill false leads fast
- Fix-validation gates that prevent the same bug from reopening later in the program
- Bug arrival and closure trends that show real progress, not just activity

## Signoff-Ready, Quantified Residual Risk

We hand engineering leadership a ==quantified residual-risk report== so the tape-out decision is based on evidence, not guesswork.

- Coverage, assertion, and formal closure rolled into one signoff-ready view
- Explicit rationale for every waived or uncovered feature, with owner sign-off
- Residual-risk summary tied directly to business and schedule impact
- Signoff package built for engineering leadership and program governance review
- Post-signoff recommendations that carry verification insight into silicon bring-up`,
  },
  {
    id: "service-custom-ip-vip-development",
    title: "Custom IP & VIP Development",
    summary:
      "We ship drop-in RTL IP and protocol-proven VIP that integrate in days, not months, and keep paying off across every project that reuses them.",
    image: "/services/thumbnail-custom-ip-vip-development.png",
    heroImage: "/services/full-custom-ip-vip-development.png",
    body: `## IP That Integrates in Days, Not Months

We build ==drop-in RTL IP== with clean ==register maps and interface contracts== so integration teams plug it into a new SoC without weeks of back-and-forth.

- Microarchitecture for control, datapath, and interface-centric IP blocks built for first-try integration
- Parameterization that scales across projects without re-verification from scratch
- Clean register-map and interface contracts that eliminate integration guesswork
- Clock, reset, and low-power intent aligned to subsystem needs out of the box
- Handoff artifacts that let another team pick up the IP without your team in the room

## VIP That Catches What Real Silicon Would

We develop ==protocol-compliant VIP== that exercises ==legal, illegal, and recovery-sequence traffic==, catching interoperability bugs before they reach a partner's lab.

- Configurable UVM agents deployable active or passive without environment rework
- Protocol checkers, assertions, and scoreboards that catch violations compliance tests miss
- Scenario libraries covering error injection, recovery, and worst-case traffic patterns
- Coverage tied to protocol features and known risk hotspots, not generic templates
- Compliance reports ready to hand directly to customers and standards reviewers

## Packaging Built for Same-Day Adoption

We package IP and VIP with ==IP-XACT metadata== and dependency-mapped release bundles so a new team can integrate without a single support ticket.

- Releases packaged to IP-XACT or customer-specific conventions out of the box
- Dependency and configuration matrices that remove integration guesswork
- Lint, simulation, and performance qualification gates before every release
- Backward-compatibility guarantees that protect active projects from silent breakage
- Handoff bundles with usage guides, examples, and known-limitations called out upfront

## IP That Survives Years of Reuse

We maintain IP across ==multi-year, multi-project lifecycles== so a block built once keeps paying off instead of becoming stranded legacy.

- Change-impact analysis before any feature add or protocol revision lands
- Controlled deprecation with compatibility bridges instead of breaking changes
- Bug fixes qualified through regression gates before reaching any downstream project
- Branch and baseline governance that keeps multi-project reuse manageable
- Sustaining support that keeps integration and debug teams unblocked long-term`,
  },
  {
    id: "service-embedded-system-design",
    title: "Embedded System Design",
    summary:
      "We co-design RISC-V hardware and production firmware, from RTL and custom ISA extensions through BSPs, bootloaders, RTOS integration, and embedded Linux bring-up.",
    image: "/services/thumbnail-embedded-system-design.png",
    heroImage: "/services/full-embedded-system-design.png",
    body: `## Platforms Sized Right the First Time

We partition ==SoC, MCU, FPGA, and peripheral== workloads against real power and memory budgets so the platform doesn't get re-architected mid-program.

- SoC, MCU, FPGA, and peripheral partitioning matched to actual target workloads
- Memory hierarchy sized for real bandwidth, latency, and determinism requirements
- Interface architecture spanning sensor, control, networking, and storage domains
- Power and clock domain strategy aligned to real operating modes and duty cycles
- Interface contracts documented so hardware and firmware teams stop guessing

## Firmware That Boots Clean on First Bring-Up

We align ==BSP, boot flow, and driver bring-up== with board design assumptions so first power-on doesn't turn into a multi-week debug marathon.

- BSP and boot-flow definition with reset sequencing nailed down before bring-up day
- Driver bring-up for critical peripherals, buses, and interrupt infrastructure
- Middleware integration planned before, not after, hardware arrives
- Hardware abstraction boundaries that keep application code portable across revisions
- Staged bring-up milestones with clear pass criteria, not open-ended debug

## Debug That Finds Root Cause in Hours

We build ==cross-domain trace and correlation== tooling that turns an intermittent, timing-sensitive failure into a reproducible one.

- Trace, log, and event-correlation instrumentation built in from day one
- Fault isolation across firmware state, bus behavior, and peripheral status
- Reproducible test scenarios for the failures that only show up once a week
- Interface-level sanity monitors that catch integration regressions immediately
- Triage discipline that routes symptoms straight to the right subsystem owner

`,
  },
  {
    id: "service-eda-automation",
    title: "EDA Automation",
    summary:
      "We turn EDA flows into deterministic, self-triaging pipelines so engineers spend time on real bugs instead of babysitting runs.",
    image: "/services/thumbnail-eda-automation.png",
    heroImage: "/services/full-eda-automation.png",
    body: `## Runs That Are Deterministic, Not Lucky

We orchestrate ==lint, simulation, synthesis, and STA== flows so every run is reproducible, auditable, and traceable back to its exact inputs.

- Multi-tool orchestration spanning lint, simulation, synthesis, STA, and signoff-adjacent tasks
- Configuration-driven execution controllable at project, block, or target level
- Environment bootstrapping that catches setup drift before it wastes a run
- Traceable run IDs and output provenance for every artifact produced
- Standardized run wrappers that make invocation and logging identical across teams

## Triage That Flags Real Bugs in Minutes

We build ==regression intelligence== that separates real failures from ==infrastructure noise== automatically, before an engineer opens a log.

- Regression scheduling tuned for smoke, nightly, and milestone-grade suites
- Automatic failure bucketing and signature-based duplicate detection
- Retry and quarantine policies that stop flaky tests from burning engineer time
- Triage dashboards linking failures directly to commits and tool-version deltas
- Escalation hooks that page the right owner the moment a gate-critical failure hits

## Metrics That Drive Decisions, Not Just Dashboards

We turn raw logs into a ==coverage, QoR, and runtime metrics== backbone with objective gates for what "ready" actually means.

- Coverage, QoR, and runtime metrics extracted into normalized, comparable schemas
- Trend analytics across branches, milestones, and toolchain revisions
- Threshold-based quality gates with explicit pass/fail policy, not judgment calls
- Delta reporting that flags regressions in performance or closure the moment they appear
- Publish-ready summaries built for leadership review, not just engineering logs

## Pipelines That Scale With Your Compute

We integrate EDA automation into ==CI/CD== so verification and implementation run continuously without babysitting or license contention.

- CI pipeline integration for merge-gate, nightly, and release qualification workflows
- Job distribution across on-prem and cloud compute without manual load balancing
- License-aware scheduling that maximizes throughput under real tool capacity limits
- Cache and incremental execution that eliminates redundant, wasted reruns
- Runbook documentation that lets the pipeline survive beyond its original author`,
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
