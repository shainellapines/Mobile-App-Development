//
//  SoundNode.swift
//  AuraSpatial
//
//  One sound placed on the Spatial Canvas (FR-2.1-2.4). Position is stored
//  as a normalized offset from the listener at the origin, so it survives
//  across different canvas sizes.
//

import Foundation

struct SoundNode: Identifiable, Codable, Hashable {
    let id: UUID
    var soundAssetID: UUID
    var displayName: String
    /// Horizontal offset from the listener, roughly in [-1, 1].
    var x: Double
    /// Vertical offset from the listener, roughly in [-1, 1].
    var y: Double
    /// Manual gain layered on top of distance-based attenuation (0...1).
    var volumeBias: Double
    /// Manual left/right nudge layered on top of angle-based panning (-1...1).
    var panBias: Double
    var isLooping: Bool

    init(
        id: UUID = UUID(),
        soundAssetID: UUID,
        displayName: String,
        x: Double,
        y: Double,
        volumeBias: Double = 0.8,
        panBias: Double = 0,
        isLooping: Bool = true
    ) {
        self.id = id
        self.soundAssetID = soundAssetID
        self.displayName = displayName
        self.x = x
        self.y = y
        self.volumeBias = volumeBias
        self.panBias = panBias
        self.isLooping = isLooping
    }

    /// Distance from the listener at the origin (FR-3.1).
    var distanceFromListener: Double {
        (x * x + y * y).squareRoot()
    }

    /// Angle from the listener, in radians — drives stereo/3D panning (FR-3.2).
    var angleFromListener: Double {
        atan2(y, x)
    }
}
