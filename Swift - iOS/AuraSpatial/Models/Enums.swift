//
//  Enums.swift
//  AuraSpatial
//
//  Shared enums used across the Model layer. Kept free of any SwiftUI
//  import - color/visual mapping for SoundCategory lives in
//  Utilities/Theme.swift instead, so this file stays pure Foundation.
//

import Foundation

/// Waveform shape used by the on-device procedural tone generator (FR-3.3).
/// AuraSpatial synthesizes every loop at runtime instead of bundling or
/// downloading audio files for the midterm.
enum WaveformType: String, Codable, CaseIterable, Identifiable {
    case sine
    case triangle
    case whiteNoise

    var id: Self { self }
}

/// The three Sound Library categories shown as a small uppercase label
/// under every node/card in the prototype (NATURE / AMBIENT / RHYTHM).
enum SoundCategory: String, Codable, CaseIterable, Identifiable {
    case nature = "Nature"
    case ambient = "Ambient"
    case rhythm = "Rhythm"

    var id: Self { self }

    var label: String { rawValue.uppercased() }
}
