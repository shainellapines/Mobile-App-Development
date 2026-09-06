//
//  LocalCommunityStore.swift
//  AuraSpatial
//
//  Midterm implementation of CommunityRepository: a bundled sample feed
//  (FR-5.1) matching the four demo soundscapes verified in the Figma Make
//  prototype (Jungle Immersion, Midnight Drive, Underwater, Industrial Loft).
//

import Foundation

final class LocalCommunityStore: CommunityRepository {
    func fetchFeed() async throws -> [Soundscape] {
        Self.sample
    }

    private static func nodes(count: Int) -> [SoundNode] {
        (0..<count).map { index in
            let asset = SoundAsset.library[index % SoundAsset.library.count]
            return SoundNode(
                soundAssetID: asset.id,
                displayName: asset.name,
                x: Double.random(in: -0.8...0.8),
                y: Double.random(in: -0.8...0.8)
            )
        }
    }

    private static let sample: [Soundscape] = [
        Soundscape(name: "Jungle Immersion", nodes: nodes(count: 6), creatorUsername: "mara_sounds", likeCount: 234, forkCount: 41),
        Soundscape(name: "Midnight Drive", nodes: nodes(count: 4), creatorUsername: "synth_wolf", likeCount: 189, forkCount: 27),
        Soundscape(name: "Underwater", nodes: nodes(count: 5), creatorUsername: "ambient_kay", likeCount: 312, forkCount: 58),
        Soundscape(name: "Industrial Loft", nodes: nodes(count: 7), creatorUsername: "noisewright", likeCount: 145, forkCount: 19)
    ]
}
