const CONTACT_PRIMARY = Object.freeze({
  text: "Contact ADN",
  href: "contact.html"
});

const SERVICE_PRIMARY = Object.freeze({
  text: "Discuss This Service",
  href: "contact.html"
});

function joinHtml(parts) {
  return parts.join("");
}

function section(title, description, bullets) {
  const list = `<ul>${bullets.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  return `<h2>${title}</h2><p>${description}</p>${list}`;
}

export const PEOPLE_PAGES = {
  "people-asif-mahmood": {
    name: "Asif Mahmood",
    title: "Chairman, ADN Group",
    focus: "Strategic direction and capability growth",
    summary: "Providing the strategic vision behind ADN Group's growth and empowering ADN Semiconductors to build globally competitive semiconductor design and training capabilities from Bangladesh.",
    image: "/people/person-asif-mahmood.png",
    expertise: [
      "Group strategy",
      "Capability development",
      "Semiconductor ecosystem leadership"
    ],
    bodyHtml: joinHtml([
      "<p>Asif Mahmood provides the long-range strategic direction behind ADN Group growth and supports ADN Semiconductors in scaling global-quality design and training capabilities from Bangladesh.</p>"
    ]),
    primary: CONTACT_PRIMARY
  },
  "people-faruque-a-khan": {
    name: "Faruque A. Khan",
    title: "Founder, Managing Director & CEO",
    focus: "Organization building and execution quality",
    summary: "Leading the vision to build a high-quality front-end semiconductor design and training organization under ADN Group.",
    image: "/people/person-faruque-a-khan.png",
    expertise: [
      "Front-end design leadership",
      "Team scaling",
      "Delivery governance"
    ],
    bodyHtml: joinHtml([
      "<p>Faruque A. Khan leads the vision and execution model for ADN Semiconductors, focused on building a high-quality front-end semiconductor design and training organization under ADN Group.</p>"
    ]),
    primary: CONTACT_PRIMARY
  },
  "people-foez-ahmed": {
    name: "Foez Ahmed",
    title: "Technical Lead, Engineering Division",
    focus: "Architecture, SoC integration, verification closure, and delivery quality",
    summary: "Senior RTL and verification engineer with 4+ years of hands-on ASIC and FPGA delivery experience across RISC-V SoC architecture, AMBA interconnects, and verification-first execution.",
    image: "/people/person-foez-ahmed.png",
    expertise: [
      "SystemVerilog RTL and UVM",
      "RISC-V SoC and cache architecture",
      "AXI, AHB, APB, OBI, Wishbone interconnects",
      "Lint, CDC/RDC, and synthesis-ready handoff",
      "Formal and SVA-based verification",
      "Python, Bash, Makefile automation"
    ],
    bodyHtml: joinHtml([
      "<p>Foez Ahmed is a Senior Engineer in RTL Design and Verification at ADN Semiconductor. His work spans the full front-end silicon flow, from micro-architecture planning and RTL implementation to verification closure and synthesis-ready handoff.</p>",
      "<p>Since starting his professional journey in 2022, he has built deep execution strength in AMBA-based systems, reusable IP development, and integration-heavy SoC programs, including RV64G platform work. He is experienced in SystemVerilog, UVM, assertion-based verification, and formal methods, with practical delivery discipline around lint, CDC/RDC, and signoff readiness.</p>",
      "<p>He also builds workflow automation with Python, Bash, and Makefile-based tooling to improve regression throughput, coverage tracking, and repeatability across client-oriented hardware projects.</p>"
    ]),
    primary: CONTACT_PRIMARY
  }
};

export const SERVICE_PAGES = {
  "service-asic-design": {
    title: "ASIC Design",
    summary: "End-to-end ASIC development from architecture through tape-out with measurable schedule and quality control.",
    image: "/services/full-asic-design.png",
    bodyHtml: joinHtml([
      section(
        "MEMS-Enabled Digital Subsystems",
        "We support MEMS product programs from the digital boundary inward. While third-party MEMS transducer and device design is outside our scope, we deliver the RTL and integration architecture that turns MEMS data into dependable system behavior.",
        [
          "Sensor interface RTL around mixed-signal front-ends and control paths",
          "Calibration, compensation, and digital filtering pipelines",
          "Sensor hub and fusion control logic for multi-sensor systems",
          "Interrupt and event handling, timestamping, buffering, and data path reliability",
          "Verification strategy focused on real integration conditions and corner cases"
        ]
      ),
      section(
        "Custom RISC-V Co-Processor and ISA Extensions",
        "We build custom RISC-V acceleration paths when standard cores are not enough for workload latency, power, or throughput targets.",
        [
          "Co-processor microarchitecture for domain-specific compute kernels",
          "Custom instruction extension definition and integration flow",
          "Hardware-software contract alignment for toolchain and firmware teams",
          "Pipeline, interface, and memory interaction optimization for practical PPA gains",
          "Verification collateral for extension correctness and integration confidence"
        ]
      ),
      section(
        "DDR Memory Controller with Atomics Support",
        "We develop and integrate DDR subsystems that preserve correctness under concurrency while sustaining performance at scale.",
        [
          "DDR controller architecture and subsystem integration planning",
          "Atomic operation support design for shared-memory and synchronization patterns",
          "Arbitration and QoS strategies for mixed traffic profiles",
          "Latency and throughput tuning across realistic contention scenarios",
          "Verification models and test plans for correctness, ordering, and stress behavior"
        ]
      ),
      section(
        "High-Performance Chip-to-Chip Communication",
        "We architect and implement chip-to-chip communication fabrics for bandwidth-heavy, latency-sensitive products.",
        [
          "Low-latency, high-throughput link subsystem design",
          "Protocol adaptation and framing logic for system-level interoperability",
          "Flow control, buffering, retry and recovery, and link robustness features",
          "Multi-die and multi-chip integration planning with scalable topology options",
          "Performance characterization targets and integration readiness artifacts"
        ]
      )
    ]),
    primary: SERVICE_PRIMARY
  },
  "service-rapid-fpga-prototyping": {
    title: "Rapid FPGA Prototyping",
    summary: "Fast, production-representative FPGA prototypes to de-risk architecture and accelerate software and system validation.",
    image: "/services/full-rapid-fpga-prototyping.png",
    bodyHtml: joinHtml([
      "<h2>ASIC-to-FPGA Adaptation Strategy</h2>",
      "<p>We translate ASIC intent into FPGA-ready implementations while preserving functional equivalence on the most risk-critical paths.</p>",
      "<ul><li>Prototype platform selection aligned to capacity, I/O, and timeline constraints</li><li>Partitioning strategy for multi-FPGA or single-device targets</li><li>RTL adaptation for FPGA resources, clocking structures, and memory primitives</li><li>Substitution planning for ASIC-only constructs while maintaining behavior fidelity</li><li>Constraint and build methodology tuned for fast iteration and stable closure</li></ul>",
      "<h2>Bring-Up, Timing Closure, and Interface Validation</h2>",
      "<p>We execute structured bring-up that prioritizes observability and early proof of key subsystem behavior under representative clocks and traffic.</p>",
      "<ul><li>Timing closure support with path prioritization and incremental optimization loops</li><li>High-speed I/O bring-up for protocol and board-level interoperability checks</li><li>On-chip debug instrumentation for triggerable and repeatable failure capture</li><li>Reset, clock, and CDC sanity strategy for prototype stability at scale</li><li>Bring-up evidence package with issue logs, fixes, and remaining constraints</li></ul>",
      "<h2>Pre-Silicon Software and System Enablement</h2>",
      "<p>We use prototypes to unblock firmware and system teams before silicon arrives, reducing schedule risk across downstream integration phases.</p>",
      "<ul><li>Firmware boot and driver validation against representative hardware behavior</li><li>System scenario emulation for workload, interrupt, and data-path integration testing</li><li>Application and middleware readiness checkpoints using prototype-based execution</li><li>Co-validation workflows across hardware, firmware, and test engineering teams</li><li>Demo readiness planning for internal reviews and customer-facing milestones</li></ul>",
      "<h2>Iteration Control and Program Risk Burn-Down</h2>",
      "<p>We manage prototype evolution with traceable revisions so teams can quantify progress and de-risk tape-out decisions.</p>",
      "<ul><li>Structured revision control for RTL, constraints, and board-level configuration</li><li>Change-impact analysis tied to test evidence and open issue status</li><li>Risk tracking for unresolved functional, performance, and integration gaps</li><li>Decision-support reporting for architecture and implementation trade-offs</li><li>Final handoff package with known limitations and next-step recommendations</li></ul>"
    ]),
    primary: SERVICE_PRIMARY
  },
  "service-rtl-design-verification": {
    title: "RTL Design Verification",
    summary: "Coverage-driven RTL verification that improves first-silicon confidence and reduces debug churn.",
    image: "/services/full-rtl-design-verification.png",
    bodyHtml: joinHtml([
      "<h2>Verification Planning and Risk Mapping</h2>",
      "<p>We define verification scope from product requirements and failure-risk analysis so effort is concentrated on the behaviors most likely to impact silicon success.</p>",
      "<ul><li>Requirement-to-test traceability model with measurable closure targets</li><li>Feature prioritization based on functional criticality and bug escape impact</li><li>Test intent decomposition across unit, subsystem, and SoC integration levels</li><li>Signoff criteria planning for coverage, bug maturity, and residual-risk thresholds</li><li>Milestone-based execution plan aligned to design maturity and release gates</li></ul>",
      "<h2>UVM Environment and ABV Infrastructure</h2>",
      "<p>We build scalable verification environments that support parallel development, reuse, and rigorous protocol and data-path checking.</p>",
      "<ul><li>UVM testbench architecture with reusable agents, sequences, and configuration layers</li><li>Assertion-based verification for protocol, timing, and microarchitectural properties</li><li>Scoreboard and reference-model strategy for deterministic correctness checking</li><li>Functional coverage model linked to specification intent and corner conditions</li><li>Environment coding standards that improve maintainability and debug clarity</li></ul>",
      "<h2>Regression Execution and Debug Closure</h2>",
      "<p>We run reproducible regressions with disciplined triage so teams can move from failure detection to verified fixes with minimal churn.</p>",
      "<ul><li>Regression suite strategy for smoke, feature, stress, and random scenarios</li><li>Failure classification and triage flow with owner mapping and priority control</li><li>Root-cause isolation support across design, testbench, and tool interactions</li><li>Fix validation gates to prevent reopen churn and unintended side effects</li><li>Trend reporting for bug arrival, closure velocity, and regression health</li></ul>",
      "<h2>Signoff Readiness and Residual-Risk Management</h2>",
      "<p>We prepare signoff artifacts that make verification status transparent, defensible, and actionable for project decision-makers.</p>",
      "<ul><li>Coverage closure analysis across code, functional, and assertion metrics</li><li>Uncovered-feature and waiver review with explicit technical rationale</li><li>Residual-risk summary tied to business and schedule impact assessment</li><li>Signoff review package for engineering leadership and program governance</li><li>Post-signoff recommendations for silicon bring-up and validation continuity</li></ul>"
    ]),
    primary: SERVICE_PRIMARY
  },
  "service-custom-ip-vip-development": {
    title: "Custom IP & VIP Development",
    summary: "Reusable custom IP and verification IP engineered for integration speed, protocol compliance, and long-term maintainability.",
    image: "/services/full-custom-ip-vip-development.png",
    bodyHtml: joinHtml([
      "<h2>Reusable Design IP Architecture</h2>",
      "<p>We build custom RTL IP blocks with reuse and predictable integration as first-order constraints.</p>",
      "<ul><li>Microarchitecture design for control, datapath, and interface-centric IP blocks</li><li>Parameterization strategy that balances configurability with timing and area discipline</li><li>Clean register-map and interface contract definition for firmware and integration teams</li><li>Clock, reset, and low-power intent alignment for subsystem-level consistency</li><li>Design documentation artifacts that support handoff, reuse, and maintainability</li></ul>",
      "<h2>Protocol-Aware VIP and Compliance Infrastructure</h2>",
      "<p>We develop VIP that validates protocol behavior under realistic operating conditions.</p>",
      "<ul><li>Configurable UVM agents with scalable active and passive deployment modes</li><li>Protocol checkers, assertions, and scoreboards aligned to spec intent</li><li>Scenario libraries for legal, illegal, and recovery-sequence traffic patterns</li><li>Coverage model planning tied to protocol features and risk hotspots</li><li>Compliance reporting structure for review, signoff, and customer visibility</li></ul>",
      "<h2>Integration-Centric Packaging and Release</h2>",
      "<p>We package IP and VIP for efficient adoption in customer environments.</p>",
      "<ul><li>Packaging aligned to IP-XACT or customer-specific release conventions</li><li>Integration metadata, dependency mapping, and configuration matrix support</li><li>Release qualification criteria covering lint, simulation, and basic performance checks</li><li>Backward-compatibility guidelines for revision updates across active projects</li><li>Handoff bundles with user guides, examples, and known-limitations disclosure</li></ul>",
      "<h2>Lifecycle Maintenance and Migration Planning</h2>",
      "<p>We support long-life IP programs with structured maintenance so teams can evolve functionality without destabilizing verified integrations.</p>",
      "<ul><li>Change-impact analysis for feature additions and protocol revision migration</li><li>Controlled deprecation strategy with compatibility bridges where required</li><li>Bug-fix qualification flow with regression gates before release propagation</li><li>Reuse governance model for multi-project branch and baseline management</li><li>Sustaining support framework for downstream integration and debug teams</li></ul>"
    ]),
    primary: SERVICE_PRIMARY
  },
  "service-embedded-system-design": {
    title: "Embedded System Design",
    summary: "Hardware-software co-design services for embedded platforms that must perform reliably in production environments.",
    image: "/services/full-embedded-system-design.png",
    bodyHtml: joinHtml([
      "<h2>Platform Architecture and System Partitioning</h2>",
      "<p>We define embedded platforms from system requirements downward, balancing compute, memory, interfaces, and power budgets against real deployment constraints.</p>",
      "<ul><li>SoC, MCU, FPGA, and peripheral partitioning strategy for target workloads</li><li>Memory hierarchy planning for bandwidth, latency, and deterministic behavior</li><li>Interface architecture across sensor, control, networking, and storage domains</li><li>Power and clock domain strategy aligned to operating modes and duty cycles</li><li>System dependency and interface contract documentation for cross-team alignment</li></ul>",
      "<h2>Firmware Bring-Up and Board-Level Integration</h2>",
      "<p>We enable predictable first bring-up by aligning low-level software with board design assumptions and silicon behavior from day one.</p>",
      "<ul><li>BSP and boot-flow definition including reset sequencing and initialization order</li><li>Driver bring-up for critical peripherals, buses, and interrupt infrastructure</li><li>Middleware integration planning for communication stacks and service layers</li><li>Early hardware abstraction boundaries that simplify application portability</li><li>Bring-up checklist and milestone criteria for staged platform readiness</li></ul>",
      "<h2>Cross-Domain Debug and Observability</h2>",
      "<p>We establish co-debug workflows that shorten root-cause loops across hardware, firmware, and integration boundaries.</p>",
      "<ul><li>Instrumentation strategy for trace, log, and event-correlation visibility</li><li>Fault isolation methods spanning firmware state, bus behavior, and peripheral status</li><li>Reproducible debug scenario design for intermittent and timing-sensitive issues</li><li>Interface-level sanity monitors for rapid detection of integration regressions</li><li>Issue triage discipline linking symptoms to actionable subsystem owners</li></ul>",
      "<h2>Validation for Production Reliability</h2>",
      "<p>We plan validation to expose field-relevant failures before release, with objective acceptance criteria tied to product requirements.</p>",
      "<ul><li>Validation matrix across performance, reliability, thermal, and stress conditions</li><li>Test procedures and pass or fail criteria for manufacturing and deployment contexts</li><li>Environmental and long-duration scenario coverage for stability confidence</li><li>Defect tracking with severity-based closure and residual-risk visibility</li><li>Productization handoff package for sustaining and operations teams</li></ul>"
    ]),
    primary: SERVICE_PRIMARY
  },
  "service-eda-automation": {
    title: "EDA Automation",
    summary: "Automation frameworks for EDA flows that improve throughput, repeatability, and decision speed across design and verification.",
    image: "/services/full-eda-automation.png",
    bodyHtml: joinHtml([
      "<h2>Flow Orchestration and Reproducible Execution</h2>",
      "<p>We automate design and verification flows so runs are deterministic, auditable, and easy to scale across teams and compute environments.</p>",
      "<ul><li>Multi-tool orchestration for lint, simulation, synthesis, STA, and signoff-adjacent tasks</li><li>Configuration-driven execution with project, block, and target-level parameter control</li><li>Environment bootstrapping and dependency validation to reduce setup variability</li><li>Artifact lifecycle handling with traceable run IDs and output provenance</li><li>Standardized run wrappers that enforce consistent invocation and logging behavior</li></ul>",
      "<h2>Regression Intelligence and Failure Triage</h2>",
      "<p>We improve debug velocity by structuring regressions for fast isolation of true failures versus infrastructure noise.</p>",
      "<ul><li>Regression scheduling logic for smoke, nightly, and milestone-grade suites</li><li>Automatic failure bucketing and signature-based duplicate detection</li><li>Retry and quarantine policies for unstable tests with accountability controls</li><li>Triage dashboards linking failures to commits, tool versions, and configuration deltas</li><li>Escalation hooks for critical gate failures and release-impacting regressions</li></ul>",
      "<h2>Metrics Engineering and Quality Gates</h2>",
      "<p>We build a data backbone that turns raw logs into engineering decisions, with objective gates for progress and release readiness.</p>",
      "<ul><li>Coverage, QoR, and runtime metric extraction with normalized schemas</li><li>Trend analytics across branches, milestones, and toolchain revisions</li><li>Threshold-based quality gate enforcement with pass and fail policy definitions</li><li>Delta reporting for rapid detection of regressions in performance or closure status</li><li>Publish-ready summaries for technical leadership and program management</li></ul>",
      "<h2>CI/CD and Compute-Scale Integration</h2>",
      "<p>We integrate EDA automation into CI infrastructure so verification and implementation pipelines can run continuously with controlled cost and capacity.</p>",
      "<ul><li>CI pipeline integration for merge-gate, nightly, and release qualification workflows</li><li>Job distribution strategies across on-prem and cloud compute resources</li><li>License-aware scheduling to maximize throughput under tool capacity limits</li><li>Cache and incremental execution strategies to reduce redundant reruns</li><li>Runbook and operating model documentation for sustainment and scaling teams</li></ul>"
    ]),
    primary: SERVICE_PRIMARY
  }
};

export const DEDICATED_SERVICES_MENU = Object.entries(SERVICE_PAGES).map(([id, item]) => ({
  id,
  title: item.title
}));
