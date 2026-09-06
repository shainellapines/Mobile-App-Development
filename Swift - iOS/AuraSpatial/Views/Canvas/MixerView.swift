//
//  MixerView.swift
//  AuraSpatial
//
//  Screen 6 (SRS Section 5): the Granular Mixer sheet - fine control over
//  one node, independent of its canvas position.
//

import SwiftUI

struct MixerView: View {
    @Environment(CanvasController.self) private var canvasController
    @Environment(\.dismiss) private var dismiss

    @State private var volume: Double
    @State private var panBias: Double
    @State private var isLooping: Bool

    private let node: SoundNode

    init(node: SoundNode) {
        self.node = node
        _volume = State(initialValue: node.volumeBias)
        _panBias = State(initialValue: node.panBias)
        _isLooping = State(initialValue: node.isLooping)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section(node.displayName) {
                    LabeledContent("Volume") {
                        Slider(value: $volume, in: 0...1)
                    }
                    LabeledContent("Pan Bias") {
                        Slider(value: $panBias, in: -1...1)
                    }
                    Toggle("Loop", isOn: $isLooping)
                }
            }
            .navigationTitle("Mixer")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        canvasController.updateVolume(volume, panBias: panBias, isLooping: isLooping, for: node.id)
                        dismiss()
                    }
                }
            }
        }
    }
}
