//
//  Enums.swift
//  AuraSpatial
//
//  Shared enums used across the Model layer.
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
