# AuraSpatial — Xcode Project Source

This is the full Model/View/Controller source for the AuraSpatial midterm build, matching the SRS (`AuraSpatial SRS v2.0`) and the verified Figma Make prototype — including its actual visual design (colors, glow treatment, category color-coding, card styles), not just its screens and navigation.

## How to turn this into a real Xcode project

1. In Xcode: **File → New → Project → iOS → App**. Name it `AuraSpatial`, interface: **SwiftUI**, language: **Swift**. Set the minimum deployment target to **iOS 17.0** (required for `@Observable`, `PhaseAnimator`, `.sensoryFeedback`).
2. Delete the two files Xcode generates by default: `AuraSpatialApp.swift` and `ContentView.swift`.
3. Drag the `App`, `Models`, `Repositories`, `Audio`, `Controllers`, `Views`, and `Utilities` folders from this package into your new project's navigator (check **"Copy items if needed"** and **"Create groups"**).
4. Build (⌘B). Fix anything Xcode's Swift compiler flags — I've written this carefully but this environment has no macOS SDK, so it hasn't been compiler-verified.
5. Run in Simulator. Screenshot each of the 9 screens for your submission once you're happy with it.

## Folder structure

```
AuraSpatial/
├── App/
│   └── AuraSpatialApp.swift          — app entry point, injects AuthController, sets app-wide violet tint + dark scheme
├── Models/                            — plain Codable structs/enums (the "Model" in MVC)
│   ├── Enums.swift                    — WaveformType, SoundCategory (Nature/Ambient/Rhythm)
│   ├── SoundAsset.swift               — Sound Library catalog (procedurally synthesized, no bundled audio)
│   ├── SoundNode.swift                — one placed sound (position, volume, pan)
│   ├── Soundscape.swift               — a saved/shared arrangement of nodes
│   └── UserProfile.swift
├── Repositories/                      — protocol + local implementation per FR-4.3/FR-1.2/FR-5.3
│   ├── SoundscapeRepository.swift     — protocol (swap for Firebase in finals with zero View changes)
│   ├── LocalSoundscapeStore.swift     — JSON-file persistence for Saved Layouts
│   ├── AuthRepository.swift
│   ├── LocalAuthStore.swift           — simulated session via UserDefaults
│   ├── CommunityRepository.swift
│   └── LocalCommunityStore.swift      — bundled sample Community Feed data
├── Audio/                             — the advanced-SwiftUI/AVFAudio showcase
│   ├── ToneGenerator.swift            — procedural sine/triangle/noise buffer synthesis
│   └── SpatialAudioEngine.swift       — AVAudioEngine + AVAudioEnvironmentNode spatial mixing
├── Controllers/                       — @Observable classes (the "Controller" in MVC; see SRS 3.4)
│   ├── AuthController.swift
│   ├── CanvasController.swift
│   ├── SavedLayoutsController.swift
│   └── CommunityController.swift
├── Views/                             — one SwiftUI View struct per file/screen
│   ├── Root/
│   │   ├── RootView.swift             — routes auth flow vs. main tab shell
│   │   └── RootTabView.swift          — TabView: Canvas · Community · Saved, violet-tinted dark tab bar
│   ├── Auth/
│   │   ├── WelcomeView.swift          — Screen 1 — glowing icon, orbit preview graphic
│   │   ├── SignUpView.swift           — Screen 2 — custom dark fields
│   │   └── LogInView.swift            — Screen 3 — custom dark fields
│   ├── Canvas/
│   │   ├── CanvasView.swift           — Screen 4 (main screen) — orbit guide rings, floating add button, "Mix · <name>" bar
│   │   ├── SoundNodeView.swift        — reusable node component — category-colored glowing ring
│   │   └── MixerView.swift            — Screen 6 (sheet) — category-colored icon, themed sliders
│   ├── Library/
│   │   └── SoundLibraryView.swift     — Screen 5 (sheet) — category-colored rows
│   ├── Saved/
│   │   └── SavedLayoutsView.swift     — Screen 7 — orbit-glyph thumbnails, teal/red icon buttons
│   ├── Community/
│   │   ├── CommunityFeedView.swift    — Screen 8
│   │   └── CommunitySoundscapeCardView.swift — reusable card — animated waveform + play button
│   └── Profile/
│       └── ProfileView.swift          — Screen 9 (sheet)
└── Utilities/
    ├── Theme.swift                    — design tokens: Color palette + SoundCategory accent colors + glow modifier
    ├── ButtonStyles.swift             — primary/secondary pill buttons + floating action button style
    ├── OrbitGlyph.swift               — the recurring "orbit" brand mark (Welcome + Saved Layouts thumbnails)
    ├── WaveformGlyph.swift            — small waveform icon + the animated Community-card waveform background
    ├── PillBadge.swift                — colored capsule label + small icon-square buttons
    └── AuraLabeledField.swift         — the dark rounded field + uppercase caption used on auth screens
```

## Visual design system — matched to the actual Figma prototype

An earlier draft of this code implemented the prototype's *screens and features* correctly but not its *look* — it used plain system `Form`/`List` styling and generic colors instead of the prototype's actual dark, glowing, color-coded design. That gap was found by re-screenshotting the live prototype and comparing it side-by-side against the code, then closed by building a real design system instead of ad hoc styling:

- **Color tokens** (`Theme.swift`): a near-black background, a dark surface color for cards/sheets, and three accent colors pulled from the prototype — violet (primary/Ambient), teal (Nature), amber (Rhythm) — plus a glow modifier (`.auraGlow(_:radius:)`) used on the listener orb, the floating add button, and selected/playing states.
- **Category color-coding**: every `SoundAsset` now carries a `SoundCategory` (Nature/Ambient/Rhythm), and every node, Sound Library row, and Mixer header colors itself by that category — matching the prototype's teal/violet/amber node rings exactly.
- **The orbit motif** (`OrbitGlyph.swift`): the concentric-rings-with-dots mark from the Welcome screen is a single reusable view, reused again as each Saved Layout's thumbnail — exactly as the prototype does.
- **Waveform art** (`WaveformGlyph.swift`): a real bar-waveform view (not an SF Symbol) used as every node/row's icon, and — scaled up and animated — as the full-width background art on Community cards, genuinely pulsing while a card is playing rather than being static artwork.
- **Auth screens** (`AuraLabeledField.swift`): the dark rounded field with an uppercase caption label, replacing the plain system `Form` the first draft used.
- **Canvas**: faint orbit-guide rings, a glowing listener orb, and a floating circular "+" button (replacing a plain toolbar item) — plus the prototype's actual two-step interaction (tap a node to select it, then tap the "Mix · &lt;name&gt;" bar that appears to open the Mixer), rather than one tap jumping straight there.

### The one advanced technique that's genuinely real now

The first draft's `SoundNodeView` had a comment claiming a `matchedGeometryEffect` hero transition into the Mixer that was never actually implemented — a real discrepancy, caught and called out rather than left in. It's fixed by using `matchedGeometryEffect` for something it can actually do: when you tap a different node, the dashed "selected" ring visually **glides** from the old node to the new one instead of just fading in and out, tagged to a shared `@Namespace` in `CanvasView`. (A `.sheet`, like the Mixer, presents in a separate view hierarchy, so `matchedGeometryEffect` genuinely cannot animate across that boundary — that's a real SwiftUI limitation, not a shortcut taken here.)

## Course-material and advanced-technique traceability

Every screen uses layouts taught in the course modules (`VStack`/`HStack`/`ZStack`, `TextField`, `Toggle`/`Slider`, `.sheet`, `NavigationStack`). Beyond that, this build showcases, per the SRS Section 3.6:

- `@Observable` (Observation framework) instead of `ObservableObject`/`@Published` in every Controller.
- `PhaseAnimator` for the listener's ambient pulse and the animated Community waveform (`CanvasView.swift`, `WaveformGlyph.swift`).
- `matchedGeometryEffect` for the selection ring gliding between canvas nodes (`SoundNodeView.swift`) — see above for why this, specifically, is where it's used.
- Real spatial audio DSP via `AVAudioEngine` + `AVAudioEnvironmentNode` + procedurally generated `AVAudioPCMBuffer`s (`Audio/`), not a bundled sound file.
- `.sensoryFeedback` haptics on node selection and Community play/pause.
- A protocol-oriented repository pattern (`SoundscapeRepository`, `AuthRepository`, `CommunityRepository`) so the finals-phase Firebase swap touches zero View code.
- Custom `ButtonStyle`s (primary pill, secondary pill, floating action button) rather than only system styles.
- Swift Concurrency (`async`/`await`) throughout every Controller-to-Repository call.

## One deliberate difference from the Figma Make prototype

The prototype's "Overwrite" button was found (via QA logged in the SRS Appendix B) to update the on-screen timestamp without persisting it. This Xcode build's `SavedLayoutsView` → `SavedLayoutsController.overwrite(_:with:)` always writes through `SoundscapeRepository` and then re-fetches, so the same bug can't occur here — worth mentioning in your Learning Reflection as something you caught and fixed between the prototype and the real implementation.
