//
//  CanvasController.swift
//  AuraSpatial
//
//  The Controller for the Spatial Canvas (SRS Section 3.4): owns the active
//  node list and selection state, and drives SpatialAudioEngine in response
//  to placement/position changes (FR-2.1-2.4, FR-3.1-3.3).
//

import Foundation
import Observation
import CoreGraphics

@Observable
final class CanvasController {
    private(set) var nodes: [SoundNode] = []
    var selectedNodeID: UUID?

    private let audioEngine: SpatialAudioEngine
    private let maxNodes = 6

    var canAddNode: Bool { nodes.count < maxNodes }

    init(audioEngine: SpatialAudioEngine = SpatialAudioEngine()) {
        self.audioEngine = audioEngine
    }

    /// Adds a node from the Sound Library at a default position near the
    /// listener, then starts it playing (FR-2.3).
    func addNode(from asset: SoundAsset) {
        guard canAddNode else { return }
        let angle = Double(nodes.count) * (.pi * 2 / Double(maxNodes))
        let node = SoundNode(
            soundAssetID: asset.id,
            displayName: asset.name,
            x: 0.5 * cos(angle),
            y: 0.5 * sin(angle)
        )
        nodes.append(node)
        audioEngine.addNode(node, asset: asset)
    }

    /// Called continuously while a node is being dragged (FR-2.4).
    func moveNode(id: UUID, to translation: CGSize, canvasSize: CGSize) {
        guard let index = nodes.firstIndex(where: { $0.id == id }) else { return }
        let normalizedDX = Double(translation.width / canvasSize.width) * 2
        let normalizedDY = Double(translation.height / canvasSize.height) * 2
        nodes[index].x = clamp(nodes[index].x + normalizedDX, to: -1...1)
        nodes[index].y = clamp(nodes[index].y + normalizedDY, to: -1...1)
        audioEngine.updatePosition(for: nodes[index])
    }

    func updateVolume(_ volume: Double, panBias: Double, isLooping: Bool, for id: UUID) {
        guard let index = nodes.firstIndex(where: { $0.id == id }) else { return }
        nodes[index].volumeBias = volume
        nodes[index].panBias = panBias
        nodes[index].isLooping = isLooping
        audioEngine.setVolume(volume, for: id)
    }

    func removeNode(id: UUID) {
        nodes.removeAll { $0.id == id }
        audioEngine.removeNode(id: id)
        if selectedNodeID == id { selectedNodeID = nil }
    }

    /// Replaces the whole canvas with a saved or forked layout's nodes -
    /// used when opening a Saved Layout, or right after a Fork.
    func loadLayout(_ soundscape: Soundscape) {
        audioEngine.removeAllNodes()
        nodes = soundscape.nodes
        for node in nodes {
            if let asset = SoundAsset.library.first(where: { $0.id == node.soundAssetID }) {
                audioEngine.addNode(node, asset: asset)
            }
        }
    }

    func node(with id: UUID?) -> SoundNode? {
        guard let id else { return nil }
        return nodes.first { $0.id == id }
    }

    private func clamp(_ value: Double, to range: ClosedRange<Double>) -> Double {
        min(max(value, range.lowerBound), range.upperBound)
    }
}
