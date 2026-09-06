//
//  SoundAsset.swift
//  AuraSpatial
//
//  A catalog entry in the Sound Library (FR-2.3). Each asset describes how
//  to *synthesize* its loop on-device via ToneGenerator (FR-3.3), rather
//  than pointing at a bundled or downloaded audio file. `category` drives
//  the accent color and label shown on every node/card, matching the
//  prototype's NATURE/AMBIENT/RHYTHM system.
//

import Foundation

struct SoundAsset: Identifiable, Codable, Hashable {
    let id: UUID
    let name: String
    let systemImageName: String
    let waveform: WaveformType
    /// Base frequency in Hz for tonal waveforms; ignored for `.whiteNoise`.
    let baseFrequency: Double
    let category: SoundCategory

    init(
        id: UUID = UUID(),
        name: String,
        systemImageName: String,
        waveform: WaveformType,
        baseFrequency: Double,
        category: SoundCategory
    ) {
        self.id = id
        self.name = name
        self.systemImageName = systemImageName
        self.waveform = waveform
        self.baseFrequency = baseFrequency
        self.category = category
    }
}

extension SoundAsset {
    /// The midterm Sound Library catalog (Section 5, Screen 5 of the SRS).
    static let library: [SoundAsset] = [
        SoundAsset(name: "Rain", systemImageName: "cloud.rain.fill", waveform: .whiteNoise, baseFrequency: 0, category: .nature),
        SoundAsset(name: "Ocean Waves", systemImageName: "water.waves", waveform: .sine, baseFrequency: 110, category: .nature),
        SoundAsset(name: "Distant Thunder", systemImageName: "cloud.bolt.fill", waveform: .triangle, baseFrequency: 60, category: .ambient),
        SoundAsset(name: "Wind Chimes", systemImageName: "wind", waveform: .sine, baseFrequency: 660, category: .ambient),
        SoundAsset(name: "Campfire", systemImageName: "flame.fill", waveform: .whiteNoise, baseFrequency: 0, category: .rhythm),
        SoundAsset(name: "Night Crickets", systemImageName: "leaf.fill", waveform: .triangle, baseFrequency: 440, category: .nature)
    ]
}
