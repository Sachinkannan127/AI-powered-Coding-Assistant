# Theme System Guide

## Overview
The application now includes a dynamic theme switcher with 6 built-in themes. Users can switch themes via the palette icon in the header.

## Available Themes

### 1. Dark (Default)
- Background: Slate (dark blue-gray)
- Accent Colors: Cyan, Blue, Purple
- Best for: Late-night coding sessions

### 2. Light
- Background: Light gray/white
- Accent Colors: Darker cyan, blue, purple
- Best for: Daytime use, reduced eye strain in bright environments

### 3. Purple
- Background: Deep indigo/purple
- Accent Colors: Violet, purple, pink gradient
- Best for: Creative mood, vibrant interface

### 4. Green
- Background: Dark forest green
- Accent Colors: Emerald, light green
- Best for: Reduced eye strain, nature-inspired aesthetic

### 5. Ocean
- Background: Deep ocean blue
- Accent Colors: Sky blue, cyan, bright cyan
- Best for: Calm, focused coding environment

### 6. Sunset
- Background: Dark orange/brown
- Accent Colors: Orange, warm orange, yellow
- Best for: Warm, cozy coding atmosphere

## Theme Persistence
- Selected theme is saved to `localStorage`
- Theme persists across browser sessions
- Key: `app-theme`

## Technical Implementation

### Files Modified:
1. **frontend/src/contexts/ThemeContext.tsx** (NEW)
   - Theme state management
   - localStorage persistence
   - Theme provider component

2. **frontend/src/components/ThemeSelector.tsx** (NEW)
   - Theme picker dropdown in header
   - Visual theme preview with color circles
   - Hover effect reveals dropdown

3. **frontend/src/index.css**
   - CSS variables for dynamic theming
   - 6 theme definitions using `[data-theme="..."]` attributes
   - Variables: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--text-primary`, `--text-secondary`, `--accent-1`, `--accent-2`, `--accent-3`, `--border-color`

4. **frontend/src/App.tsx**
   - Replaced hardcoded Tailwind classes with CSS variables
   - Added ThemeSelector component to header
   - All colors now respond to theme changes

5. **frontend/src/main.tsx**
   - Wrapped App with ThemeProvider

## How to Add Custom Themes

### Step 1: Define Theme Colors in index.css
```css
[data-theme="custom-name"] {
  --bg-primary: #your-color;
  --bg-secondary: #your-color;
  --bg-tertiary: #your-color;
  --text-primary: #your-color;
  --text-secondary: #your-color;
  --accent-1: #your-color;
  --accent-2: #your-color;
  --accent-3: #your-color;
  --border-color: #your-color;
}
```

### Step 2: Add Theme to ThemeSelector.tsx
```typescript
// Update the Theme type
export type Theme = 'dark' | 'light' | 'purple' | 'green' | 'ocean' | 'sunset' | 'custom-name'

// Add to themes array
const themes = [
  // ... existing themes
  { 
    value: 'custom-name', 
    label: 'Custom Name', 
    colors: ['#color1', '#color2', '#color3'] 
  },
]
```

## CSS Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `--bg-primary` | Main background | Gradients, body background |
| `--bg-secondary` | Secondary background | Cards, header, footer |
| `--bg-tertiary` | Tertiary background | Input fields, buttons |
| `--text-primary` | Primary text color | Headings, body text |
| `--text-secondary` | Secondary text color | Subtitles, descriptions |
| `--accent-1` | First accent color | Gradient start |
| `--accent-2` | Second accent color | Primary buttons, active tabs |
| `--accent-3` | Third accent color | Gradient end |
| `--border-color` | Border color | Card borders, dividers |

## Usage in Components

### Using CSS Variables in styled attributes:
```typescript
<div style={{ backgroundColor: 'var(--bg-secondary)' }}>
  <p style={{ color: 'var(--text-primary)' }}>Text</p>
</div>
```

### Using in Tailwind classes (via index.css):
```typescript
<button className="btn-primary">Button</button>
```

The `.btn-primary` class uses `var(--accent-2)` internally, so it adapts to all themes.

## Theme Switcher UI
- Located in header next to "Online" status indicator
- Hover over palette icon to reveal dropdown
- Click theme name to switch instantly
- Active theme has a colored ring indicator
- Each theme shows 3-color preview circles

## Browser Compatibility
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Requires CSS Custom Properties (CSS Variables) support
- LocalStorage required for persistence

## Future Enhancements
Consider adding:
- Theme randomizer
- Time-based theme switching (auto dark/light)
- Custom theme creator with color picker
- Import/export theme configurations
- High contrast accessibility mode
- System theme detection (`prefers-color-scheme`)
