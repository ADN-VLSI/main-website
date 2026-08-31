---
id: 2026-rtl-arbiter-architectures
category: studies
image:
title: RTL Arbiter Architectures: Fixed-Priority, Round-Robin, and Hybrid Designs
summary: A concise comparison of four RTL arbiter architectures (fixed-priority, round-robin, rotating-priority, and hierarchical hybrid) covering fairness, latency, area, timing, and verification trade-offs.
date: 2026-08-23
author: Shykul Islam Siam
url: contact.html
---

Arbiters select one requester from several competing for a shared resource, such as memory interfaces, buses, interconnects, DMA controllers, and shared peripherals. The architecture chosen affects **fairness, latency, area, timing, power, and verification effort**. This article covers four common approaches.

---

## 1. Fixed-Priority Arbiter

Each requester has a permanent priority. The highest-priority active requester always wins:

$$
G3 = R3
$$

$$
\quad G2 = \overline{R3} \land R2,
$$

$$
\quad G1 = \overline{R3}\,
$$

$$
\overline{R2} \land R1, \quad G0 = \overline{R3}\,\overline{R2}\,\overline{R1} \land R_0
$$


```systemverilog
module fixed_priority_arbiter #(parameter int NUM_REQ = 4) (
    input  logic [NUM_REQ-1:0] req_i,
    output logic [NUM_REQ-1:0] grant_o
);
    always_comb begin
        grant_o = '0;
        for (int i = NUM_REQ-1; i >= 0; i--)
            if (req_i[i]) begin
                grant_o[i] = 1'b1;
                break;
            end
    end
endmodule
```

Critical path grows roughly as $T_{critical} \propto O(N)$.

**Pros:** simplest RTL, deterministic, near-zero state, easy to verify.
**Con:** starvation. A persistent high-priority requester can lock out everyone below it indefinitely.

---

## 2. Round-Robin Arbiter

Priority rotates after each grant, so the pointer advances to the requester after the one just served:

```systemverilog
module round_robin_arbiter #(
    parameter int NUM_REQ = 4,
    parameter int PTR_W   = $clog2(NUM_REQ)
)(
    input  logic clk, rst_ni,
    input  logic [NUM_REQ-1:0] req_i,
    output logic [NUM_REQ-1:0] grant_o
);
    logic [PTR_W-1:0] pointer_q, next_pointer;

    always_comb begin
        grant_o = '0;
        next_pointer = pointer_q;
        for (int offset = 0; offset < NUM_REQ; offset++) begin
            int index = (pointer_q + offset) % NUM_REQ;
            if (grant_o == '0 && req_i[index]) begin
                grant_o[index] = 1'b1;
                next_pointer = (index == NUM_REQ-1) ? '0 : index + 1;
            end
        end
    end

    always_ff @(posedge clk or negedge rst_ni)
        pointer_q <= !rst_ni ? '0 : next_pointer;
endmodule
```

With $N$ continuously active requesters, each is guaranteed service within $N$ arbitration rounds, which is far stronger fairness than fixed priority.

**Pros:** fair, starvation-resistant, good for shared buses/DMA.
**Cons:** needs pointer state, slightly longer combinational path, more verification cases.

---

## 3. Rotating-Priority Arbiter

A hardware-friendly way to implement round-robin: rotate the request vector by the pointer, run it through a plain fixed-priority encoder, then rotate the grant back.

```systemverilog
module rotating_priority_arbiter #(
    parameter int NUM_REQ = 4,
    parameter int PTR_W   = $clog2(NUM_REQ)
)(
    input  logic clk, rst_ni,
    input  logic [NUM_REQ-1:0] req_i,
    output logic [NUM_REQ-1:0] grant_o
);
    logic [PTR_W-1:0] pointer_q;
    logic [NUM_REQ-1:0] rotated_req, rotated_grant;

    always_comb begin
        rotated_req = '0; rotated_grant = '0; grant_o = '0;
        for (int i = 0; i < NUM_REQ; i++)
            rotated_req[i] = req_i[(pointer_q + i) % NUM_REQ];
        for (int i = NUM_REQ-1; i >= 0; i--)
            if (rotated_grant == '0 && rotated_req[i])
                rotated_grant[i] = 1'b1;
        for (int i = 0; i < NUM_REQ; i++)
            if (rotated_grant[i]) grant_o[(pointer_q + i) % NUM_REQ] = 1'b1;
    end

    always_ff @(posedge clk or negedge rst_ni) begin
        if (!rst_ni) pointer_q <= '0;
        else if (|grant_o)
            for (int i = 0; i < NUM_REQ; i++)
                if (grant_o[i]) pointer_q <= (i == NUM_REQ-1) ? '0 : i + 1;
    end
endmodule
```

$$
T_{critical} = T_{rotation} + T_{priority} + T_{unrotation}
$$

**Pros:** reuses standard priority-encoder logic, structured, works well with barrel shifters.
**Cons:** rotation network adds area/timing overhead at wide requester counts.

---

## 4. Hierarchical Hybrid Arbiter

For large requester counts, split into groups: arbitrate locally, then arbitrate among groups. Policies can differ per level (e.g., fixed-priority inside a group, round-robin across groups).

```systemverilog
module hierarchical_arbiter #(
    parameter int NUM_REQ    = 16,
    parameter int GROUP_SIZE = 4,
    parameter int NUM_GROUPS = NUM_REQ / GROUP_SIZE
)(
    input  logic clk, rst_ni,
    input  logic [NUM_REQ-1:0] req_i,
    output logic [NUM_REQ-1:0] grant_o
);
    logic [NUM_GROUPS-1:0] group_req, group_grant;
    logic [NUM_REQ-1:0] local_grant;

    generate
        for (genvar g = 0; g < NUM_GROUPS; g++) begin : GEN_GROUP
            fixed_priority_arbiter #(.NUM_REQ(GROUP_SIZE)) u_local (
                .req_i(req_i[g*GROUP_SIZE +: GROUP_SIZE]),
                .grant_o(local_grant[g*GROUP_SIZE +: GROUP_SIZE])
            );
            assign group_req[g] = |req_i[g*GROUP_SIZE +: GROUP_SIZE];
        end
    endgenerate

    round_robin_arbiter #(.NUM_REQ(NUM_GROUPS)) u_group (
        .clk(clk), .rst_ni(rst_ni), .req_i(group_req), .grant_o(group_grant)
    );

    always_comb begin
        grant_o = '0;
        for (int g = 0; g < NUM_GROUPS; g++)
            if (group_grant[g])
                grant_o[g*GROUP_SIZE +: GROUP_SIZE] = local_grant[g*GROUP_SIZE +: GROUP_SIZE];
    end
endmodule
```

$$
T_{critical} \approx T_{local\_arbiter} + T_{group\_arbiter}
$$

**Pros:** scales to large requester counts, modular, mixable policies.
**Cons:** extra stage adds latency and verification surface; fairness depends on both levels.

_Note: this is the architectural concept. A production version needs careful coordination so only the selected group's requester is actually granted._

---

## Comparison

| Architecture        | Fairness     | Complexity | State   | Critical Path | Strength                  |
| ------------------- | ------------ | ---------- | ------- | ------------- | ------------------------- |
| Fixed-Priority      | Low          | Low        | None    | Low–Medium    | Deterministic, cheap      |
| Round-Robin         | High         | Medium     | Pointer | Medium        | Fair sharing              |
| Rotating-Priority   | High         | Med–High   | Pointer | Med–High      | Structured round-robin    |
| Hierarchical Hybrid | Configurable | High       | Usually | Medium        | Scales to many requesters |

**Pick fixed-priority** for small, deterministic control paths where starvation is acceptable. **Pick round-robin** when fairness matters and a little state is fine. **Pick rotating-priority** when you want round-robin behavior built from a standard priority encoder. **Pick hierarchical hybrid** when requester counts are large enough that a flat arbiter won't meet timing.

---

## Verification Checklist

- **One-hot grant:** $\sum_i G_i \leq 1$
- **Grant implies request:** $G_i \rightarrow R_i$
- **No grant when idle:** all-zero request → all-zero grant
- **Fixed-priority:** highest active requester always wins
- **Round-robin:** pointer advances correctly after each grant; continuously active requesters are eventually serviced (no starvation)
- **Reset:** state and pointer return to spec on reset

Use directed tests, assertions, and constrained-random regression to cover these.

---

## Conclusion

There's no universally best arbiter. Fixed-priority wins on simplicity, round-robin and rotating-priority win on fairness, and hierarchical hybrids win on scalability. Choose based on the system's actual priority, fairness, timing, area, and verification requirements, not on which RTL is easiest to write.

> **Key Takeaway:** Pick the arbitration policy from system requirements first, then pick the architecture. If you start from "what's easiest to code," you'll end up with fixed-priority everywhere and hidden starvation bugs later.
