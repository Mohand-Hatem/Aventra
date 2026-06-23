## Design System Enforcement

The project already has an established design system.

### Mandatory Rules

* Always use the colors, CSS variables, and design tokens defined in `globals.css`.
* Always use the typography system already configured in the project.
* Always use the fonts already configured through Next.js and the existing setup.
* Always use the theme tokens provided by shadcn/ui.
* Always use the existing spacing, radius, shadows, and design tokens.

### Forbidden

* Do not introduce new colors.
* Do not use hardcoded color values (`#xxxxxx`, `rgb()`, `hsl()`).
* Do not import new fonts.
* Do not create a new typography system.
* Do not create a new design language.
* Do not override the existing design system.

### UI Development Workflow

Before creating or modifying any UI:

1. Check `globals.css`.
2. Check the existing shadcn/ui theme tokens.
3. Reuse existing variables and styles.
4. Match the current visual style of the application.

Every generated UI must look consistent with the existing design system and should appear as if it was created by the same team that built the rest of the application.
