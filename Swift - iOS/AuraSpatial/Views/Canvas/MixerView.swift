//
//  MixerView.swift
//  AuraSpatial
//
//  Screen 6 (SRS Section 5): the Granular Mixer sheet - fine control over
//  one node, independent of its canvas position. Rebuilt with the
//  category-colored icon avatar and themed sliders matching the prototype;
//  stays a native `.sheet` (the prototype's own drag-handle confirms it's a
//  real system sheet, not a custom overlay).
//

import SwiftUI

struct MixerView: View {
    @Environment(CanvasController.self) private var canvasController
    @Environment(\.dismiss) private var dismiss

    @State private var volume: Double
    @State private var panBias: Double
    @State private var isLooping: Bool

    private let node: SoundNode

    private var asset: SoundAsset? {
        SoundAsset.library.first { $0.id == node.soundAssetID }
    }

    private var accentColor: Color {
        asset?.category.accentColor ?? .auraViolet
    }

    init(node: SoundNode) {
        self.node = node
        _volume = State(initialValue: node.volumeBias)
        _panBias = State(initialValue: node.panBias)
        _isLooping = State(initialValue: node.isLooping)
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.auraBackground.ignoresSafeArea()

                VStack(alignment: .leading, spacing: 28) {
                    HStack(spacing: 14) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 14)
                                .fill(Color.auraSurface)
                                .frame(width: 56, height: 56)
                            WaveformGlyph(color: accentColor)
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text(node.displayName)
                                .font(.title3.weight(.bold))
                                .foregroundStyle(.white)
                            if let category = asset?.category {
                                Text(category.label)
                                    .font(.caption.weight(.bold))
                                    .tracking(0.6)
                                    .foregroundStyle(accentColor)
                            }
                        }
                    }

                    sliderRow(icon: "speaker.wave.2.fill", label: "Volume", value: $volume, range: 0...1, tint: accentColor, valueText: "\(Int(volume * 100))")
                    sliderRow(icon: "arrow.left.arrow.right", label: "Pan", value: $panBias, range: -1...1, tint: accentColor, valueText: panBias < 0 ? "L \(Int(abs(panBias) * 100))" : "R \(Int(panBias * 100))")

                    HStack {
                        Image(systemName: "repeat")
                            .foregroundStyle(.auraTextSecondary)
                        Text("Loop")
                            .foregroundStyle(.white)
                        Spacer()
                        Toggle("", isOn: $isLooping)
                            .labelsHidden()
                            .tint(accentColor)
                    }

                    Spacer()

                    Button("Done") {
                        canvasController.updateVolume(volume, panBias: panBias, isLooping: isLooping, for: node.id)
                        dismiss()
                    }
                    .buttonStyle(.primaryAura)
                }
                .padding(24)
            }
            .navigationBarHidden(true)
        }
    }

    private func sliderRow(icon: String, label: String, value: Binding<Double>, range: ClosedRange<Double>, tint: Color, valueText: String) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: icon)
                    .foregroundStyle(.auraTextSecondary)
                Text(label)
                    .foregroundStyle(.white)
                Spacer()
                Text(valueText)
                    .foregroundStyle(tint)
                    .font(.subheadline.weight(.semibold))
            }
            Slider(value: value, in: range)
                .tint(tint)
        }
    }
}
