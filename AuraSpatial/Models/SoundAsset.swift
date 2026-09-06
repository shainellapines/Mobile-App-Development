//
//  SoundAsset.swift
//  AuraSpatial
//
//  A catalog entry in the Sound Library (FR-2.3). Each asset describes how
//  to *synthesize* its loop on-device via ToneGenerator (FR-3.3), rather
//  than pointing at a bundled or downloaded audio file.
//

import Foundation

struct SoundAsset: Identifiable, Codable, Hashable {
    let id: UUID
    let name: String
    let systemImageName: String
    let waveform: WaveformType
    /// Base frequency in Hz for tonal waveforms; ignored for `.whiteNoise`.
    let baseFrequency: Double

    init(
        id: UUID = UUID(),
        name: String,
        systemImageName: String,
        waveform: WaveformType,
        baseFrequency: Double
    ) {
        self.id = id
        self.name = name
        self.systemImageName = systemImageName
        self.waveform = waveform
        self.baseFrequency = baseFrequency
    }
}

extension SoundAsset {
    /// The midterm Sound Library catalog (Section 5, Screen 5 of the SRS).
    static let library: [SoundAsset] = [
        SoundAsset(name: "Rain", systemImageName: "cloud.rain.fill", waveform: .whiteNoise, baseFrequency: 0),
        SoundAsset(name: "Ocean Waves", systemImageName: "water.waves", waveform: .sine, baseFrequency: 110),
        SoundAsset(name: "Distant Thunder", systemImageName: "cloud.bolt.fill", waveform: .triangle, baseFrequency: 60),
        SoundAsset(name: "Wind Chimes", systemImageName: "wind", waveform: .sine, baseFrequency: 660),
        SoundAsset(name: "Campfire", systemImageName: "flame.fill", waveform: .whiteNoise, baseFrequency: 0),
        SoundAsset(name: "Night Crickets", systemImageName: "leaf.fill", waveform: .triangle, baseFrequency: 440)
    ]
}
