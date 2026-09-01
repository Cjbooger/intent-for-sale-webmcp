# INTENT//FOR SALE design contract

Current reference: `verified-dashboard-1440x900.png`

## Product surface

Build a dense, code-native market-operations console rather than a landing page. The
complete scenario must remain understandable without WebMCP: intent, auction,
commercial ranking, receipt, policy change, clean-room reversal, and staged selection.

## Layout

- Compact status header: brand, session, WebMCP availability, commercial pressure.
- Three-column work area: intent and policy; rankings; synthetic bidstream.
- Full-width audit area: activity ledger, score waterfall, selection confirmation.
- At narrow widths, preserve reading order and stack panels without horizontal scroll.

## Visual tokens

- Background: `#080b0b`
- Surface: `#111615`
- Raised surface: `#171d1b`
- Rule: `#2b3531`
- Text: `#f0f3e7`
- Muted text: `#8e9a92`
- Verified / clean room: `#baff38`
- Commercial influence: `#ff4f98`
- Disclosure: `#ffc85c`
- Danger: `#ff766c`
- Supporting signal: `#78e4d0`
- UI copy uses a clean system sans; metadata and numbers use a system monospace.
- One-pixel rules, compact spacing, minimal rounding, no decorative gradients or glow.

## Data corrections from the visual concept

- Use the canonical five offers from the deterministic fixture.
- OmniMotion market score is `84.6` (`54.6 + 30.0`), never `86.4`.
- CPA dollars and score contributions must be separate.
- The ledger contains the seven actual WebMCP tool names.
- All brands, bids, claims, payouts, and selections are explicitly fictional.
