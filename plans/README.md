# Animation plans

Plans produced by the `improve-animations` skill. Each plan is self-contained —
an executor with no context from the originating conversation should be able to
implement it exactly.

| # | Plan | Severity | Category | Scope | Status |
| --- | --- | --- | --- | --- | --- |
| 001 | [Add radial converge-in entrance animation to the bento grid](001-bento-radial-entrance.md) | MEDIUM | Missed opportunities | `src/components/bento-grid.tsx` | **DONE** |

## Recommended execution order

1. ~~**001**~~ — implemented. Two follow-up checks remain manual (reduced-motion
   emulation and a frame-rate profile); see "Verification results" in the plan.

## Dependencies

None. 001 touches a single file (`src/components/bento-grid.tsx`) and does not
overlap with any other planned work.

## Notes

- The shared entrance curve for this codebase is `cubic-bezier(0.16, 1, 0.3, 1)`
  (expo-out), established at `src/app/page.tsx:39`. Future motion plans should
  reuse it rather than introducing parallel curves.
- The bento grid's radial geometry (each tile's offset vector from the grid
  centre) is measured and tabulated in plan 001 under **Problem**. If the grid's
  column spans or tile order change, those vectors must be re-measured — they are
  hard-coded, not computed at runtime.
