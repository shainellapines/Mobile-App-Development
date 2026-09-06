//
//  SpatialAudioEngine.swift
//  AuraSpatial
//
//  Wraps AVAudioEngine + AVAudioEnvironmentNode to give every SoundNode
//  real-time distance-based attenuation and angle-based panning
//  (FR-3.1, FR-3.2), driven by procedurally generated buffers from
//  ToneGenerator (FR-3.3). This is the piece of the app that goes past
//  what the course materials covered (SRS Section 3.6).
//

import AVFAudio
import Foundation

@MainActor
final class SpatialAudioEngine {
    private let engine = AVAudioEngine()
    private let environment = AVAudioEnvironmentNode()
    private var players: [UUID: AVAudioPlayerNode] = [:]

    init() {
        engine.attach(environment)
        engine.connect(environment, to: engine.mainMixerNode, format: nil)
        environment.listenerPosition = AVAudio3DPoint(x: 0, y: 0, z: 0)
        environment.renderingAlgorithm = .auto
        try? engine.start()
    }

    /// Adds a looping player node for `node`'s sound and starts it playing.
    func addNode(_ node: SoundNode, asset: SoundAsset) {
        let player = AVAudioPlayerNode()
        engine.attach(player)
        let format = engine.outputNode.outputFormat(forBus: 0)
        engine.connect(player, to: environment, format: format)

        player.renderingAlgorithm = .auto
        applyPosition(node, to: player)

        let buffer = ToneGenerator.buffer(for: asset, format: format)
        player.scheduleBuffer(buffer, at: nil, options: .loops)
        player.play()

        players[node.id] = player
    }

    /// Recomputes a node's 3D position from its canvas offset (FR-3.1, FR-3.2).
    func updatePosition(for node: SoundNode) {
        guard let player = players[node.id] else { return }
        applyPosition(node, to: player)
    }

    func setVolume(_ volume: Double, for nodeID: UUID) {
        players[nodeID]?.volume = Float(volume)
    }

    func removeNode(id: UUID) {
        guard let player = players[id] else { return }
        player.stop()
        engine.detach(player)
        players.removeValue(forKey: id)
    }

    func removeAllNodes() {
        for id in players.keys {
            removeNode(id: id)
        }
    }

    /// Scales the canvas's normalized [-1, 1] offsets into a 3D position
    /// around the listener at the origin. Distance drives attenuation,
    /// angle drives pan - both handled internally by AVAudioEnvironmentNode.
    private func applyPosition(_ node: SoundNode, to player: AVAudioPlayerNode) {
        let scale: Float = 10
        player.position = AVAudio3DPoint(
            x: Float(node.x) * scale,
            y: Float(node.y) * scale,
            z: 0
        )
        player.volume = Float(node.volumeBias)
    }
}
