# Design System Documentation Site

A documentation site for design systems that automatically extracts CSS documentation from JSDoc-style comments and renders them beautifully in MDX files.

**I just let Cursor go to town on this README to save time.**

## Features

* **Vite + Vue 3 + TypeScript** - Modern development stack
* **MDX Support** - Write docs in Markdown with embedded Vue components.  Supports Github Markdown.
* **Live Code Examples** - Interactive, editable Vue components with vue-live integration
* **Intelligent Search** - Fuzzy search across documentation, components, and CSS classes with autocomplete
* **GitHub Pages Deployment** - Automatic publishing via GitHub Actions
* **Automatic CSS Documentation** - JSDoc-style comments in CSS files are parsed at build time
* **Modular CSS Architecture** - Organized into separate files for buttons, cards, and utilities
* **Hot Reload** - Documentation updates automatically when CSS files change
* **Build-time Processing** - No runtime CSS parsing for optimal performance

## Quick Start

```bash
npm install
npm run dev
```

## Deets

### Core Implementation

- **`plugins/vite-plugin-css-docs.ts`** - Custom Vite plugin that scans CSS files at build time and extracts JSDoc comments into JSON
- **`src/components/CssDoc.vue`** - Vue component that fetches and displays the generated documentation
- **`vite.config.ts`** - Shows how the plugin is integrated into the build process

### Documentation Examples

- **`src/design-system-documentation.mdx`** - Main documentation file showing MDX + Vue components + live examples
- **`src/styles/button.css`** - Example CSS with JSDoc comments demonstrating the documentation format
- **`src/styles/card.css`** - Another CSS example with different comment structures

### Generated Output\

- **`src/generated/css-docs.json`** - Auto-generated documentation data (created when you run `npm run dev`)

## How It Works

1. **Build Time**: Vite plugin scans CSS files and extracts JSDoc-style comments
2. **Documentation**: JSDoc comments get parsed into structured JSON data
3. **Display**: Vue component fetches JSON and renders documentation in MDX files
4. **Live Examples**: Actual CSS classes are used to show working components

## Documentation Format

Add JSDoc-style comments to your CSS:

```css
/**
 * Primary button component for user actions
 * @param size The size variant (small, medium, large)
 * @example
 * <button class="btn btn-primary btn-large">Click me</button>
 * @since 1.0.0
 */
.btn {
  /* your styles here */
}
```

Then display in MDX files:

```jsx
<CssDoc filePath="src/styles/button.css" title="Button System" />
```

## Extending the System

### Adding New JSDoc Tags

1. Update the parser in `plugins/vite-plugin-css-docs.ts`
2. Modify the TypeScript interface `CssDocComment`
3. Update the display component `src/components/CssDoc.vue`

### Supporting New File Types

1. Add file extensions to `include` patterns in `vite.config.ts`
2. Adapt parsing logic for different comment styles (e.g., Sass/SCSS)

### Custom Output Formats

The plugin can be extended to generate:
- Static HTML files
- Markdown documentation
- JSON schemas for design tokens
- TypeScript interfaces
