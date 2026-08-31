---
id: 2026-why-aes-still-matters
category: guides
title: Why AES Still Matters — And Why Unprotected Implementations Are No Longer Enough
summary: An in-depth guide on the importance of AES in modern edge and embedded systems, and the necessity of side-channel countermeasures.
date: 2026-08-23
author: Adnan Sami Anirban
url: contact.html
---

AES has been the standard for symmetric encryption for more than two decades. It is widely deployed, thoroughly analyzed, and present in almost every secure system. Yet in modern edge devices, IoT systems, and SoCs, simply implementing AES correctly is no longer enough.

The algorithm remains strong. Many of its hardware implementations do not.

### Why AES Still Matters

AES continues to protect the most critical assets in embedded and edge systems: firmware and secure boot images, sensitive data at rest, communication between chips and the cloud, AI model parameters, and control data in automotive and industrial applications. When low-latency, power-efficient encryption is required, hardware AES engines remain essential.

AES is not legacy. It is infrastructure.

### The Real Risk: Side-Channel Attacks

A functionally correct AES core can still leak its secret key. Side-channel attacks exploit physical information — primarily power consumption and electromagnetic emissions — measured while the circuit is running. These attacks do not break the mathematics of AES; they recover the key from the hardware’s physical behavior.

In edge and IoT devices, physical access or proximity is often realistic. Once the key is extracted, encrypted firmware, secure boot chains, and sensitive data are all compromised.

Typical consequences include:

- Recovery of root or session keys
- Compromise of secure boot
- Exposure of firmware or AI model data
- Loss of trust in field-deployed devices

### Why Masking Helps

Boolean masking is a practical countermeasure against first-order side-channel attacks. Sensitive intermediate values are split into randomized shares using fresh masks. All computation is performed on these shares, and only the final result is recombined. This makes power and EM signatures much harder to correlate with the secret key.

Masking does not make attacks impossible, but it significantly raises the cost and difficulty for the attacker — a meaningful improvement for most edge and embedded applications.

### What We Are Building

We are developing a Side-Channel Resistant AES-128 Crypto IP that includes:

- AES-128 encrypt and decrypt with ECB and CBC modes
- First-order Boolean masking on the datapath and key schedule
- Standard APB/AXI-Lite control interface and streaming data interface
- Full verification covering functional correctness and basic security properties

The scope is intentionally focused. Higher-order masking and full laboratory side-channel evaluation are left for future work. The goal is a practical, reusable, and well-documented IP that SoC teams can integrate with confidence.

### Closing Perspective

AES remains essential. The threat model around it has changed. Implementing it correctly now means addressing not only functional accuracy but also physical leakage.

By combining a proven algorithm with a practical side-channel countermeasure and industrial-quality packaging, we aim to deliver an IP block aligned with the security needs of modern edge and embedded systems.
