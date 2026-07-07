# Figma Implementation Rules

These rules are mandatory when implementing UI from Figma.

1. All designs must be implemented to match Figma exactly.
2. Never implement from screenshot/image-only interpretation.
   - Image attachments are reference-only.
   - Implementation decisions (layout, color, spacing, hierarchy, z-index, blur bounds, empty states) must be based on Figma MCP frame/node data.
3. Before implementation, the target frame/node must be read from Figma MCP.
   - Use the exact frame URL or node-id provided by the user.
   - If frame/node access fails or is ambiguous, stop and ask the user before coding.
4. If image and Figma MCP data conflict, Figma MCP data is the source of truth.
5. Color, font size, font weight, and spacing must be implemented with Tailwind based on Figma Styles.
   - Font sizes should use Tailwind scale classes first (for example: `text-sm`, `text-base`, `text-xl`).
   - Use `text-[Npx]` only when Figma size cannot be represented appropriately by Tailwind scale.
6. Icons (named in the `icon-set:icon-name` form and composed of path/vector shapes) must be handled through `src/components/Icons.tsx` by:
   - reusing an existing icon that follows the current code convention, or
   - adding a new icon following the same code convention.
7. For stateful screens (loading/empty/not-created/in-progress/failed), each state must be validated against its corresponding Figma frame/node.
8. Fixed pixel width/height from MCP should not be hard-coded when the project layout is responsive.
   - Preserve Figma proportions and structure, but implement with fluid containers (`w-full`, flex/grid ratios, min/max constraints) unless the design explicitly requires fixed sizing.
9. Pre-commit self-check for Figma tasks (mandatory):
   - Confirm target node-id/frame was read via MCP.
   - Confirm key visual tokens (colors, typography, spacing, radius, blur, z-index layering) were taken from MCP data.
   - Confirm no mock/fallback values remain where the frame specifies empty-state content.
