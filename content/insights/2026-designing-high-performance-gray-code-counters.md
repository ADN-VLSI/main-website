---
id: 2026-designing-high-performance-gray-code-counters
type: studies
category: studies
title: Designing High-Performance Gray Code Counters: 4 RTL Architectures and Their Trade-offs
summary: A deep dive into four distinct Gray code counter architectures in SystemVerilog, comparing physical design trade-offs and providing an engineering selection framework for ASIC and FPGA designs.
date: 2026-08-23
author: Ahasan Ullah Khalid
url: contact.html
---

## Designing High-Performance Gray Code Counters: 4 RTL Architectures and Their Trade-offs

Gray code counters are foundational components in modern digital VLSI systems. Because consecutive Gray code words differ by exactly one bit ($\text{Hamming distance} = 1$), they eliminate multi-bit transition skew, prevent race conditions in asynchronous Clock Domain Crossing (CDC) FIFO pointers, and reduce dynamic switching power in bus encoding.

However, implementing a counter that naturally traverses a non-weighted reflected Gray code sequence presents distinct architectural challenges. This post explores four distinct Gray code counter architectures in SystemVerilog, compares their physical design trade-offs, and provides an engineering selection framework for ASIC and FPGA designs.

---

### Architecture 1: The Canonical Binary Intermediate Counter (Gray $\to$ Binary $\to$ Add $\to$ Gray)

The standard industry approach stores the current count in a Gray code register, decodes it into binary, adds 1, and encodes the result back into Gray code before registering it.

```
       ┌───────────┐     ┌─────────┐     ┌───────────┐
Gray ─►│  Gray-to- │────►│ Add '+1'│────►│ Binary-to-│──► Next Gray
State  │  Binary   │ bin │  Adder  │ b+1 │   Gray    │    State
       └───────────┘     └─────────┘     └───────────┘
```

#### Boolean Transformations

For an $N$-bit vector:

**Gray to Binary:**

$$
B[N-1] = G[N-1]
$$

$$
B[i] = B[i+1] \oplus G[i] \quad \text{for } i = N-2 \text{ down to } 0
$$

Equivalently, $B[i] = \bigoplus_{k=i}^{N-1} G[k]$.

**Increment:**

$$
\text{BinNext} = B + 1
$$

**Binary to Gray:**

$$
G_{\text{next}} = \text{BinNext} \oplus (\text{BinNext} \gg 1)
$$

#### SystemVerilog Implementation

```systemverilog
module gray_counter_canonical #(
    parameter int WIDTH = 4
)(
    input  logic             clk,
    input  logic             rst_n,
    input  logic             enable,
    output logic [WIDTH-1:0] gray_out
);

    logic [WIDTH-1:0] bin_val;
    logic [WIDTH-1:0] bin_next;
    logic [WIDTH-1:0] gray_next;

    // 1. Combinational Gray-to-Binary Conversion
    always_comb begin
        bin_val[WIDTH-1] = gray_out[WIDTH-1];
        for (int i = WIDTH-2; i >= 0; i--) begin
            bin_val[i] = bin_val[i+1] ^ gray_out[i];
        end
    end

    // 2. Binary Increment
    assign bin_next  = bin_val + {{(WIDTH-1){1'b0}}, enable};

    // 3. Binary-to-Gray Conversion
    assign gray_next = bin_next ^ (bin_next >> 1);

    // 4. State Register
    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            gray_out <= '0;
        end else begin
            gray_out <= gray_next;
        end
    end

endmodule
```

#### Timing Analysis

The critical path consists of an $O(N)$ XOR chain (Gray-to-Binary) $+$ an $O(N)$ carry chain (Adder) $+$ 1 XOR stage (Binary-to-Gray). For wide counters ($N \ge 8$), this limits maximum clock frequency ($F_{\max}$) unless parallel prefix XOR trees are synthesized.

> **Dual-State Variant:** To eliminate the Gray-to-Binary XOR chain from the critical path, designers frequently register both the binary count and Gray count in parallel. This doubles flip-flop count but isolates the critical path to an adder and a single XOR gate.

---

### Architecture 2: Direct Gray-to-Gray Transition Logic

Direct Gray counters evaluate the next single-bit flip natively from the current Gray word, bypassing binary conversion entirely.

#### The Toggle-Bit Rule

In a standard $N$-bit reflected Gray code sequence:

- **Rule A (Even Parity / Odd Step):** If the total parity (sum of 1s) of the current Gray vector $G[N-1:0]$ is even, flip the least significant bit: $G[0]$.
- **Rule B (Odd Parity / Even Step):** If the total parity is odd, locate the lowest bit $G[k]$ that equals 1. Flip the bit immediately to its left: $G[k+1]$.
- **Rollover Exception:** At the terminal count ($100\dots0$), the parity is odd and $G[N-1]$ is the lowest 1. Rolling over to 0 requires toggling $G[N-1]$.

| Current Gray | Parity | Lowest '1' Position | Target Toggle Bit | Next Gray |
| :----------: | :----: | :-----------------: | :---------------: | :-------: |
|  `0 0 0 0`   |  Even  |          —          |       Bit 0       | `0 0 0 1` |
|  `0 0 0 1`   |  Odd   |        Bit 0        |       Bit 1       | `0 0 1 1` |
|  `0 0 1 1`   |  Even  |          —          |       Bit 0       | `0 0 1 0` |
|  `0 0 1 0`   |  Odd   |        Bit 1        |       Bit 2       | `0 1 1 0` |

#### SystemVerilog Implementation

```systemverilog
module gray_counter_direct #(
    parameter int WIDTH = 4
)(
    input  logic             clk,
    input  logic             rst_n,
    input  logic             enable,
    output logic [WIDTH-1:0] gray_out
);

    logic             parity;
    logic [WIDTH-1:0] toggle_mask;
    logic [WIDTH-1:0] gray_next;

    // Calculate global parity: 0 = even, 1 = odd
    assign parity = ^gray_out;

    always_comb begin
        toggle_mask = '0;

        if (enable) begin
            if (!parity) begin
                // Rule A: Even parity -> toggle LSB
                toggle_mask[0] = 1'b1;
            end else begin
                // Rule B: Odd parity -> toggle bit above lowest set bit
                // Priority scan for lowest '1'
                for (int i = 0; i < WIDTH-1; i++) begin
                    if (gray_out[i]) begin
                        toggle_mask[i+1] = 1'b1;
                        break;
                    end
                end

                // Terminal rollover condition (e.g., 4-bit 1000 -> 0000)
                if (gray_out == {1'b1, {(WIDTH-1){1'b0}}}) begin
                    toggle_mask = {1'b1, {(WIDTH-1){1'b0}}};
                end
            end
        end
    end

    assign gray_next = gray_out ^ toggle_mask;

    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            gray_out <= '0;
        end else begin
            gray_out <= gray_next;
        end
    end

endmodule
```

#### Timing Analysis

Replaces arithmetic adders with a parity reduction tree ($\log_2 N$) and priority scan logic.

> **Trade-off:** Synthesizes well for moderate bit widths ($N \le 6$). Beyond 6 bits, the priority scan logic begins creating unbalanced paths across bit lanes.

---

### Architecture 3: ROM / LUT-Based Table Counter

When bit widths are small ($N \le 6$) and minimum logic depth or ultra-low power is required, all Gray code transitions can be precomputed and mapped directly into combinational Look-Up Tables or a synthesis ROM.

No runtime arithmetic or XOR reduction takes place. The current Gray state serves directly as the address to fetch the next Gray state.

```
                  ┌──────────────────────┐
                  │ 16x4 LUT / ROM Table │
                  ├──────────┬───────────┤
                  │ Address  │ Next Gray │
                  ├──────────┼───────────┤
                  │  4'b0000 │  4'b0001  │
Current Gray ────►│  4'b0001 │  4'b0011  │────► D-Flip-Flop ────► Output
(Address)         │  4'b0011 │  4'b0010  │
                  │   ...    │    ...    │
                  │  4'b1000 │  4'b0000  │
                  └──────────┴───────────┘
```

#### SystemVerilog Implementation

```systemverilog
module gray_counter_lut #(
    parameter int WIDTH = 4
)(
    input  logic             clk,
    input  logic             rst_n,
    input  logic             enable,
    output logic [WIDTH-1:0] gray_out
);

    localparam int DEPTH = 1 << WIDTH;
    logic [WIDTH-1:0] next_state_rom [0:DEPTH-1];
    logic [WIDTH-1:0] gray_next;

    // Precalculate Gray Code Table at elaboration
    initial begin
        for (int b = 0; b < DEPTH; b++) begin
            int b_next;
            int g_curr;
            int g_next;

            b_next = (b + 1) % DEPTH;
            g_curr = b ^ (b >> 1);
            g_next = b_next ^ (b_next >> 1);

            next_state_rom[g_curr] = g_next[WIDTH-1:0];
        end
    end

    assign gray_next = enable ? next_state_rom[gray_out] : gray_out;

    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            gray_out <= '0;
        end else begin
            gray_out <= gray_next;
        end
    end

endmodule
```

#### FPGA Mapping

On modern 6-input LUT architectures (e.g., AMD UltraScale+ / Intel Stratix 10), a 4-bit, 5-bit, or 6-bit counter maps into exactly $N$ LUTs placed in a single logic level between registers, operating at maximum device speed ($F_{\max} > 800\text{ MHz}$).

> **Limitation:** Memory depth scales exponentially ($2^N$). Unsuitable for $N > 6$.

---

### Architecture 4: Hierarchical Partitioned (Mixed) Architecture

For wide Gray counters ($N \ge 8$ or $N = 16$), standard designs suffer from long carry or XOR chains. A partitioned architecture divides the $N$-bit counter into smaller, independently advancing sub-counters (e.g., two 4-bit counters).

To maintain the strict single-bit transition property across domain boundaries, the upper sub-counter must increment only when the lower sub-counter is at a specific single-state trigger, and the upper counter's bit transitions must be interleaved so both never toggle in the same clock edge.

```
              ┌───────────────────────────┐
              │    4-bit Lower Sub-Gray   │──────► Gray[3:0]
   Enable ───►│ (LUT-based / Fast Direct) │
              └─────────────┬─────────────┘
                            │ Terminal Detect
                            ▼
              ┌───────────────────────────┐
              │    4-bit Upper Sub-Gray   │──────► Gray[7:4]
              │     (Clocked / Gated)     │
              └───────────────────────────┘
```

#### SystemVerilog Implementation

```systemverilog
module gray_counter_partitioned_8bit (
    input  logic       clk,
    input  logic       rst_n,
    input  logic       enable,
    output logic [7:0] gray_out
);

    logic [3:0] lower_gray;
    logic [3:0] upper_gray;
    logic [3:0] lower_bin;
    logic [3:0] upper_bin;
    logic       upper_en;

    // Convert internal states for safe boundary detection
    always_comb begin
        lower_bin[3] = lower_gray[3];
        for (int i = 2; i >= 0; i--) begin
            lower_bin[i] = lower_bin[i+1] ^ lower_gray[i];
        end

        upper_bin[3] = upper_gray[3];
        for (int i = 2; i >= 0; i--) begin
            upper_bin[i] = upper_bin[i+1] ^ upper_gray[i];
        end
    end

    // Enable upper slice when lower slice reaches terminal state
    // (4'b1000 in binary = 15 -> 0 rollover condition)
    assign upper_en = enable && (lower_gray == 4'b1000);

    // Lower slice: Fast direct or canonical
    gray_counter_canonical #(.WIDTH(4)) u_lower (
        .clk     (clk),
        .rst_n   (rst_n),
        .enable  (enable),
        .gray_out(lower_gray)
    );

    // Upper slice: Increments once every 16 lower steps
    gray_counter_canonical #(.WIDTH(4)) u_upper (
        .clk     (clk),
        .rst_n   (rst_n),
        .enable  (upper_en),
        .gray_out(upper_gray)
    );

    assign gray_out = {upper_gray, lower_gray};

endmodule
```

---

### Architectural Trade-offs and Comparison

|             Architecture             |    Logic Gate Complexity     |    Critical Path Delay     | Area Scaling (N-bits) | Max Target $F_{\max}$ | Primary Weakness                         |
| :----------------------------------: | :--------------------------: | :------------------------: | :-------------------: | :-------------------: | :--------------------------------------- |
| **1. Canonical** (G $\to$ B $\to$ G) | Moderate (XOR trees + Adder) |   $O(N)$ carry/XOR depth   |     Linear $O(N)$     |        Medium         | Long logic cascade for wide counters     |
|      **2. Dual-Reg Canonical**       |  High (2x Register Storage)  |  $O(N)$ adder depth only   |     Linear $O(N)$     |         High          | Increased register dynamic power         |
|       **3. Direct Transition**       |   Low (Parity XOR + Muxes)   | $O(\log_2 N)$ parity tree  |     Linear $O(N)$     |         High          | Priority routing congestion at $N > 6$   |
|        **4. LUT / ROM-Based**        | Minimal (Single logic level) | $O(1)$ constant LUT depth  | Exponential $O(2^N)$  |      Ultra-High       | Impractical for widths $N > 6$           |
|       **5. Partitioned Mixed**       |  Moderate (Segmented logic)  | $O(N/k)$ partitioned depth |     Linear $O(N)$     |       Very High       | Requires careful boundary design for CDC |

---

### Selection Guidelines: Choosing the Right Counter

#### Choose the **LUT/ROM-based counter** when:

- The counter width is small ($N \le 5$ bits, such as FIFO depths of 16 to 32 words).
- Targeting FPGAs where each output bit maps cleanly into a single 5-LUT or 6-LUT, guaranteeing $F_{\max}$ closure above 600 MHz with minimal routing latency.

#### Choose the **Direct Transition counter** when:

- Minimizing dynamic switching power in ASICs is critical.
- You need to avoid wide binary carry chains without doubling flip-flop registers.

#### Choose the **Dual-Register Canonical counter** when:

- Implementing standard asynchronous FIFO write/read pointers ($N = 6$ to $12$ bits).
- Pointers must be compared simultaneously in both binary format (for ALMOST_FULL/ALMOST_EMPTY arithmetic calculations) and Gray format (for multi-bit CDC synchronization).

#### Choose the **Partitioned / Hierarchical counter** when:

- Designing high-width telemetry counters ($N \ge 16$ bits) running on high-speed system clocks where normal carry chains cause setup timing violations.

---

### Conclusion

Each Gray code counter architecture presents a unique balance of speed, area, and power. The canonical approach remains the industry workhorse for its simplicity and dual-format availability, while LUT-based and direct transition designs excel in constrained, narrow-width applications. For wide counters, hierarchical partitioning is the only scalable path to high-frequency operation without sacrificing the single-bit transition guarantee that makes Gray code indispensable in CDC and low-power bus encoding.

> **Key Takeaway:** There is no universal "best" Gray code counter — only the best counter for your specific bit width, target technology, and timing budget. Profile your synthesis results, measure your critical paths, and let the data guide your choice.
