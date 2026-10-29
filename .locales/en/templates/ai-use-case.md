# Template: AI Use Case

## General Information

| Field | Value |
|-------|-------|
| **Project** | |
| **Use Case** | |
| **Classification (AI Decision Gate)** | Level 1 (Code) / Level 2 (AIJev) / Level 3 (LLM) / Level 4 (Composite) |
| **Status** | Proposed / Approved / In Production |

## 1. Problem Description
What business or technical problem are we solving?

## 2. Why Deterministic Code Alone Is Not Enough?
Justify why an algorithmic rule or SQL query cannot solve this problem alone.

## 3. Operational Metrics & Constraints

| Metric | Target |
|--------|--------|
| **Expected Volume** | X calls/day |
| **Max Latency** | X ms |
| **Acceptable Error Rate** | X% |
| **Sensitive Data (PII) Involved?** | Yes / No |
| **Deterministic Fallback Implemented?** | Yes / No |

## Implementation

```csharp
// Interface to use:
// IDecisionProvider for classification/decision
// IGenerativeAIProvider for open generation
```
