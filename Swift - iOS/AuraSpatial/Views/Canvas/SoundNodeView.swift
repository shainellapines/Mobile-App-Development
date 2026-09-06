//
//  SoundNodeView.swift
//  AuraSpatial
//
//  One orbiting sound node on the Canvas - a reusable component (SRS
//  Section 3.1) that also anchors the hero transition into MixerView via
//  matchedGeometryEffect.
//

import SwiftUI

struct SoundNodeView: View {
    let node: SoundNode
    let isSelected: Bool

    private var asset: SoundAsset? {
        SoundAsset.library.first { $0.id == node.soundAssetID }
    }

    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .fill(.purple.opacity(0.85))
                    .frame(width: 52, height: 52)
                    .overlay(
                        Circle().stroke(.white, lineWidth: isSelected ? 2 : 0)
                    )
                Image(systemName: asset?.systemImageName ?? "waveform")
                    .foregroundStyle(.white)
            }
            Text(node.displayName)
                .font(.caption2)
                .foregroundStyle(.white)
        }
        .shadow(radius: isSelected ? 6 : 2)
        .animation(.spring(duration: 0.25), value: isSelected)
    }
}
