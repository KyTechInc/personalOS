# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**ky-os** is a macOS-inspired desktop environment simulation built with Next.js. It creates an immersive macOS experience in the browser, featuring:

- Complete macOS desktop environment with wallpaper, menubar, and dock
- Draggable, resizable windows with proper z-index management
- Mock applications (Terminal, AI Chat, Browser)
- Raycast-style command palette
- Responsive design that adapts to different screen sizes

## Development Commands

```bash
# Development server with Turbopack
bun dev

# Production build with Turbopack
bun build

# Start production server
bun start

# Lint the codebase
bun lint
```

## Architecture Overview

### Core Desktop System
- **Desktop Component** (`components/desktop.tsx`): Main orchestrator managing app state, wallpaper, and layout
- **Window Manager** (`components/window-manager.tsx`): Context provider for window z-indexing and focus management
- **OS Window** (`components/os-window.tsx`): Reusable draggable/resizable window component with localStorage persistence

### Key UI Components
- **MacOS Dock** (`components/ui/macos-dock.tsx`): Animated dock with authentic macOS magnification using cosine-based algorithm
- **MacOS Menubar** (`components/macos-menubar.tsx`): Top menubar with real-time clock and system controls
- **Launchpad & Raycast** (`components/launchpad.tsx`, `components/raycast.tsx`): App launchers and command palette

### Application Architecture
Apps are implemented as windowed components:
- **AI Chat** (`components/apps/ai-chat.tsx`): Chat interface using AI SDK with streaming
- **Warp Terminal** (`components/apps/warp-terminal.tsx`): Mock terminal with file system navigation
- **Fake Browser** (`components/apps/fake-browser.tsx`): Browser simulation with multiple tabs

### AI Integration
- Uses **AI SDK** (`@ai-sdk/react`) for streaming chat functionality
- **AI Elements** (`components/ai-elements/`): Pre-built AI chat UI components (conversation, messages, prompts, etc.)
- API route at `/api/chat/route.ts` with persona-constrained responses about Kyle/KyOS

## Key Technical Details

### Window Management
- Windows use `useWindowManager()` hook for proper layering
- Position/size persistence via localStorage with `storageKey` prop
- Drag/resize with viewport clamping and edge snapping
- Z-index management ensures proper window stacking

### Responsive Design
- Dock automatically scales icon sizes based on viewport dimensions
- Mobile-first approach with breakpoints for phone/tablet/desktop
- Components adapt spacing and sizing based on screen size

### Event System
- Custom events for inter-component communication (e.g., `ky-open-raycast`, `ky-set-wallpaper`)
- Event-driven app launching from dock clicks

### Styling & Theming
- **Tailwind CSS** with custom backdrop blur effects
- Dark theme enforced in layout with `className="dark"`
- Geist fonts (Sans & Mono) for typography
- macOS-inspired glass morphism effects

## File Structure Patterns

```
components/
├── apps/           # Individual windowed applications
├── ai-elements/    # AI SDK UI components  
├── ui/            # Reusable UI primitives (shadcn/ui)
├── desktop.tsx    # Main desktop orchestrator
├── dock.tsx       # Dock container
└── os-window.tsx  # Window wrapper component

lib/
└── dock-apps.ts   # App definitions and configuration

app/
├── api/chat/      # AI chat API endpoint
└── page.tsx       # Main entry point
```

## Development Notes

### Adding New Apps
1. Create component in `components/apps/`
2. Add app definition to `lib/dock-apps.ts`
3. Add state management and click handler in `components/desktop.tsx`
4. Use `OSWindow` wrapper for consistent windowing behavior

### Window Behavior
- All windowed apps should use the `OSWindow` component
- Provide unique `storageKey` for position/size persistence
- Use `onClose` callback for cleanup in parent component

### AI Chat Integration
- Chat API uses OpenAI GPT-4o-mini by default
- Responses are constrained to Kyle/KyOS context via system prompt
- Streaming responses handled automatically by AI SDK

### Styling Guidelines
- Use Tailwind utility classes consistently
- Maintain dark theme with glass morphism effects (`backdrop-blur-xl`, `bg-black/80`)
- Follow macOS design patterns for authentic feel
- Ensure responsive behavior across all components
