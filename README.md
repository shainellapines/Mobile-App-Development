# AuraSpatial — Xcode Project Source

This is the full Model/View/Controller source for the AuraSpatial midterm build, matching the SRS (`AuraSpatial SRS v2.0`) and the verified Figma Make prototype.

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
│   └── AuraSpatialApp.swift          — app entry point, injects AuthController
├── Models/                            — plain Codable structs/enums (the "Model" in MVC)
│   ├── Enums.swift
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
│   │   └── RootTabView.swift          — TabView: Canvas · Community · Saved
│   ├── Auth/
│   │   ├── WelcomeView.swift          — Screen 1
│   │   ├── SignUpView.swift           — Screen 2
│   │   └── LogInView.swift            — Screen 3
│   ├── Canvas/
│   │   ├── CanvasView.swift           — Screen 4 (main screen)
│   │   ├── SoundNodeView.swift        — reusable node component
│   │   └── MixerView.swift            — Screen 6 (sheet)
│   ├── Library/
│   │   └── SoundLibraryView.swift     — Screen 5 (sheet)
│   ├── Saved/
│   │   └── SavedLayoutsView.swift     — Screen 7
│   ├── Community/
│   │   ├── CommunityFeedView.swift    — Screen 8
│   │   └── CommunitySoundscapeCardView.swift — reusable card component
│   └── Profile/
│       └── ProfileView.swift          — Screen 9 (sheet)
└── Utilities/
    └── ButtonStyles.swift             — custom ButtonStyle (advanced-SwiftUI showcase)
```

## Course-material and advanced-technique traceability

Every screen uses layouts taught in the course modules (`VStack`/`HStack`/`ZStack`, `Form`, `List`, `TextField`, `Picker`-style `Toggle`/`Slider`, `.sheet`, `NavigationStack`). Beyond that, this build showcases, per the SRS Section 3.6:

- `@Observable` (Observation framework) instead of `ObservableObject`/`@Published` in every Controller.
- `PhaseAnimator` for the listener's ambient pulse (`CanvasView.swift`).
- Real spatial audio DSP via `AVAudioEngine` + `AVAudioEnvironmentNode` + procedurally generated `AVAudioPCMBuffer`s (`Audio/`), not a bundled sound file.
- `.sensoryFeedback` haptics on node selection and Community play/pause.
- A protocol-oriented repository pattern (`SoundscapeRepository`, `AuthRepository`, `CommunityRepository`) so the finals-phase Firebase swap touches zero View code.
- Custom `ButtonStyle`s rather than only system styles.
- Swift Concurrency (`async`/`await`) throughout every Controller-to-Repository call.

## One deliberate difference from the Figma Make prototype

The prototype's "Overwrite" button was found (via QA logged in the SRS Appendix B) to update the on-screen timestamp without persisting it. This Xcode build's `SavedLayoutsView` → `SavedLayoutsController.overwrite(_:with:)` always writes through `SoundscapeRepository` and then re-fetches, so the same bug can't occur here — worth mentioning in your Learning Reflection as something you caught and fixed between the prototype and the real implementation.
